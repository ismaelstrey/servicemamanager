import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

let timer: any = null;
let started = false;

export async function startBackupWorker() {
  const enabled = (process.env.BACKUP_ENABLED || 'true').toLowerCase() === 'true';
  if (!enabled || started) return;
  const intervalMs = parseInt(process.env.BACKUP_INTERVAL_MS || String(24 * 60 * 60 * 1000), 10); // 24h
  const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);

  const backupsDir = path.join(process.cwd(), 'logs', 'backups');
  try { if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true }); } catch {}

  const run = async () => {
    try {
      const now = new Date();
      const ts = now.toISOString().replace(/[:.]/g, '-');
      const file = path.join(backupsDir, `backup-${ts}.json`);

      // Minimal snapshot of critical tables (if exist)
      const [providers, users, equipments, tickets] = await Promise.all([
        prisma.provider.findMany().catch(() => []),
        prisma.user.findMany().catch(() => []),
        prisma.equipment.findMany().catch(() => []),
        prisma.ticket.findMany().catch(() => [])
      ]);

      const snapshot = { timestamp: now.toISOString(), providers, users, equipments, tickets };
      fs.writeFileSync(file, JSON.stringify(snapshot));
      console.log(`[BackupWorker] Backup criado: ${file}`);

      // Expurgo de backups antigos
      const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
      const files = fs.readdirSync(backupsDir);
      for (const f of files) {
        const full = path.join(backupsDir, f);
        const stat = fs.statSync(full);
        if (stat.mtimeMs < cutoff) {
          try { fs.unlinkSync(full); console.log(`[BackupWorker] Expurgado: ${f}`); } catch {}
        }
      }
    } catch (err) {
      console.warn('[BackupWorker] Erro no backup', err);
    }
  };

  started = true;
  timer = setInterval(run, intervalMs);
  // Executa um backup inicial após iniciar
  run().catch(() => {});
}

export function stopBackupWorker() {
  if (timer) clearInterval(timer);
  started = false;
}