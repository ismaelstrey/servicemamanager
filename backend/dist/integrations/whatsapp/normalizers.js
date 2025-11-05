"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEvolution = normalizeEvolution;
exports.normalizeWatiicket = normalizeWatiicket;
// Evolution provider normalizer
function normalizeEvolution(event) {
    const msg = event?.message || event;
    const content = msg?.body || msg?.text || msg?.message || null;
    const mediaUrl = msg?.mediaUrl || msg?.media?.url || null;
    const mimeType = msg?.mimeType || msg?.media?.mimeType || null;
    const externalMessageId = msg?.id || msg?.messageId || event?.messageId || null;
    const createdTs = msg?.timestamp || msg?.createdAt || event?.timestamp || Date.now();
    const from = msg?.from || msg?.sender || event?.from || null;
    const to = msg?.to || msg?.recipient || event?.to || null;
    const direction = inferDirection(from, to);
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
function normalizeWatiicket(event) {
    const msg = event?.message || event?.data || event;
    const content = msg?.body || msg?.text || msg?.message || null;
    const mediaUrl = msg?.mediaUrl || msg?.media?.url || null;
    const mimeType = msg?.mimeType || msg?.media?.mimeType || null;
    const externalMessageId = msg?.id || msg?.messageId || event?.messageId || null;
    const createdTs = msg?.timestamp || msg?.createdAt || event?.timestamp || Date.now();
    const from = msg?.from || msg?.sender || event?.from || null;
    const to = msg?.to || msg?.recipient || event?.to || null;
    const direction = inferDirection(from, to);
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
function inferDirection(from, to) {
    // Heurística: se há "from" externo, consideramos inbound; caso contrário outbound
    if (from && (!to || from !== to))
        return 'inbound';
    return 'outbound';
}
