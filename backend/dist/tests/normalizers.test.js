"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const normalizers_1 = require("../integrations/whatsapp/normalizers");
function testEvolution() {
    const payload = {
        type: 'message',
        messageId: 'ev-123',
        from: '+5511999999999',
        to: '+5500000000000',
        text: 'Olá!',
        timestamp: Date.now()
    };
    const msg = (0, normalizers_1.normalizeEvolution)(payload);
    assert_1.default.strictEqual(msg.externalMessageId, 'ev-123');
    assert_1.default.strictEqual(msg.externalSenderId, '+5511999999999');
    assert_1.default.strictEqual(msg.content, 'Olá!');
    assert_1.default.ok(msg.createdAt instanceof Date);
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
    const msg = (0, normalizers_1.normalizeWatiicket)(payload);
    assert_1.default.strictEqual(msg.externalMessageId, 'wa-789');
    assert_1.default.strictEqual(msg.externalSenderId, '+5511888888888');
    assert_1.default.strictEqual(msg.content, 'Oi do WaTicket');
    assert_1.default.ok(msg.createdAt instanceof Date);
}
console.log('Running normalizers contract tests...');
testEvolution();
testWatiicket();
console.log('All normalizer tests passed.');
