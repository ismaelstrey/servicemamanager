"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Simple test harness for normalizeTelegram */
const assert_1 = __importDefault(require("assert"));
const normalizers_1 = require("../integrations/telegram/normalizers");
function mockFetchForGetFile(filePath) {
    // @ts-ignore
    global.fetch = async (url) => {
        if (String(url).includes('/getFile')) {
            return {
                ok: true,
                json: async () => ({ ok: true, result: { file_path: filePath } })
            };
        }
        throw new Error('unexpected fetch url: ' + url);
    };
}
async function run() {
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    // Text message
    {
        const update = { message: { message_id: 1, date: Math.floor(Date.now() / 1000), chat: { id: 123 }, from: { id: 456 }, text: 'hello' } };
        const n = await (0, normalizers_1.normalizeTelegram)(update);
        assert_1.default.strictEqual(n.externalConversationId, '123');
        assert_1.default.strictEqual(n.externalSenderId, '456');
        assert_1.default.strictEqual(n.content, 'hello');
        assert_1.default.strictEqual(n.mediaUrl, null);
    }
    // Photo message (largest size)
    {
        mockFetchForGetFile('photos/file_abc.jpg');
        const update = { message: { message_id: 2, date: Math.floor(Date.now() / 1000), chat: { id: 99 }, from: { id: 77 }, photo: [{ file_id: 'a' }, { file_id: 'b' }], caption: 'pic' } };
        const n = await (0, normalizers_1.normalizeTelegram)(update);
        assert_1.default.strictEqual(n.externalConversationId, '99');
        assert_1.default.strictEqual(n.content, 'pic');
        assert_1.default.ok(n.mediaUrl?.includes('/file/bottoken/photos/file_abc.jpg'));
        assert_1.default.strictEqual(n.mimeType, 'image/jpeg');
    }
    // Document message
    {
        mockFetchForGetFile('docs/file_xyz.pdf');
        const update = { message: { message_id: 3, date: Math.floor(Date.now() / 1000), chat: { id: 11 }, from: { id: 22 }, document: { file_id: 'doc1', file_name: 'a.pdf', mime_type: 'application/pdf' } } };
        const n = await (0, normalizers_1.normalizeTelegram)(update);
        assert_1.default.strictEqual(n.externalConversationId, '11');
        assert_1.default.strictEqual(n.content, 'a.pdf');
        assert_1.default.ok(n.mediaUrl?.includes('/file/bottoken/docs/file_xyz.pdf'));
        assert_1.default.strictEqual(n.mimeType, 'application/pdf');
    }
    console.log('telegramNormalizer.test: OK');
}
run().catch((err) => {
    console.error('telegramNormalizer.test: FAIL', err);
    process.exit(1);
});
