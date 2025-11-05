const API_BASE = 'https://api.telegram.org';

function getToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN não configurado');
  }
  return token;
}

export async function sendMessage(chatId: string, text: string): Promise<any> {
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

export async function sendPhoto(chatId: string, photoUrl: string, caption?: string): Promise<any> {
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

export async function sendDocument(chatId: string, documentUrl: string, caption?: string): Promise<any> {
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