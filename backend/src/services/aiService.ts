import { PrismaClient } from '@prisma/client';
import { TicketStatus } from '../types/ticket.types';
import { Priority } from '../types/common.types';

const prisma = new PrismaClient();

export interface TicketAnalysisResult {
  suggestedPriority: Priority;
  confidence: number;
  reasoning: string[];
  historicalPatterns: {
    similarTickets: number;
    averageResolutionTime: number;
    commonResolution: string | null;
  };
}

export interface EquipmentFailurePrediction {
  equipmentId: number;
  equipmentLabel: string;
  equipmentType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  predictedFailureDate: Date | null;
  recommendations: string[];
  factors: {
    age: number;
    recentIncidents: number;
    totalIncidents: number;
    status: string;
  };
}

export class AIService {
  /**
   * Analisa um ticket e sugere prioridade baseada em dados históricos
   */
  async analyzeTicketPriority(
    title: string,
    description: string,
    category: string,
    providerId: number
  ): Promise<TicketAnalysisResult> {
    try {
      // Buscar tickets similares históricos
      const historicalTickets = await this.findSimilarTickets(title, description, category, providerId);

      // Analisar padrões de palavras-chave críticas
      const criticalKeywords = this.extractCriticalKeywords(title, description);

      // Calcular score de prioridade baseado em múltiplos fatores
      const priorityScore = this.calculatePriorityScore({
        criticalKeywords,
        historicalTickets,
        category
      });

      // Determinar prioridade sugerida
      const suggestedPriority = this.scoreToPriority(priorityScore.score);

      // Calcular estatísticas históricas
      const historicalPatterns = await this.calculateHistoricalPatterns(historicalTickets);

      return {
        suggestedPriority,
        confidence: priorityScore.confidence,
        reasoning: priorityScore.reasoning,
        historicalPatterns
      };
    } catch (error) {
      console.error('Erro na análise de prioridade do ticket:', error);
      // Fallback para prioridade média com baixa confiança
      return {
        suggestedPriority: 'medium',
        confidence: 0.1,
        reasoning: ['Análise automática indisponível - classificação manual recomendada'],
        historicalPatterns: {
          similarTickets: 0,
          averageResolutionTime: 0,
          commonResolution: null
        }
      };
    }
  }

