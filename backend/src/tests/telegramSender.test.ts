/* Simple test harness for telegram sender */
import assert from 'assert';
import { sendMessage, sendPhoto, sendDocument } from '../integrations/telegram/sender';

async function run() {
  process.env.TELEGRAM_BOT_TOKEN = 'token';
  let lastRequest: { url: string; body: any } | null = null;
  const getLastRequest = () => {
    if (!lastRequest) throw new Error('No request captured');
    return lastRequest;
  };
  // @ts-ignore
  global.fetch = async (url: string, init?: any) => {
    lastRequest = { url, body: init?.body ? JSON.parse(init.body) : null };
    return { ok: true, json: async () => ({ ok: true, result: { message_id: 1 } }) } as any;
  };

  // sendMessage
  await sendMessage('123', 'abc');
  const reqMsg = getLastRequest();
  assert.strictEqual(reqMsg.url.includes('/bots/token/sendMessage'), false); // ensure correct token path
  assert.ok(reqMsg.url.includes('/bottoken/sendMessage'));
  assert.strictEqual(reqMsg.body.chat_id, '123');
  assert.strictEqual(reqMsg.body.text, 'abc');

  // sendPhoto
  await sendPhoto('1', 'http://example.com/p.jpg', 'cap');
  const reqPhoto = getLastRequest();
  assert.ok(reqPhoto.url.includes('/bottoken/sendPhoto'));
  assert.strictEqual(reqPhoto.body.photo, 'http://example.com/p.jpg');
  assert.strictEqual(reqPhoto.body.caption, 'cap');

  // sendDocument
  await sendDocument('2', 'http://example.com/d.pdf', 'doc');
  const reqDoc = getLastRequest();
  assert.ok(reqDoc.url.includes('/bottoken/sendDocument'));
  assert.strictEqual(reqDoc.body.document, 'http://example.com/d.pdf');
  assert.strictEqual(reqDoc.body.caption, 'doc');

  console.log('telegramSender.test: OK');
}

run().catch((err) => {
  console.error('telegramSender.test: FAIL', err);
  process.exit(1);
});