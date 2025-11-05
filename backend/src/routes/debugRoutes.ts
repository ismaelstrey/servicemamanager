import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

function isDebugEnabled() {
  return (process.env.ENABLE_DEBUG_ROUTES || 'false').toLowerCase() === 'true';
}

router.get('/conversations', async (req, res) => {
  if (!isDebugEnabled()) return res.status(404).json({ error: 'Debug desabilitado' });
  const rawLimit = (req.query.limit as string | undefined) ?? '20';
  const limitParsed = parseInt(rawLimit, 10);
  const limit = Number.isFinite(limitParsed) ? Math.min(Math.max(limitParsed, 1), 50) : 20;

  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        integration: { select: { id: true, channelId: true } },
        participants: { select: { id: true, role: true, displayName: true, externalId: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, direction: true, status: true, content: true, createdAt: true }
        }
      }
    });
    return res.json({ count: conversations.length, conversations });
  } catch (err) {
    console.error('[Debug] failed to list conversations', err);
    return res.status(500).json({ error: 'Falha ao listar conversas' });
  }
});

router.get('/messages', async (req, res) => {
  if (!isDebugEnabled()) return res.status(404).json({ error: 'Debug desabilitado' });
  const rawLimit = (req.query.limit as string | undefined) ?? '50';
  const limitParsed = parseInt(rawLimit, 10);
  const limit = Number.isFinite(limitParsed) ? Math.min(Math.max(limitParsed, 1), 200) : 50;

  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        conversation: { select: { id: true, externalId: true, integrationAccountId: true } },
        participant: { select: { id: true, role: true, displayName: true } }
      }
    });
    return res.json({ count: messages.length, messages });
  } catch (err) {
    console.error('[Debug] failed to list messages', err);
    return res.status(500).json({ error: 'Falha ao listar mensagens' });
  }
});

export default router;