  /**
   * Prevê possíveis falhas em equipamentos baseado em histórico
   */
  async predictEquipmentFailures(providerId: number): Promise<EquipmentFailurePrediction[]> {
    try {
      const equipments = await prisma.equipment.findMany({
        where: { providerId }
      });

      const predictions: EquipmentFailurePrediction[] = [];

      for (const equipment of equipments) {
        const prediction = await this.analyzeEquipmentRisk(equipment);
        if (prediction.riskLevel !== 'low' || prediction.probability > 0.3) {
          predictions.push(prediction);
        }
      }

      // Ordenar por nível de risco e probabilidade
      return predictions.sort((a, b) => {
        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel] || b.probability - a.probability;
      });
    } catch (error) {
      console.error('Erro na previsão de falhas:', error);
      return [];
    }
  }

  /**
   * Busca tickets similares baseado em título, descrição e categoria
   */
  private async findSimilarTickets(
    title: string,
    description: string,
    category: string,
    providerId: number
  ) {
    // Extrair palavras-chave principais
    const keywords = this.extractKeywords(title + ' ' + description);

    // Buscar tickets com palavras-chave similares (removendo filtro por categoria já que não existe no schema)
    const tickets = await prisma.ticket.findMany({
      where: {
        providerId,
        status: { in: ['resolved', 'closed'] },
        OR: keywords.map(keyword => ({
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } }
          ]
        }))
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    return tickets;
  }

  /**
   * Extrai palavras-chave críticas que indicam alta prioridade
   */
  private extractCriticalKeywords(title: string, description: string): string[] {
    const text = (title + ' ' + description).toLowerCase();

    const criticalPatterns = [
      // Urgência
      'urgente', 'crítico', 'emergência', 'parado', 'fora do ar',
      'sem internet', 'sem conexão', 'indisponível', 'offline',

      // Impacto
      'todos os clientes', 'múltiplos usuários', 'rede completa',
      'servidor principal', 'backbone', 'fibra óptica',

      // Problemas graves
      'incêndio', 'fumaça', 'superaquecimento', 'curto-circuito',
      'vazamento', 'rompimento', 'queda de energia',

      // Equipamentos críticos
      'olt', 'switch principal', 'roteador core', 'servidor dns',
      'dhcp', 'radius', 'firewall'
    ];

    return criticalPatterns.filter(pattern => text.includes(pattern));
  }

  /**
   * Extrai palavras-chave gerais para busca de similaridade
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Remover palavras comuns (stop words)
    const stopWords = ['para', 'com', 'sem', 'por', 'que', 'não', 'uma', 'dos', 'das', 'como'];

    const uniqueWords = Array.from(new Set(words.filter(word => !stopWords.includes(word))));
    return uniqueWords.slice(0, 10);
  }

  /**
   * Calcula score de prioridade baseado em múltiplos fatores
   */
  private calculatePriorityScore(factors: {
    criticalKeywords: string[];
    historicalTickets: any[];
    category: string;
  }) {
    let score = 0;
    const reasoning: string[] = [];
    let confidence = 0.5;

    // Fator 1: Palavras-chave críticas (peso: 40%)
    const keywordScore = Math.min(factors.criticalKeywords.length * 0.3, 1.0);
    score += keywordScore * 0.4;

    if (factors.criticalKeywords.length > 0) {
      reasoning.push(`Palavras-chave críticas detectadas: ${factors.criticalKeywords.join(', ')}`);
      confidence += 0.2;
    }

    // Fator 2: Categoria do ticket (peso: 20%)
    const categoryWeights: { [key: string]: number } = {
      'technical': 0.8,
      'incident': 0.9,
      'maintenance': 0.6,
      'installation': 0.4,
      'billing': 0.2,
      'commercial': 0.2,
      'complaint': 0.3,
      'request': 0.1,
      'change': 0.5,
      'other': 0.3
    };

    const categoryScore = categoryWeights[factors.category] || 0.3;
    score += categoryScore * 0.2;

    if (categoryScore > 0.6) {
      reasoning.push(`Categoria "${factors.category}" indica alta prioridade`);
    }

    // Fator 3: Padrões históricos (peso: 40%)
    if (factors.historicalTickets.length > 0) {
      const highPriorityCount = factors.historicalTickets.filter(
        t => t.priority === 'high' || t.priority === 'critical'
      ).length;

      const historicalScore = highPriorityCount / factors.historicalTickets.length;
      score += historicalScore * 0.4;

      if (historicalScore > 0.5) {
        reasoning.push(`${Math.round(historicalScore * 100)}% dos tickets similares tiveram alta prioridade`);
        confidence += 0.2;
      }

      confidence += Math.min(factors.historicalTickets.length / 10, 0.3);
    } else {
      reasoning.push('Poucos dados históricos disponíveis para comparação');
      confidence -= 0.1;
    }

    return {
      score: Math.min(score, 1.0),
      confidence: Math.max(0.1, Math.min(confidence, 1.0)),
      reasoning
    };
  }

  /**
   * Converte score numérico para prioridade
   */
  private scoreToPriority(score: number): Priority {
    if (score >= 0.8) return 'urgent';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calcula padrões históricos de tickets similares
   */
  private async calculateHistoricalPatterns(tickets: any[]) {
    if (tickets.length === 0) {
      return {
        similarTickets: 0,
        averageResolutionTime: 0,
        commonResolution: null
      };
    }

    // Calcular tempo médio de resolução baseado em tickets fechados
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    let averageResolutionTime = 0;

    if (resolvedTickets.length > 0) {
      const totalTime = resolvedTickets.reduce((sum, ticket) => {
        // Usar updatedAt como aproximação para tempo de resolução
        const resolutionTime = new Date(ticket.updatedAt).getTime() - new Date(ticket.createdAt).getTime();
        return sum + resolutionTime;
      }, 0);

      averageResolutionTime = Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60)); // em horas
    }

    return {
      similarTickets: tickets.length,
      averageResolutionTime,
      commonResolution: null // TODO: Implementar análise de resoluções comuns
    };
  }

  /**
   * Analisa o risco de falha de um equipamento específico
   */
  private async analyzeEquipmentRisk(equipment: any): Promise<EquipmentFailurePrediction> {
    // Buscar tickets relacionados ao equipamento através do provider
    const relatedTickets = await prisma.ticket.findMany({
      where: {
        providerId: equipment.providerId,
        // Assumindo que tickets podem estar relacionados ao equipamento por descrição ou título
        OR: [
          { description: { contains: equipment.serial, mode: 'insensitive' } },
          { description: { contains: equipment.label, mode: 'insensitive' } },
          { title: { contains: equipment.serial, mode: 'insensitive' } },
          { title: { contains: equipment.label, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentTickets = relatedTickets.filter(ticket => ticket.createdAt >= thirtyDaysAgo);

    // Calcular fatores de risco
    const ageInDays = Math.floor((now.getTime() - equipment.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const recentTicketCount = recentTickets.length;
    const totalTicketCount = relatedTickets.length;

    // Fatores de risco baseados no tipo de equipamento
    const equipmentRiskFactors: Record<string, number> = {
      server: 0.3,
      switch: 0.2,
      router: 0.25,
      olt: 0.35,
      virtualizer: 0.15,
      other: 0.2
    };

    const baseRisk = equipmentRiskFactors[equipment.type as string] || 0.2;
    const ageRisk = Math.min(ageInDays / 1825, 1) * 0.3; // 5 anos = risco máximo por idade
    const ticketRisk = Math.min(recentTicketCount / 10, 1) * 0.4; // 10+ tickets recentes = risco máximo

    const probability = Math.min(baseRisk + ageRisk + ticketRisk, 1);

    // Determinar nível de risco
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (probability >= 0.8) riskLevel = 'critical';
    else if (probability >= 0.6) riskLevel = 'high';
    else if (probability >= 0.4) riskLevel = 'medium';
    else riskLevel = 'low';

    // Gerar recomendações
    const recommendations = this.generateMaintenanceRecommendations(equipment, probability, recentTicketCount);

    return {
      equipmentId: equipment.id,
      equipmentLabel: equipment.label,
      equipmentType: equipment.type,
      riskLevel,
      probability: Math.round(probability * 100) / 100,
      predictedFailureDate: new Date(now.getTime() + (1 - probability) * 365 * 24 * 60 * 60 * 1000),
      recommendations,
      factors: {
        age: ageInDays,
        recentIncidents: recentTicketCount,
        totalIncidents: totalTicketCount,
        status: equipment.status
      }
    };
  }

  /**
   * Gera recomendações de manutenção baseadas no risco do equipamento
   */
  private generateMaintenanceRecommendations(equipment: any, probability: number, recentTicketCount: number): string[] {
    const recommendations: string[] = [];

    // Recomendações baseadas na probabilidade de falha
    if (probability >= 0.8) {
      recommendations.push('URGENTE: Substituição imediata do equipamento recomendada');
      recommendations.push('Agendar manutenção de emergência nas próximas 24 horas');
    } else if (probability >= 0.6) {
      recommendations.push('Agendar manutenção preventiva na próxima semana');
      recommendations.push('Verificar logs e métricas de performance');
    } else if (probability >= 0.4) {
      recommendations.push('Incluir na próxima manutenção programada');
      recommendations.push('Monitorar mais frequentemente');
    }

    // Recomendações baseadas no número de tickets recentes
    if (recentTicketCount > 5) {
      recommendations.push(`${recentTicketCount} incidentes recentes - investigar padrão de falhas`);
    }

    // Recomendações baseadas no tipo de equipamento
    switch (equipment.type) {
      case 'server':
        recommendations.push('Verificar temperatura e ventilação');
        recommendations.push('Analisar logs de sistema e performance');
        break;
      case 'olt':
        recommendations.push('Verificar conexões de fibra óptica');
        recommendations.push('Testar portas e módulos SFP');
        break;
      case 'switch':
        recommendations.push('Verificar portas e cabos de rede');
        recommendations.push('Analisar tráfego e utilização');
        break;
      case 'router':
        recommendations.push('Verificar configurações de roteamento');
        recommendations.push('Analisar latência e perda de pacotes');
        break;
    }

    // Recomendações baseadas na idade
    const ageInYears = Math.floor((Date.now() - equipment.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365));
    if (ageInYears > 5) {
      recommendations.push(`Equipamento com ${ageInYears} anos - considerar atualização`);
    }

    return recommendations.length > 0 ? recommendations : ['Manutenção preventiva regular'];
  }
}

export const aiService = new AIService();