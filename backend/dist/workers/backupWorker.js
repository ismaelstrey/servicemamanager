"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBackupWorker = startBackupWorker;
exports.stopBackupWorker = stopBackupWorker;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
let timer = null;
let started = false;
async function startBackupWorker() {
    const enabled = (process.env.BACKUP_ENABLED || 'true').toLowerCase() === 'true';
    if (!enabled || started)
        return;
    const intervalMs = parseInt(process.env.BACKUP_INTERVAL_MS || String(24 * 60 * 60 * 1000), 10); // 24h
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);
    const backupsDir = path_1.default.join(process.cwd(), 'logs', 'backups');
    try {
        if (!fs_1.default.existsSync(backupsDir))
            fs_1.default.mkdirSync(backupsDir, { recursive: true });
    }
    catch { }
    const run = async () => {
        try {
            const now = new Date();
            const ts = now.toISOString().replace(/[:.]/g, '-');
            const file = path_1.default.join(backupsDir, `backup-${ts}.json`);
            // Minimal snapshot of critical tables (if exist)
            const [providers, users, equipments, tickets] = await Promise.all([
                prisma_1.prisma.provider.findMany().catch(() => []),
                prisma_1.prisma.user.findMany().catch(() => []),
                prisma_1.prisma.equipment.findMany().catch(() => []),
                prisma_1.prisma.ticket.findMany().catch(() => [])
            ]);
            const snapshot = { timestamp: now.toISOString(), providers, users, equipments, tickets };
            fs_1.default.writeFileSync(file, JSON.stringify(snapshot));
            console.log(`[BackupWorker] Backup criado: ${file}`);
            // Expurgo de backups antigos
            const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
            const files = fs_1.default.readdirSync(backupsDir);
            for (const f of files) {
                const full = path_1.default.join(backupsDir, f);
                const stat = fs_1.default.statSync(full);
                if (stat.mtimeMs < cutoff) {
                    try {
                        fs_1.default.unlinkSync(full);
                        console.log(`[BackupWorker] Expurgado: ${f}`);
                    }
                    catch { }
                }
            }
        }
        catch (err) {
            console.warn('[BackupWorker] Erro no backup', err);
        }
    };
    started = true;
    timer = setInterval(run, intervalMs);
    // Executa um backup inicial após iniciar
    run().catch(() => { });
}
function stopBackupWorker() {
    if (timer)
        clearInterval(timer);
    started = false;
}
