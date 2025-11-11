"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const privacyService_1 = require("../services/privacyService");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(authMiddleware_1.authMiddleware);
// Atualizar consentimento do usuário autenticado
router.post('/consent', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Não autenticado' });
        const { consent } = req.body;
        if (typeof consent !== 'boolean')
            return res.status(400).json({ success: false, message: 'Campo consent inválido' });
        const result = await privacyService_1.privacyService.recordConsent(userId, consent);
        return res.status(200).json({ success: result.success });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Erro ao atualizar consentimento' });
    }
});
// Solicitar eliminação de dados (DSR)
router.post('/request-erasure', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Não autenticado' });
        const result = await privacyService_1.privacyService.requestErasure(userId);
        return res.status(202).json({ success: result.success, message: 'Solicitação registrada' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Erro ao registrar solicitação' });
    }
});
exports.default = router;
