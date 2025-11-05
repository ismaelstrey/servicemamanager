export type Direction = 'inbound' | 'outbound';

export interface NormalizedWhatsAppMessage {
  externalConversationId: string | null;
  externalSenderId: string | null;
  externalMessageId: string | null;
  content: string | null;
  mediaUrl: string | null;
  mimeType: string | null;
  direction: Direction;
  createdAt: Date;
}

// Evolution provider normalizer
export function normalizeEvolution(event: any): NormalizedWhatsAppMessage {
  const msg = event?.message || event;
  const content = msg?.body || msg?.text || msg?.message || null;
  const mediaUrl = msg?.mediaUrl || msg?.media?.url || null;
  const mimeType = msg?.mimeType || msg?.media?.mimeType || null;
  const externalMessageId = msg?.id || msg?.messageId || event?.messageId || null;
  const createdTs = msg?.timestamp || msg?.createdAt || event?.timestamp || Date.now();
  const from = msg?.from || msg?.sender || event?.from || null;
  const to = msg?.to || msg?.recipient || event?.to || null;
  const direction: Direction = inferDirection(from, to);

  return {
    externalConversationId: msg?.chatId || msg?.conversationId || null,
    externalSenderId: from,
    externalMessageId,
    content,
    mediaUrl,
    mimeType,
    direction,
    createdAt: new Date(Number(createdTs) * (String(createdTs).length <= 10 ? 1000 : 1)),
  };
}

// WaTicket provider normalizer
export function normalizeWatiicket(event: any): NormalizedWhatsAppMessage {
  const msg = event?.message || event?.data || event;
  const content = msg?.body || msg?.text || msg?.message || null;
  const mediaUrl = msg?.mediaUrl || msg?.media?.url || null;
  const mimeType = msg?.mimeType || msg?.media?.mimeType || null;
  const externalMessageId = msg?.id || msg?.messageId || event?.messageId || null;
  const createdTs = msg?.timestamp || msg?.createdAt || event?.timestamp || Date.now();
  const from = msg?.from || msg?.sender || event?.from || null;
  const to = msg?.to || msg?.recipient || event?.to || null;
  const direction: Direction = inferDirection(from, to);

  return {
    externalConversationId: msg?.chatId || msg?.conversationId || null,
    externalSenderId: from,
    externalMessageId,
    content,
    mediaUrl,
    mimeType,
    direction,
    createdAt: new Date(Number(createdTs) * (String(createdTs).length <= 10 ? 1000 : 1)),
  };
}

function inferDirection(from?: string | null, to?: string | null): Direction {
  // Heurística: se há "from" externo, consideramos inbound; caso contrário outbound
  if (from && (!to || from !== to)) return 'inbound';
  return 'outbound';
}