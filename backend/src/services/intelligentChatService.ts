import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    ticketId?: number;
    equipmentId?: number;
    providerId?: number;
    confidence?: number;
    suggestedActions?: string[];
  };
}

export interface ChatSession {
  id: string;
  userId: number;
  providerId: number;
  context: {
    ticketId?: number;
    equipmentId?: number;
    category?: string;
    priority?: string;
  };
  messages: ChatMessage[];
  status: 'active' | 'resolved' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMResponse {
  response: string;
  confidence: number;
  suggestedActions: string[];
  escalationNeeded: boolean;
  relatedTickets: number[];
  knowledgeBaseArticles: string[];
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  relevanceScore?: number;
  lastUpdated: Date;
}

export class IntelligentChatService {
  private activeSessions: Map<string, ChatSession> = new Map();
  private knowledgeBase: KnowledgeBaseEntry[] = [];

  /**
   * Inicia uma nova sessão de chat
   */
  async startChatSession(
    userId: number,
    providerId: number,
    context?: {
      ticketId?: number;
      equipmentId?: number;
      category?: string;
      priority?: string;
    }
  ): Promise<ChatSession> {
    try {
      const sessionId = this.generateSessionId();
      
      const session: ChatSession = {
        id: sessionId,
        userId,
        providerId,
        context: context || {},
        messages: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Adicionar mensagem de boas-vindas contextual
      const welcomeMessage = await this.generateWelcomeMessage(context, providerId);
      session.messages.push({
        id: this.generateMessageId(),
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      });

      this.activeSessions.set(sessionId, session);
      
      // Salvar sessão no banco de dados
      await this.saveChatSession(session);

      return session;
    } catch (error) {
      console.error('Erro ao iniciar sessão de chat:', error);
      throw error;
    }
  }

  /**
   * Processa uma mensagem do usuário e gera resposta inteligente
   */
  async processMessage(
    sessionId: string,
    userMessage: string
  ): Promise<{
    response: ChatMessage;
    session: ChatSession;
  }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Sessão de chat não encontrada');
      }

      // Adicionar mensagem do usuário
      const userMsg: ChatMessage = {
        id: this.generateMessageId(),
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      session.messages.push(userMsg);

      // Analisar intenção e contexto
      const intent = await this.analyzeUserIntent(userMessage, session.context);
      
      // Buscar informações relevantes
      const contextData = await this.gatherContextualData(session, intent);
      
      // Gerar resposta usando LLM
      const llmResponse = await this.generateLLMResponse(userMessage, session, contextData);
      
      // Criar mensagem de resposta
      const assistantMsg: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: llmResponse.response,
        timestamp: new Date(),
        metadata: {
          confidence: llmResponse.confidence,
          suggestedActions: llmResponse.suggestedActions,
          ticketId: session.context.ticketId,
          equipmentId: session.context.equipmentId,
          providerId: session.providerId
        }
      };
      session.messages.push(assistantMsg);

      // Verificar se precisa de escalação
      if (llmResponse.escalationNeeded) {
        session.status = 'escalated';
        await this.escalateToHuman(session, llmResponse);
      }

      session.updatedAt = new Date();
      await this.updateChatSession(session);

