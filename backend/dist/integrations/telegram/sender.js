"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.sendPhoto = sendPhoto;
exports.sendDocument = sendDocument;
const API_BASE = 'https://api.telegram.org';
function getToken() {
    const token = process.env.TELEGRAM_BOT_TOKEN || '';
    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN não configurado');
    }
    return token;
}
async function sendMessage(chatId, text) {
    const token = getToken();
    const url = `${API_BASE}/bot${token}/sendMessage`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text })
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Falha ao enviar mensagem Telegram: ${res.status} ${body}`);
    }
    return await res.json();
}
async function sendPhoto(chatId, photoUrl, caption) {
    const token = getToken();
    const url = `${API_BASE}/bot${token}/sendPhoto`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption })
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Falha ao enviar foto Telegram: ${res.status} ${body}`);
    }
    return await res.json();
}
async function sendDocument(chatId, documentUrl, caption) {
    const token = getToken();
    const url = `${API_BASE}/bot${token}/sendDocument`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, document: documentUrl, caption })
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Falha ao enviar documento Telegram: ${res.status} ${body}`);
    }
    return await res.json();
}
