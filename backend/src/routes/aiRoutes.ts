import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticação para todas as rotas de IA
router.use(authMiddleware);

/**
 * @swagger
 * /api/ai/analyze-ticket:
 *   post:
 *     summary: Analisa um ticket e sugere prioridade usando IA
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - providerId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título do ticket
 *               description:
 *                 type: string
 *                 description: Descrição detalhada do problema
 *               category:
 *                 type: string
 *                 enum: [technical, incident, maintenance, installation, billing, commercial, complaint, request, change, other]
 *                 description: Categoria do ticket
 *               providerId:
 *                 type: integer
 *                 description: ID do provedor
 *     responses:
 *       200:
 *         description: Análise concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestedPriority:
 *                       type: string
 *                       enum: [low, medium, high, critical]
 *                     confidence:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 1
 *                     reasoning:
 *                       type: array
 *                       items:
 *                         type: string
 *                     historicalPatterns:
 *                       type: object
 *                       properties:
 *                         similarTickets:
 *                           type: integer
 *                         averageResolutionTime:
 *                           type: number
 *                         commonResolution:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/analyze-ticket', aiController.analyzeTicket.bind(aiController));

/**
 * @swagger
 * /api/ai/predict-failures/{providerId}:
 *   get:
 *     summary: Prevê falhas em equipamentos usando IA
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Previsão concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     predictions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           equipmentId:
 *                             type: integer
 *                           riskLevel:
 *                             type: string
 *                             enum: [low, medium, high, critical]
 *                           probability:
 *                             type: number
 *                           predictedFailureDate:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           recommendedActions:
 *                             type: array
 *                             items:
 *                               type: string
 *                           factors:
 *                             type: object
 *                             properties:
 *                               age:
 *                                 type: number
 *                               ticketFrequency:
 *                                 type: number
 *                               lastMaintenanceDate:
 *                                 type: string
 *                                 format: date-time
 *                                 nullable: true
 *                               criticalIssues:
 *                                 type: number
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalEquipments:
 *                           type: integer
 *                         criticalRisk:
 *                           type: integer
 *                         highRisk:
 *                           type: integer
 *                         mediumRisk:
 *                           type: integer
 *       400:
 *         description: ID do provedor inválido
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/predict-failures/:providerId', aiController.predictFailures.bind(aiController));

/**
 * @swagger
 * /api/ai/insights/{providerId}:
 *   get:
 *     summary: Obtém insights de IA para dashboard
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Insights obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     equipmentHealth:
 *                       type: object
 *                       properties:
 *                         totalAnalyzed:
 *                           type: integer
 *                         riskDistribution:
 *                           type: object
 *                           properties:
 *                             critical:
 *                               type: integer
 *                             high:
 *                               type: integer
 *                             medium:
 *                               type: integer
 *                             low:
 *                               type: integer
 *                         upcomingFailures:
 *                           type: integer
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           action:
 *                             type: string
 *                           priority:
 *                             type: string
 *                     alerts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           severity:
 *                             type: string
 *                           title:
 *                             type: string
 *                           message:
 *                             type: string
 *                           equipments:
 *                             type: array
 *                             items:
 *                               type: integer
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: ID do provedor inválido
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/insights/:providerId', aiController.getInsights.bind(aiController));

// Rotas de Machine Learning
/**
 * @swagger
 * /api/ai/ml/train/{providerId}:
 *   post:
 *     summary: Treina o modelo de ML com dados históricos
 *     tags: [AI - Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Modelo treinado com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/ml/train/:providerId', aiController.trainMLModel.bind(aiController));

/**
 * @swagger
 * /api/ai/ml/classify-ticket:
 *   post:
 *     summary: Classifica um ticket usando ML
 *     tags: [AI - Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - providerId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               providerId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ticket classificado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/ml/classify-ticket', aiController.classifyTicket.bind(aiController));

/**
 * @swagger
 * /api/ai/ml/historical-patterns/{providerId}:
 *   get:
 *     summary: Analisa padrões históricos usando ML
 *     tags: [AI - Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do provedor
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Número de dias para análise
 *     responses:
 *       200:
 *         description: Padrões analisados com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/ml/historical-patterns/:providerId', aiController.analyzeHistoricalPatterns.bind(aiController));

// Rotas de Predição de Falhas
/**
 * @swagger
 * /api/ai/equipment/health/{providerId}:
 *   get:
 *     summary: Analisa saúde dos equipamentos
 *     tags: [AI - Equipment Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Análise de saúde concluída
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/equipment/health/:providerId', aiController.analyzeEquipmentHealth.bind(aiController));

/**
 * @swagger
 * /api/ai/equipment/predict-failure/{equipmentId}:
 *   get:
 *     summary: Prevê falha de equipamento específico
 *     tags: [AI - Equipment Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equipmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do equipamento
 *     responses:
 *       200:
 *         description: Previsão realizada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/equipment/predict-failure/:equipmentId', aiController.predictEquipmentFailure.bind(aiController));

/**
 * @swagger
 * /api/ai/equipment/maintenance-schedule/{providerId}:
 *   get:
 *     summary: Gera cronograma de manutenção preditiva
 *     tags: [AI - Equipment Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Cronograma gerado com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/equipment/maintenance-schedule/:providerId', aiController.generateMaintenanceSchedule.bind(aiController));

/**
 * @swagger
 * /api/ai/equipment/detect-anomalies/{providerId}:
 *   get:
 *     summary: Detecta anomalias em equipamentos
 *     tags: [AI - Equipment Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Anomalias detectadas com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/equipment/detect-anomalies/:providerId', aiController.detectAnomalies.bind(aiController));

// Rotas de Chat Inteligente
/**
 * @swagger
 * /api/ai/chat/start:
 *   post:
 *     summary: Inicia uma sessão de chat inteligente
 *     tags: [AI - Intelligent Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - providerId
 *               - userId
 *             properties:
 *               providerId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               context:
 *                 type: object
 *                 description: Contexto inicial da conversa
 *     responses:
 *       200:
 *         description: Sessão iniciada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/chat/start', aiController.startChatSession.bind(aiController));

/**
 * @swagger
 * /api/ai/chat/message:
 *   post:
 *     summary: Processa mensagem no chat inteligente
 *     tags: [AI - Intelligent Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - message
 *             properties:
 *               sessionId:
 *                 type: string
 *               message:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Mensagem processada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/chat/message', aiController.processChatMessage.bind(aiController));

/**
 * @swagger
 * /api/ai/chat/find-solution:
 *   post:
 *     summary: Busca solução automática para problema
 *     tags: [AI - Intelligent Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - problem
 *               - providerId
 *             properties:
 *               problem:
 *                 type: string
 *               providerId:
 *                 type: integer
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Solução encontrada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/chat/find-solution', aiController.findAutomaticSolution.bind(aiController));

/**
 * @swagger
 * /api/ai/chat/suggestions/{providerId}:
 *   get:
 *     summary: Gera sugestões proativas
 *     tags: [AI - Intelligent Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Sugestões geradas com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/chat/suggestions/:providerId', aiController.generateProactiveSuggestions.bind(aiController));

/**
 * @swagger
 * /api/ai/chat/end/{sessionId}:
 *   post:
 *     summary: Encerra sessão de chat
 *     tags: [AI - Intelligent Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da sessão
 *     responses:
 *       200:
 *         description: Sessão encerrada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/chat/end/:sessionId', aiController.endChatSession.bind(aiController));

export default router;