      return {
        response: assistantMsg,
        session
      };
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      throw error;
    }
  }

  /**
   * Busca soluções automáticas para problemas comuns
   */
  async findAutomaticSolution(
    problem: string,
    equipmentType?: string,
    category?: string
  ): Promise<{
    solution?: string;
    steps: string[];
    confidence: number;
    estimatedTime: number;
    requiresTechnician: boolean;
  }> {
    try {
      // Buscar na base de conhecimento
      const knowledgeResults = await this.searchKnowledgeBase(problem, category);
      
      // Buscar soluções similares em tickets resolvidos
      const similarTickets = await this.findSimilarResolvedTickets(problem, equipmentType);
      
      // Analisar padrões de solução
      const solutionPattern = this.analyzeSolutionPatterns(similarTickets);
      
      // Gerar solução automática
      const automaticSolution = this.generateAutomaticSolution(
        knowledgeResults,
        solutionPattern,
        problem
      );

      return automaticSolution;
    } catch (error) {
      console.error('Erro ao buscar solução automática:', error);
      return {
        steps: ['Encaminhar para técnico especializado'],
        confidence: 0.1,
        estimatedTime: 60,
        requiresTechnician: true
      };
    }
  }

  /**
   * Gera sugestões proativas baseadas no contexto
   */
  async generateProactiveSuggestions(
    providerId: number,
    context?: {
      equipmentId?: number;
      recentTickets?: any[];
      timeOfDay?: number;
    }
  ): Promise<{
    suggestions: Array<{
      type: 'maintenance' | 'optimization' | 'prevention' | 'training';
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      estimatedImpact: string;
    }>;
    insights: string[];
  }> {
    try {
      const suggestions: Array<{
        type: 'maintenance' | 'optimization' | 'prevention' | 'training';
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        estimatedImpact: string;
      }> = [];
      const insights: string[] = [];

      // Analisar padrões recentes
      const recentPatterns = await this.analyzeRecentPatterns(providerId);
      
      // Sugestões de manutenção preventiva
      if (context?.equipmentId) {
        const maintenanceSuggestions = await this.generateMaintenanceSuggestions(context.equipmentId);
        suggestions.push(...maintenanceSuggestions);
      }

      // Sugestões baseadas em horário
      if (context?.timeOfDay) {
        const timeBased = this.generateTimeBasedSuggestions(context.timeOfDay, recentPatterns);
        suggestions.push(...timeBased);
      }

      // Insights baseados em dados históricos
      const historicalInsights = await this.generateHistoricalInsights(providerId);
      insights.push(...historicalInsights);

      return { suggestions, insights };
    } catch (error) {
      console.error('Erro ao gerar sugestões proativas:', error);
      return { suggestions: [], insights: [] };
    }
  }

  /**
   * Analisa sentimento e satisfação do usuário
   */
  analyzeSentiment(message: string): {
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotions: string[];
    satisfactionLevel: number; // 0-10
  } {
    const text = message.toLowerCase();
    
    // Palavras indicativas de sentimento
    const positiveWords = ['obrigado', 'ótimo', 'excelente', 'perfeito', 'funcionou', 'resolvido'];
    const negativeWords = ['problema', 'erro', 'não funciona', 'ruim', 'péssimo', 'urgente'];
    const frustrationWords = ['demora', 'lento', 'sempre', 'nunca', 'impossível'];

    let positiveScore = 0;
    let negativeScore = 0;
    let frustrationScore = 0;

    positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++;
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++;
    });

    frustrationWords.forEach(word => {
      if (text.includes(word)) frustrationScore++;
    });

    // Determinar sentimento
    let sentiment: 'positive' | 'neutral' | 'negative';
    let satisfactionLevel: number;

    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      satisfactionLevel = Math.min(10, 6 + positiveScore);
    } else if (negativeScore > positiveScore || frustrationScore > 0) {
      sentiment = 'negative';
      satisfactionLevel = Math.max(0, 4 - negativeScore - frustrationScore);
    } else {
      sentiment = 'neutral';
      satisfactionLevel = 5;
    }

    const confidence = Math.min(1, (positiveScore + negativeScore + frustrationScore) / 3);
    
    const emotions = [];
    if (frustrationScore > 0) emotions.push('frustração');
    if (positiveScore > 0) emotions.push('satisfação');
    if (negativeScore > 0) emotions.push('insatisfação');

    return {
      sentiment,
      confidence,
      emotions,
      satisfactionLevel
    };
  }

  /**
   * Finaliza uma sessão de chat
   */
  async endChatSession(
    sessionId: string,
    resolution?: string,
    satisfaction?: number
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      session.status = 'resolved';
      session.updatedAt = new Date();

      // Adicionar mensagem de encerramento
      if (resolution) {
        const closingMsg: ChatMessage = {
          id: this.generateMessageId(),
          role: 'assistant',
          content: `Sessão encerrada. ${resolution}`,
          timestamp: new Date(),
          metadata: {
            providerId: session.providerId
          }
        };
        session.messages.push(closingMsg);
      }

      // Salvar dados da sessão para análise
      await this.saveChatAnalytics(session, satisfaction);
      
      // Atualizar base de conhecimento se necessário
      await this.updateKnowledgeBase(session);

      // Remover da memória
      this.activeSessions.delete(sessionId);
      
      // Atualizar no banco
      await this.updateChatSession(session);
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      throw error;
    }
  }

  // Métodos privados auxiliares

  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateWelcomeMessage(context: any, providerId: number): Promise<string> {
    let message = 'Olá! Sou seu assistente inteligente de suporte técnico. ';
    
    if (context?.ticketId) {
      message += `Vejo que você tem o ticket #${context.ticketId} em aberto. `;
    }
    
    if (context?.equipmentId) {
      const equipment = await this.getEquipmentInfo(context.equipmentId);
      message += `Posso ajudar com questões relacionadas ao ${equipment?.label || 'equipamento'}. `;
    }
    
    message += 'Como posso ajudá-lo hoje?';
    
    return message;
  }

  private async analyzeUserIntent(message: string, context: any): Promise<{
    intent: string;
    entities: { [key: string]: string };
    confidence: number;
  }> {
    const text = message.toLowerCase();
    
    // Intenções básicas
    if (text.includes('problema') || text.includes('erro') || text.includes('não funciona')) {
      return { intent: 'report_issue', entities: {}, confidence: 0.8 };
    }
    
    if (text.includes('como') || text.includes('tutorial') || text.includes('ajuda')) {
      return { intent: 'request_help', entities: {}, confidence: 0.7 };
    }
    
    if (text.includes('status') || text.includes('andamento')) {
      return { intent: 'check_status', entities: {}, confidence: 0.9 };
    }
    
    return { intent: 'general_inquiry', entities: {}, confidence: 0.5 };
  }

  private async gatherContextualData(session: ChatSession, intent: any) {
    const data: any = {};
    
    // Buscar dados do ticket se disponível
    if (session.context.ticketId) {
      data.ticket = await this.getTicketInfo(session.context.ticketId);
    }
    
    // Buscar dados do equipamento se disponível
    if (session.context.equipmentId) {
      data.equipment = await this.getEquipmentInfo(session.context.equipmentId);
    }
    
    // Buscar tickets similares
    data.similarTickets = await this.findSimilarTickets(session.providerId, intent);
    
    return data;
  }

  private async generateLLMResponse(
    userMessage: string,
    session: ChatSession,
    contextData: any
  ): Promise<LLMResponse> {
    // Simulação de resposta LLM - em produção, integrar com OpenAI, Claude, etc.
    
    const response = this.generateContextualResponse(userMessage, contextData);
    const confidence = this.calculateResponseConfidence(userMessage, contextData);
    const suggestedActions = this.generateSuggestedActions(userMessage, contextData);
    const escalationNeeded = this.shouldEscalate(userMessage, confidence, session);
    
    return {
      response,
      confidence,
      suggestedActions,
      escalationNeeded,
      relatedTickets: contextData.similarTickets?.map((t: any) => t.id) || [],
      knowledgeBaseArticles: []
    };
  }

  private generateContextualResponse(userMessage: string, contextData: any): string {
    const text = userMessage.toLowerCase();
    
    // Respostas baseadas em contexto
    if (text.includes('internet') || text.includes('conexão')) {
      return 'Vou ajudá-lo com o problema de conexão. Primeiro, vamos verificar alguns pontos básicos:\n\n1. Verifique se todos os cabos estão conectados corretamente\n2. Reinicie o modem/roteador\n3. Teste a conexão em outro dispositivo\n\nPoderia me informar se algum desses passos resolve o problema?';
    }
    
    if (text.includes('lento') || text.includes('velocidade')) {
      return 'Entendo que está enfrentando problemas de velocidade. Vamos diagnosticar:\n\n1. Faça um teste de velocidade em speedtest.net\n2. Verifique quantos dispositivos estão conectados\n3. Reinicie seu equipamento\n\nQual é a velocidade contratada e qual está obtendo no teste?';
    }
    
    if (contextData.ticket) {
      return `Vejo que você tem o ticket #${contextData.ticket.id} sobre "${contextData.ticket.title}". Posso ajudar a acompanhar o andamento ou esclarecer dúvidas sobre este chamado.`;
    }
    
    return 'Entendi sua solicitação. Para melhor ajudá-lo, poderia fornecer mais detalhes sobre o problema que está enfrentando?';
  }

  private calculateResponseConfidence(userMessage: string, contextData: any): number {
    let confidence = 0.5; // Base
    
    // Aumentar confiança se há contexto
    if (contextData.ticket) confidence += 0.2;
    if (contextData.equipment) confidence += 0.1;
    if (contextData.similarTickets?.length > 0) confidence += 0.2;
    
    return Math.min(1, confidence);
  }

  private generateSuggestedActions(userMessage: string, contextData: any): string[] {
    const actions = [];
    const text = userMessage.toLowerCase();
    
    if (text.includes('internet') || text.includes('conexão')) {
      actions.push('Verificar cabos e conexões');
      actions.push('Reiniciar equipamentos');
      actions.push('Testar em outro dispositivo');
    }
    
    if (contextData.ticket?.priority === 'high' || contextData.ticket?.priority === 'critical') {
      actions.push('Escalar para técnico especializado');
    }
    
    actions.push('Documentar problema detalhadamente');
    
    return actions;
  }

  private shouldEscalate(userMessage: string, confidence: number, session: ChatSession): boolean {
    // Escalar se confiança muito baixa
    if (confidence < 0.3) return true;
    
    // Escalar se usuário expressa frustração
    const sentiment = this.analyzeSentiment(userMessage);
    if (sentiment.sentiment === 'negative' && sentiment.satisfactionLevel < 3) return true;
    
    // Escalar se muitas mensagens sem resolução
    if (session.messages.length > 10) return true;
    
    return false;
  }

  private async searchKnowledgeBase(query: string, category?: string): Promise<KnowledgeBaseEntry[]> {
    // Implementação simplificada - em produção usar busca semântica
    return this.knowledgeBase.filter(entry => {
      const matchesQuery = entry.content.toLowerCase().includes(query.toLowerCase()) ||
                          entry.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !category || entry.category === category;
      
      return matchesQuery && matchesCategory;
    }).slice(0, 5);
  }

  private async findSimilarResolvedTickets(problem: string, equipmentType?: string) {
    return await prisma.ticket.findMany({
      where: {
        status: 'resolved',
        OR: [
          { title: { contains: problem, mode: 'insensitive' } },
          { description: { contains: problem, mode: 'insensitive' } }
        ],
        ...(equipmentType && {
          equipment: {
            type: equipmentType
          }
        })
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    });
  }

  private analyzeSolutionPatterns(tickets: any[]) {
    const patterns = {
      commonSolutions: new Map<string, number>(),
      avgResolutionTime: 0,
      successRate: 0
    };
    
    // Análise simplificada
    tickets.forEach(ticket => {
      if (ticket.resolution) {
        const solution = ticket.resolution.toLowerCase();
        patterns.commonSolutions.set(solution, (patterns.commonSolutions.get(solution) || 0) + 1);
      }
    });
    
    return patterns;
  }

  private generateAutomaticSolution(
    knowledgeResults: KnowledgeBaseEntry[],
    solutionPattern: any,
    problem: string
  ) {
    const steps = [];
    let confidence = 0.5;
    let estimatedTime = 30;
    let requiresTechnician = false;

    if (knowledgeResults.length > 0) {
      const bestMatch = knowledgeResults[0];
      steps.push(...bestMatch.content.split('\n').filter(line => line.trim()));
      confidence += 0.3;
    } else {
      steps.push('Verificar configurações básicas');
      steps.push('Reiniciar equipamento');
      steps.push('Contatar suporte se problema persistir');
      requiresTechnician = true;
    }

    return {
      steps,
      confidence: Math.min(1, confidence),
      estimatedTime,
      requiresTechnician
    };
  }

  // Métodos de persistência e busca de dados
  private async getTicketInfo(ticketId: number) {
    return await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { provider: true }
    });
  }

  private async getEquipmentInfo(equipmentId: number) {
    return await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { provider: true }
    });
  }

  private async findSimilarTickets(providerId: number, intent: any) {
    return await prisma.ticket.findMany({
      where: { providerId },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
  }

  private async saveChatSession(session: ChatSession) {
    // Implementar salvamento no banco
    console.log(`Salvando sessão ${session.id}`);
  }

  private async updateChatSession(session: ChatSession) {
    // Implementar atualização no banco
    console.log(`Atualizando sessão ${session.id}`);
  }

  private async escalateToHuman(session: ChatSession, llmResponse: LLMResponse) {
    // Implementar escalação para atendente humano
    console.log(`Escalando sessão ${session.id} para atendimento humano`);
  }

  private async saveChatAnalytics(session: ChatSession, satisfaction?: number) {
    // Implementar salvamento de analytics
    console.log(`Salvando analytics da sessão ${session.id}`);
  }

  private async updateKnowledgeBase(session: ChatSession) {
    // Implementar atualização da base de conhecimento
    console.log(`Atualizando base de conhecimento com dados da sessão ${session.id}`);
  }

  private async analyzeRecentPatterns(providerId: number) {
    // Implementar análise de padrões recentes
    return {};
  }

  private async generateMaintenanceSuggestions(equipmentId: number) {
    // Implementar geração de sugestões de manutenção
    return [];
  }

  private generateTimeBasedSuggestions(timeOfDay: number, patterns: any) {
    // Implementar sugestões baseadas em horário
    return [];
  }

  private async generateHistoricalInsights(providerId: number) {
    // Implementar geração de insights históricos
    return [];
  }
}

export const intelligentChatService = new IntelligentChatService();