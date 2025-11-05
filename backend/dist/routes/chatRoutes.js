"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// Proteger todas as rotas de chat com autenticação
router.use(authMiddleware_1.authMiddleware);
// Listar e criar conversas
router.get('/conversations', (req, res) => chatController_1.chatController.listConversations(req, res));
router.post('/conversations', (req, res) => chatController_1.chatController.createConversation(req, res));
// Listar mensagens de uma conversa
router.get('/conversations/:id/messages', (req, res) => chatController_1.chatController.listMessages(req, res));
// Enviar nova mensagem
router.post('/messages', (req, res) => chatController_1.chatController.createMessage(req, res));
// Enviar anexo (multipart/form-data com field "file")
router.post('/messages/attachments', upload.single('file'), (req, res) => chatController_1.chatController.uploadAttachment(req, res));
exports.default = router;
