"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privacyService = exports.PrivacyService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
const auditLogger_1 = require("../utils/auditLogger");
const logsDir = path_1.default.join(process.cwd(), 'logs');
const consentLogFile = path_1.default.join(logsDir, 'privacy-consent.log');
const erasureLogFile = path_1.default.join(logsDir, 'privacy-erasure.log');
function ensureLogsDir() {
    try {
        if (!fs_1.default.existsSync(logsDir))
            fs_1.default.mkdirSync(logsDir, { recursive: true });
    }
    catch { /* ignore */ }
}
class PrivacyService {
    async recordConsent(userId, consent) {
        ensureLogsDir();
        const entry = { timestamp: new Date().toISOString(), userId, consent };
        try {
            fs_1.default.appendFileSync(consentLogFile, JSON.stringify(entry) + '\n');
        }
        catch { /* ignore */ }
        (0, auditLogger_1.logAudit)({
            action: 'consent_update',
            resource: 'privacy',
            userId: String(userId),
            success: true,
            metadata: { consent }
        });
        // Caso exista campo de consentimento no schema, persistir:
        try {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { /* @ts-ignore */ consent: consent }
            }).catch(() => Promise.resolve());
        }
        catch { /* ignore */ }
        return { success: true };
    }
    async requestErasure(userId) {
        ensureLogsDir();
        const entry = { timestamp: new Date().toISOString(), userId, type: 'erasure_request' };
        try {
            fs_1.default.appendFileSync(erasureLogFile, JSON.stringify(entry) + '\n');
        }
        catch { /* ignore */ }
        (0, auditLogger_1.logAudit)({
            action: 'dsr_erasure_requested',
            resource: 'privacy',
            userId: String(userId),
            success: true
        });
        // Baseline de anonimização: remover PII de comentários e tickets se campos existirem
        try {
            await prisma_1.prisma.comment.updateMany({
                where: { userId },
                data: { /* @ts-ignore */ authorName: 'ANON', authorEmail: null }
            }).catch(() => Promise.resolve());
            await prisma_1.prisma.ticket.updateMany({
                where: { userId },
                data: { /* @ts-ignore */ requesterName: 'ANON', requesterEmail: null }
            }).catch(() => Promise.resolve());
        }
        catch { /* ignore */ }
        return { success: true };
    }
}
exports.PrivacyService = PrivacyService;
exports.privacyService = new PrivacyService();
