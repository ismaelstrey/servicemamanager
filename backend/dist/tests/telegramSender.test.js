"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Simple test harness for telegram sender */
const assert_1 = __importDefault(require("assert"));
const sender_1 = require("../integrations/telegram/sender");
async function run() {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    let lastRequest = null;
    const getLastRequest = () => {
        if (!lastRequest)
            throw new Error('No request captured');
        return lastRequest;
    };
    // @ts-ignore
    global.fetch = async (url, init) => {
        lastRequest = { url, body: init?.body ? JSON.parse(init.body) : null };
        return { ok: true, json: async () => ({ ok: true, result: { message_id: 1 } }) };
    };
    // sendMessage
    await (0, sender_1.sendMessage)('123', 'abc');
    const reqMsg = getLastRequest();
    assert_1.default.strictEqual(reqMsg.url.includes('/bots/token/sendMessage'), false); // ensure correct token path
    assert_1.default.ok(reqMsg.url.includes('/bottoken/sendMessage'));
    assert_1.default.strictEqual(reqMsg.body.chat_id, '123');
    assert_1.default.strictEqual(reqMsg.body.text, 'abc');
    // sendPhoto
    await (0, sender_1.sendPhoto)('1', 'http://example.com/p.jpg', 'cap');
    const reqPhoto = getLastRequest();
    assert_1.default.ok(reqPhoto.url.includes('/bottoken/sendPhoto'));
    assert_1.default.strictEqual(reqPhoto.body.photo, 'http://example.com/p.jpg');
    assert_1.default.strictEqual(reqPhoto.body.caption, 'cap');
    // sendDocument
    await (0, sender_1.sendDocument)('2', 'http://example.com/d.pdf', 'doc');
    const reqDoc = getLastRequest();
    assert_1.default.ok(reqDoc.url.includes('/bottoken/sendDocument'));
    assert_1.default.strictEqual(reqDoc.body.document, 'http://example.com/d.pdf');
    assert_1.default.strictEqual(reqDoc.body.caption, 'doc');
    console.log('telegramSender.test: OK');
}
run().catch((err) => {
    console.error('telegramSender.test: FAIL', err);
    process.exit(1);
});
