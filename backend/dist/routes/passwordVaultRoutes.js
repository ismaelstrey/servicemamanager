"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passwordVaultController_1 = require("../controllers/passwordVaultController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const passwordVaultValidator_1 = require("../validators/passwordVaultValidator");
const router = (0, express_1.Router)();
const controller = new passwordVaultController_1.PasswordVaultController();
// Protegidas: exigem autenticação
router.get('/:providerId/passwords', authMiddleware_1.authMiddleware, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.providerIdParamSchema), (0, passwordVaultValidator_1.validateQuery)(passwordVaultValidator_1.listPasswordVaultsSchema), (req, res) => controller.list(req, res));
router.post('/:providerId/passwords', authMiddleware_1.authMiddleware, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.providerIdParamSchema), (0, passwordVaultValidator_1.validateSchema)(passwordVaultValidator_1.createPasswordVaultSchema), (req, res) => controller.create(req, res));
// CRUD por ID
router.get('/passwords/:id', authMiddleware_1.authMiddleware, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.vaultIdParamSchema), (req, res) => controller.getById(req, res));
router.put('/passwords/:id', authMiddleware_1.authMiddleware, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.vaultIdParamSchema), (0, passwordVaultValidator_1.validateSchema)(passwordVaultValidator_1.updatePasswordVaultSchema), (req, res) => controller.update(req, res));
router.delete('/passwords/:id', authMiddleware_1.authMiddleware, (0, passwordVaultValidator_1.validateParams)(passwordVaultValidator_1.vaultIdParamSchema), (req, res) => controller.delete(req, res));
exports.default = router;
