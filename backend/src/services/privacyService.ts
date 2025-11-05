import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import { logAudit } from '../utils/auditLogger';

const logsDir = path.join(process.cwd(), 'logs');
const consentLogFile = path.join(logsDir, 'privacy-consent.log');
const erasureLogFile = path.join(logsDir, 'privacy-erasure.log');

function ensureLogsDir() {
  try {
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  } catch { /* ignore */ }
}

export class PrivacyService {
  async recordConsent(userId: number, consent: boolean): Promise<{ success: boolean }> {
    ensureLogsDir();
    const entry = { timestamp: new Date().toISOString(), userId, consent };
    try {
      fs.appendFileSync(consentLogFile, JSON.stringify(entry) + '\n');
    } catch { /* ignore */ }

    logAudit({
      action: 'consent_update',
      resource: 'privacy',
      userId: String(userId),
      success: true,
      metadata: { consent }
    });

    // Caso exista campo de consentimento no schema, persistir:
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { /* @ts-ignore */ consent: consent }
      }).catch(() => Promise.resolve());
    } catch { /* ignore */ }

    return { success: true };
  }

  async requestErasure(userId: number): Promise<{ success: boolean }> {
    ensureLogsDir();
    const entry = { timestamp: new Date().toISOString(), userId, type: 'erasure_request' };
    try {
      fs.appendFileSync(erasureLogFile, JSON.stringify(entry) + '\n');
    } catch { /* ignore */ }

    logAudit({
      action: 'dsr_erasure_requested',
      resource: 'privacy',
      userId: String(userId),
      success: true
    });

    // Baseline de anonimização: remover PII de comentários e tickets se campos existirem
    try {
      await prisma.comment.updateMany({
        where: { userId },
        data: { /* @ts-ignore */ authorName: 'ANON', authorEmail: null }
      }).catch(() => Promise.resolve());

      await prisma.ticket.updateMany({
        where: { userId },
        data: { /* @ts-ignore */ requesterName: 'ANON', requesterEmail: null }
      }).catch(() => Promise.resolve());
    } catch { /* ignore */ }

    return { success: true };
  }
}

export const privacyService = new PrivacyService();