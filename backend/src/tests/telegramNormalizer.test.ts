/* Simple test harness for normalizeTelegram */
import assert from 'assert';
import { normalizeTelegram } from '../integrations/telegram/normalizers';

function mockFetchForGetFile(filePath: string) {
  // @ts-ignore
  global.fetch = async (url: string) => {
    if (String(url).includes('/getFile')) {
      return {
        ok: true,
        json: async () => ({ ok: true, result: { file_path: filePath } })
      } as any;
    }
    throw new Error('unexpected fetch url: ' + url);
  };
}

async function run() {
  process.env.TELEGRAM_BOT_TOKEN = 'token';
  // Text message
  {
    const update = { message: { message_id: 1, date: Math.floor(Date.now()/1000), chat: { id: 123 }, from: { id: 456 }, text: 'hello' } };
    const n = await normalizeTelegram(update);
    assert.strictEqual(n.externalConversationId, '123');
    assert.strictEqual(n.externalSenderId, '456');
    assert.strictEqual(n.content, 'hello');
    assert.strictEqual(n.mediaUrl, null);
  }

  // Photo message (largest size)
  {
    mockFetchForGetFile('photos/file_abc.jpg');
    const update = { message: { message_id: 2, date: Math.floor(Date.now()/1000), chat: { id: 99 }, from: { id: 77 }, photo: [{ file_id: 'a' }, { file_id: 'b' }], caption: 'pic' } };
    const n = await normalizeTelegram(update);
    assert.strictEqual(n.externalConversationId, '99');
    assert.strictEqual(n.content, 'pic');
    assert.ok(n.mediaUrl?.includes('/file/bottoken/photos/file_abc.jpg'));
    assert.strictEqual(n.mimeType, 'image/jpeg');
  }

  // Document message
  {
    mockFetchForGetFile('docs/file_xyz.pdf');
    const update = { message: { message_id: 3, date: Math.floor(Date.now()/1000), chat: { id: 11 }, from: { id: 22 }, document: { file_id: 'doc1', file_name: 'a.pdf', mime_type: 'application/pdf' } } };
    const n = await normalizeTelegram(update);
    assert.strictEqual(n.externalConversationId, '11');
    assert.strictEqual(n.content, 'a.pdf');
    assert.ok(n.mediaUrl?.includes('/file/bottoken/docs/file_xyz.pdf'));
    assert.strictEqual(n.mimeType, 'application/pdf');
  }

  console.log('telegramNormalizer.test: OK');
}

run().catch((err) => {
  console.error('telegramNormalizer.test: FAIL', err);
  process.exit(1);
});