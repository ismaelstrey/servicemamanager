import { Router } from 'express';
import multer from 'multer';
import { chatController } from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Proteger todas as rotas de chat com autenticação
router.use(authMiddleware);

// Listar e criar conversas
router.get('/conversations', (req, res) => chatController.listConversations(req as any, res));
router.post('/conversations', (req, res) => chatController.createConversation(req as any, res));

// Listar mensagens de uma conversa
router.get('/conversations/:id/messages', (req, res) => chatController.listMessages(req as any, res));

// Enviar nova mensagem
router.post('/messages', (req, res) => chatController.createMessage(req as any, res));

// Enviar anexo (multipart/form-data com field "file")
router.post('/messages/attachments', upload.single('file'), (req, res) => chatController.uploadAttachment(req as any, res));

export default router;