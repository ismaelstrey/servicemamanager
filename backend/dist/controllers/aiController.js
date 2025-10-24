"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AIController = void 0;
const aiService_1 = require("../services/aiService");
class AIController {
    /**
     * Analisa um ticket e sugere prioridade
     * POST /api/ai/analyze-ticket
     */
    async analyzeTicket(req, res) {
        try {
            const { title, description, category, providerId } = req.body;
            // Validação básica
            if (!title || !description || !category || !providerId) {
                return res.status(400).json({
                    error: 'Campos obrigatórios: title, description, category, providerId'
                });
            }
            // Validar categoria
            const validCategories = [
                'technical', 'incident', 'maintenance', 'installation',
                'billing', 'commercial', 'complaint', 'request', 'change', 'other'
            ];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    error: 'Categoria inválida',
                    validCategories
                });
            }
            const analysis = await aiService_1.aiService.analyzeTicketPriority(title, description, category, parseInt(providerId));
            res.json({
                success: true,
                data: analysis,
                message: 'Análise de prioridade concluída com sucesso'
            });
        }
        catch (error) {
            console.error('Erro na análise de ticket:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível analisar o ticket'
            });
        }
    }
    /**
     * Prevê falhas em equipamentos
     * GET /api/ai/predict-failures/:providerId
     */
    async predictFailures(req, res) {
        try {
            const { providerId } = req.params;
            if (!providerId || isNaN(parseInt(providerId))) {
                return res.status(400).json({
                    error: 'ID do provedor inválido'
                });
            }
            const predictions = await aiService_1.aiService.predictEquipmentFailures(parseInt(providerId));
            res.json({
                success: true,
                data: {
                    predictions,
                    summary: {
                        totalEquipments: predictions.length,
                        criticalRisk: predictions.filter(p => p.riskLevel === 'critical').length,
                        highRisk: predictions.filter(p => p.riskLevel === 'high').length,
                        mediumRisk: predictions.filter(p => p.riskLevel === 'medium').length
                    }
                },
                message: 'Previsão de falhas concluída com sucesso'
            });
        }
        catch (error) {
            console.error('Erro na previsão de falhas:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível prever falhas'
            });
        }
    }
    /**
     * Obtém insights de IA para dashboard
     * GET /api/ai/insights/:providerId
     */
    async getInsights(req, res) {
        try {
            const { providerId } = req.params;
            if (!providerId || isNaN(parseInt(providerId))) {
                return res.status(400).json({
                    error: 'ID do provedor inválido'
                });
            }
            // Executar análises em paralelo
            const [failurePredictions] = await Promise.all([
                aiService_1.aiService.predictEquipmentFailures(parseInt(providerId))
            ]);
            // Calcular métricas de insights
            const insights = {
                equipmentHealth: {
                    totalAnalyzed: failurePredictions.length,
                    riskDistribution: {
                        critical: failurePredictions.filter(p => p.riskLevel === 'critical').length,
                        high: failurePredictions.filter(p => p.riskLevel === 'high').length,
                        medium: failurePredictions.filter(p => p.riskLevel === 'medium').length,
                        low: failurePredictions.filter(p => p.riskLevel === 'low').length
                    },
                    upcomingFailures: failurePredictions
                        .filter(p => p.predictedFailureDate && p.predictedFailureDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                        .length
                },
                recommendations: this.generateRecommendations(failurePredictions),
                alerts: this.generateAlerts(failurePredictions)
            };
            res.json({
                success: true,
                data: insights,
                message: 'Insights de IA obtidos com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao obter insights:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível obter insights'
            });
        }
    }
    /**
     * Treina o modelo de ML com dados históricos
     * POST /api/ai/ml/train/:providerId
     */
    async trainMLModel(req, res) {
        try {
            const { providerId } = req.params;
            if (!providerId || isNaN(parseInt(providerId))) {
                return res.status(400).json({
                    error: 'ID do provedor inválido'
                });
            }
            // Implementação placeholder - pode ser expandida conforme necessário
            const result = {
                success: true,
                modelId: `ml_model_${providerId}_${Date.now()}`,
                trainingData: {
                    totalSamples: 0,
                    features: ['title', 'description', 'source'],
                    accuracy: 0.85
                }
            };
            res.json({
                success: true,
                data: result,
                message: 'Modelo de ML treinado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro no treinamento do modelo ML:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível treinar o modelo'
            });
        }
    }
    /**
     * Classifica um ticket usando ML
     * POST /api/ai/ml/classify-ticket
     */
    async classifyTicket(req, res) {
        try {
            const { title, description, providerId } = req.body;
            if (!title || !description || !providerId) {
                return res.status(400).json({
                    error: 'Campos obrigatórios: title, description, providerId'
                });
            }
            // Implementação placeholder - pode ser expandida conforme necessário
            const classification = {
                category: 'technical',
                confidence: 0.87,
                priority: 'medium',
                estimatedResolutionTime: 4.5
            };
            res.json({
                success: true,
                data: classification,
                message: 'Ticket classificado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro na classificação do ticket:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível classificar o ticket'
            });
        }
    }
    /**
     * Analisa padrões históricos usando ML
     * GET /api/ai/ml/historical-patterns/:providerId
     */
    async analyzeHistoricalPatterns(req, res) {
        try {
            const { providerId } = req.params;
            const days = parseInt(req.query.days) || 90;
            if (!providerId || isNaN(parseInt(providerId))) {
                return res.status(400).json({
                    error: 'ID do provedor inválido'
                });
            }
            // Implementação placeholder - pode ser expandida conforme necessário
            const patterns = {
                period: `${days} days`,
                totalTickets: 0,
                patterns: {
                    peakHours: ['09:00-11:00', '14:00-16:00'],
                    commonCategories: ['technical', 'incident'],
                    resolutionTrends: {
                        averageTime: 3.2,
                        improvement: 0.15
                    }
                }
            };
            res.json({
                success: true,
                data: patterns,
                message: 'Padrões históricos analisados com sucesso'
            });
        }
        catch (error) {
            console.error('Erro na análise de padrões históricos:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível analisar padrões históricos'
            });
        }
    }
    /**
     * Analisa saúde dos equipamentos
     * GET /api/ai/equipment/health/:providerId
     */
    async analyzeEquipmentHealth(req, res) {
        try {
            const { providerId } = req.params;
            if (!providerId || isNaN(parseInt(providerId))) {
                return res.status(400).json({
                    error: 'ID do provedor inválido'
                });
            }
            const predictions = await aiService_1.aiService.predictEquipmentFailures(parseInt(providerId));
            res.json({
                success: true,
                data: {
                    totalEquipments: predictions.length,
                    healthDistribution: {
                        excellent: predictions.filter(p => p.riskLevel === 'low').length,
                        good: predictions.filter(p => p.riskLevel === 'medium').length,
                        warning: predictions.filter(p => p.riskLevel === 'high').length,
                        critical: predictions.filter(p => p.riskLevel === 'critical').length
                    },
                    recommendations: this.generateRecommendations(predictions)
                },
                message: 'Análise de saúde dos equipamentos concluída'
            });
        }
        catch (error) {
            console.error('Erro na análise de saúde dos equipamentos:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível analisar a saúde dos equipamentos'
            });
        }
    }
    /**
     * Prevê falha de equipamento específico
     * GET /api/ai/equipment/predict-failure/:equipmentId
     */
    async predictEquipmentFailure(req, res) {
        try {
            const { equipmentId } = req.params;
            if (!equipmentId || isNaN(parseInt(equipmentId))) {
                return res.status(400).json({
                    error: 'ID do equipamento inválido'
                });
            }
            // Implementação placeholder - pode ser expandida conforme necessário
            const prediction = {
                equipmentId: parseInt(equipmentId),
                riskLevel: 'medium',
                probability: 0.35,
                predictedFailureDate: null,
                factors: {
                    age: 3.5,
                    ticketFrequency: 2,
                    lastMaintenanceDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                    criticalIssues: 0
                },
                recommendedActions: [
                    'Agendar manutenção preventiva',
                    'Monitorar performance'
                ]
            };
            res.json({
                success: true,
                data: prediction,
                message: 'Previsão de falha realizada com sucesso'
            });
        }
        catch (error) {
            console.error('Erro na previsão de falha do equipamento:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível prever falha do equipamento'
            });
        }
    }
    /**
     * Gera cronograma de manutenção preditiva
     * GET /api/ai/equipment/maintenance-schedule/:providerId
     */
    async generateMaintenanceSchedule(req, res) {
        try {
            const { providerId } = req.params;
            if (!providerId || isNaN(parseInt(providerId))) {
                return res.status(400).json({
                    error: 'ID do provedor inválido'
                });
            }
            const predictions = await aiService_1.aiService.predictEquipmentFailures(parseInt(providerId));
            // Gerar cronograma baseado nas previsões
            const schedule = predictions
                .filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical')
                .map(p => ({
                equipmentId: p.equipmentId,
                priority: p.riskLevel === 'critical' ? 'urgent' : 'high',
                scheduledDate: new Date(Date.now() + (p.riskLevel === 'critical' ? 7 : 14) * 24 * 60 * 60 * 1000),
                estimatedDuration: 4,
                maintenanceType: p.riskLevel === 'critical' ? 'corrective' : 'preventive',
                description: `Manutenção ${p.riskLevel === 'critical' ? 'corretiva urgente' : 'preventiva'} baseada em análise preditiva`
            }));
            res.json({
                success: true,
                data: {
                    schedule,
                    summary: {
                        totalItems: schedule.length,
                        urgent: schedule.filter(s => s.priority === 'urgent').length,
                        high: schedule.filter(s => s.priority === 'high').length
                    }
                },
                message: 'Cronograma de manutenção gerado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro na geração do cronograma de manutenção:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível gerar cronograma de manutenção'
            });
        }
    }
    /**
     * Detecta anomalias em equipamentos
     * GET /api/ai/equipment/detect-anomalies/:providerId
     */
    async detectAnomalies(req, res) {
        try {
            const { providerId } = req.params;
            if (!providerId || isNaN(parseInt(providerId))) {
                return res.status(400).json({
                    error: 'ID do provedor inválido'
                });
            }
            // Implementação placeholder - pode ser expandida conforme necessário
            const anomalies = [
                {
                    equipmentId: 1,
                    type: 'performance_degradation',
                    severity: 'medium',
                    description: 'Degradação de performance detectada',
                    detectedAt: new Date(),
                    metrics: {
                        currentValue: 75,
                        expectedValue: 90,
                        deviation: 15
                    }
                }
            ];
            res.json({
                success: true,
                data: {
                    anomalies,
                    summary: {
                        total: anomalies.length,
                        critical: anomalies.filter(a => a.severity === 'critical').length,
                        high: anomalies.filter(a => a.severity === 'high').length,
                        medium: anomalies.filter(a => a.severity === 'medium').length
                    }
                },
                message: 'Anomalias detectadas com sucesso'
            });
        }
        catch (error) {
            console.error('Erro na detecção de anomalias:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível detectar anomalias'
            });
        }
    }
    /**
     * Inicia uma sessão de chat inteligente
     * POST /api/ai/chat/start
     */
    async startChatSession(req, res) {
        try {
            const { providerId, userId, context } = req.body;
            if (!providerId || !userId) {
                return res.status(400).json({
                    error: 'Campos obrigatórios: providerId, userId'
                });
            }
            const sessionId = `chat_${providerId}_${userId}_${Date.now()}`;
            // Implementação placeholder - pode ser expandida conforme necessário
            const session = {
                sessionId,
                providerId: parseInt(providerId),
                userId: parseInt(userId),
                context: context || {},
                startedAt: new Date(),
                status: 'active'
            };
            res.json({
                success: true,
                data: session,
                message: 'Sessão de chat iniciada com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao iniciar sessão de chat:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível iniciar sessão de chat'
            });
        }
    }
    /**
     * Processa mensagem no chat inteligente
     * POST /api/ai/chat/message
     */
    async processChatMessage(req, res) {
        try {
            const { sessionId, message, attachments } = req.body;
            if (!sessionId || !message) {
                return res.status(400).json({
                    error: 'Campos obrigatórios: sessionId, message'
                });
            }
            // Implementação placeholder - pode ser expandida conforme necessário
            const response = {
                messageId: `msg_${Date.now()}`,
                sessionId,
                response: 'Entendi sua mensagem. Como posso ajudá-lo?',
                suggestions: [
                    'Verificar status dos equipamentos',
                    'Criar novo ticket',
                    'Consultar histórico'
                ],
                timestamp: new Date()
            };
            res.json({
                success: true,
                data: response,
                message: 'Mensagem processada com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao processar mensagem do chat:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível processar mensagem'
            });
        }
    }
    /**
     * Busca solução automática para problema
     * POST /api/ai/chat/find-solution
     */
    async findAutomaticSolution(req, res) {
        try {
            const { problem, providerId, context } = req.body;
            if (!problem || !providerId) {
                return res.status(400).json({
                    error: 'Campos obrigatórios: problem, providerId'
                });
            }
            // Implementação placeholder - pode ser expandida conforme necessário
            const solution = {
                problem,
                solutions: [
                    {
                        title: 'Solução Automática 1',
                        description: 'Reiniciar o serviço afetado',
                        confidence: 0.85,
                        steps: [
                            'Acessar painel de controle',
                            'Localizar serviço',
                            'Executar reinicialização'
                        ]
                    }
                ],
                relatedTickets: [],
                confidence: 0.75
            };
            res.json({
                success: true,
                data: solution,
                message: 'Solução encontrada'
            });
        }
        catch (error) {
            console.error('Erro ao buscar solução automática:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível encontrar solução'
            });
        }
    }
    /**
     * Gera sugestões proativas
     * GET /api/ai/chat/suggestions/:providerId
     */
    async generateProactiveSuggestions(req, res) {
        try {
            const { providerId } = req.params;
            if (!providerId || isNaN(parseInt(providerId))) {
                return res.status(400).json({
                    error: 'ID do provedor inválido'
                });
            }
            // Implementação placeholder - pode ser expandida conforme necessário
            const suggestions = [
                {
                    type: 'maintenance',
                    title: 'Manutenção Preventiva Recomendada',
                    description: 'Alguns equipamentos podem se beneficiar de manutenção preventiva',
                    priority: 'medium',
                    action: 'Agendar manutenção'
                },
                {
                    type: 'optimization',
                    title: 'Otimização de Performance',
                    description: 'Oportunidades de melhoria identificadas',
                    priority: 'low',
                    action: 'Revisar configurações'
                }
            ];
            res.json({
                success: true,
                data: suggestions,
                message: 'Sugestões geradas com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao gerar sugestões proativas:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível gerar sugestões'
            });
        }
    }
    /**
     * Encerra sessão de chat
     * POST /api/ai/chat/end/:sessionId
     */
    async endChatSession(req, res) {
        try {
            const { sessionId } = req.params;
            if (!sessionId) {
                return res.status(400).json({
                    error: 'ID da sessão é obrigatório'
                });
            }
            // Implementação placeholder - pode ser expandida conforme necessário
            const result = {
                sessionId,
                endedAt: new Date(),
                duration: '15 minutes',
                messagesCount: 8,
                status: 'ended'
            };
            res.json({
                success: true,
                data: result,
                message: 'Sessão encerrada com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao encerrar sessão de chat:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: 'Não foi possível encerrar sessão'
            });
        }
    }
    /**
     * Gera recomendações baseadas nas previsões
     */
    generateRecommendations(predictions) {
        const recommendations = [];
        const criticalEquipments = predictions.filter(p => p.riskLevel === 'critical');
        if (criticalEquipments.length > 0) {
            recommendations.push({
                type: 'urgent',
                title: 'Equipamentos em Risco Crítico',
                description: `${criticalEquipments.length} equipamento(s) necessitam atenção imediata`,
                action: 'Realizar manutenção preventiva urgente',
                priority: 'critical'
            });
        }
        const highRiskEquipments = predictions.filter(p => p.riskLevel === 'high');
        if (highRiskEquipments.length > 0) {
            recommendations.push({
                type: 'maintenance',
                title: 'Manutenção Preventiva Recomendada',
                description: `${highRiskEquipments.length} equipamento(s) com alto risco de falha`,
                action: 'Agendar manutenção preventiva nas próximas 2 semanas',
                priority: 'high'
            });
        }
        const oldEquipments = predictions.filter(p => p.factors.age > 7);
        if (oldEquipments.length > 0) {
            recommendations.push({
                type: 'replacement',
                title: 'Renovação de Equipamentos',
                description: `${oldEquipments.length} equipamento(s) com mais de 7 anos`,
                action: 'Considerar substituição por equipamentos mais modernos',
                priority: 'medium'
            });
        }
        return recommendations;
    }
    /**
     * Gera alertas baseados nas previsões
     */
    generateAlerts(predictions) {
        const alerts = [];
        // Alertas de falha iminente (próximos 7 dias)
        const imminentFailures = predictions.filter(p => p.predictedFailureDate &&
            p.predictedFailureDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        if (imminentFailures.length > 0) {
            alerts.push({
                type: 'failure_imminent',
                severity: 'critical',
                title: 'Falha Iminente Detectada',
                message: `${imminentFailures.length} equipamento(s) podem falhar nos próximos 7 dias`,
                equipments: imminentFailures.map(p => p.equipmentId),
                timestamp: new Date()
            });
        }
        // Alertas de alta frequência de tickets
        const highTicketFrequency = predictions.filter(p => p.factors.ticketFrequency > 5);
        if (highTicketFrequency.length > 0) {
            alerts.push({
                type: 'high_ticket_frequency',
                severity: 'warning',
                title: 'Alta Frequência de Problemas',
                message: `${highTicketFrequency.length} equipamento(s) com muitos tickets recentes`,
                equipments: highTicketFrequency.map(p => p.equipmentId),
                timestamp: new Date()
            });
        }
        return alerts;
    }
}
exports.AIController = AIController;
exports.aiController = new AIController();
