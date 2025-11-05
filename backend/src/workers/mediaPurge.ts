import { prisma } from '../lib/prisma';
import { deleteByUrl } from '../services/storageService';

let timer: any = null;
let started = false;

export async function startMediaPurge() {
  const enabled = (process.env.MEDIA_PURGE_ENABLED || 'true').toLowerCase() === 'true';
  if (!enabled || started) return;
  // usar prisma centralizado
  const days = parseInt(process.env.MEDIA_RETENTION_DAYS || '90', 10);
  const intervalMs = parseInt(process.env.MEDIA_PURGE_INTERVAL_MS || String(6 * 60 * 60 * 1000), 10); // 6h

  const run = async () => {
    try {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const old = await prisma.attachment.findMany({ where: { createdAt: { lt: cutoff } }, take: 200 });
      for (const att of old) {
        try {
          await deleteByUrl(att.url);
          await prisma.attachment.delete({ where: { id: att.id } });
        } catch (err) {
          console.warn('[MediaPurge] Falha ao expurgar attachment', att.id, err);
        }
      }
      if (old.length > 0) console.log(`[MediaPurge] Expurgados ${old.length} anexos antigos`);
    } catch (err) {
      console.warn('[MediaPurge] Erro na execução', err);
    }
  };

  started = true;
  timer = setInterval(run, intervalMs);
}

export function stopMediaPurge() {
  if (timer) clearInterval(timer);
  started = false;
}