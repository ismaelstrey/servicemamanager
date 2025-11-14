"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const encKey = (() => {
    const base64 = process.env.CREDENTIALS_ENCRYPTION_KEY || '';
    return base64 ? Buffer.from(base64, 'base64') : node_crypto_1.default.randomBytes(32);
})();
class CredentialService {
    encrypt(password) {
        const iv = node_crypto_1.default.randomBytes(12);
        const cipher = node_crypto_1.default.createCipheriv('aes-256-gcm', encKey, iv);
        const enc = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return Buffer.concat([iv, tag, enc]).toString('base64');
    }
    decrypt(passwordEnc) {
        const buf = Buffer.from(passwordEnc, 'base64');
        const iv = buf.subarray(0, 12);
        const tag = buf.subarray(12, 28);
        const data = buf.subarray(28);
        const decipher = node_crypto_1.default.createDecipheriv('aes-256-gcm', encKey, iv);
        decipher.setAuthTag(tag);
        const dec = Buffer.concat([decipher.update(data), decipher.final()]);
        return dec.toString('utf8');
    }
    mask() { return '••••••'; }
    canView(visibility, user, allowedUserIds, userId, allowedGroupIds, userGroupIds) {
        if (visibility === 'PUBLIC')
            return true;
        if (visibility === 'PROVIDER_ONLY')
            return user?.role !== 'customer_user';
        if (visibility === 'CUSTOM') {
            if (allowedUserIds && userId && allowedUserIds.includes(userId))
                return true;
            if (allowedGroupIds && userGroupIds && userGroupIds.some(id => allowedGroupIds.includes(id)))
                return true;
            return false;
        }
        return false;
    }
}
exports.CredentialService = CredentialService;
