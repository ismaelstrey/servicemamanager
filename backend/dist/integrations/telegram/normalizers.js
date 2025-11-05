"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTelegram = normalizeTelegram;
// Telegram normalizer: supports text, photo, and document
async function normalizeTelegram(update) {
    const msg = update?.message || update;
    const chatId = msg?.chat?.id ? String(msg.chat.id) : null;
    const senderId = msg?.from?.id ? String(msg.from.id) : (msg?.from?.username ?? null);
    const messageId = msg?.message_id ? String(msg.message_id) : null;
    const createdTs = msg?.date || Date.now(); // Telegram 'date' is seconds since epoch
    let content = msg?.text ?? msg?.caption ?? null;
    let mediaUrl = null;
    let mimeType = null;
    const token = process.env.TELEGRAM_BOT_TOKEN || '';
    const apiBase = 'https://api.telegram.org';
    // Photo: choose the largest size (usually last element)
    const photos = msg?.photo;
    if (!mediaUrl && Array.isArray(photos) && photos.length > 0) {
        const photo = photos[photos.length - 1];
        const fileId = photo?.file_id;
        if (fileId && token) {
            try {
                const getFileUrl = `${apiBase}/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`;
                const res = await fetch(getFileUrl);
                const data = await res.json();
                const filePath = data?.result?.file_path;
                if (filePath) {
                    mediaUrl = `${apiBase}/file/bot${token}/${filePath}`;
                    mimeType = 'image/jpeg';
                }
            }
            catch (err) {
                // ignore errors; keep mediaUrl null
            }
        }
        if (!content)
            content = msg?.caption ?? null;
    }
    // Document: generic files
    const document = msg?.document;
    if (!mediaUrl && document && document.file_id) {
        const fileId = document.file_id;
        if (fileId && token) {
            try {
                const getFileUrl = `${apiBase}/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`;
                const res = await fetch(getFileUrl);
                const data = await res.json();
                const filePath = data?.result?.file_path;
                if (filePath) {
                    mediaUrl = `${apiBase}/file/bot${token}/${filePath}`;
                    mimeType = document?.mime_type || 'application/octet-stream';
                }
            }
            catch (err) {
                // ignore errors
            }
        }
        if (!content)
            content = document?.file_name ?? null;
    }
    return {
        externalConversationId: chatId,
        externalSenderId: senderId,
        externalMessageId: messageId,
        content,
        mediaUrl,
        mimeType,
        direction: 'inbound',
        createdAt: new Date(Number(createdTs) * (String(createdTs).length <= 10 ? 1000 : 1))
    };
}
