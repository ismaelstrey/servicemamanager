import assert from 'assert';
import { normalizeEvolution, normalizeWatiicket } from '../integrations/whatsapp/normalizers';

function testEvolution() {
  const payload = {
    type: 'message',
    messageId: 'ev-123',
    from: '+5511999999999',
    to: '+5500000000000',
    text: 'Olá!',
    timestamp: Date.now()
  };
  const msg = normalizeEvolution(payload as any);
  assert.strictEqual(msg.externalMessageId, 'ev-123');
  assert.strictEqual(msg.externalSenderId, '+5511999999999');
  assert.strictEqual(msg.content, 'Olá!');
  assert.ok(msg.createdAt instanceof Date);
}

function testWatiicket() {
  const payload = {
    event: 'message',
    messageId: 'wa-789',
    from: '+5511888888888',
    to: '+5500000000000',
    text: 'Oi do WaTicket',
    timestamp: Date.now()
  };
  const msg = normalizeWatiicket(payload as any);
  assert.strictEqual(msg.externalMessageId, 'wa-789');
  assert.strictEqual(msg.externalSenderId, '+5511888888888');
  assert.strictEqual(msg.content, 'Oi do WaTicket');
  assert.ok(msg.createdAt instanceof Date);
}

console.log('Running normalizers contract tests...');
testEvolution();
testWatiicket();
console.log('All normalizer tests passed.');