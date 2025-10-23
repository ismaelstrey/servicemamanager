import crypto from 'crypto';

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || '';
  if (!secret) {
    // Derive a key from default fallback to avoid crash in dev; recommend setting ENCRYPTION_KEY
    return crypto.createHash('sha256').update('default-dev-secret').digest();
  }
  try {
    // Try base64
    const buf = Buffer.from(secret, 'base64');
    if (buf.length === 32) return buf;
  } catch {}
  try {
    // Try hex
    const buf = Buffer.from(secret, 'hex');
    if (buf.length === 32) return buf;
  } catch {}
  // Derive from string using SHA-256
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptString(plainText: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM recommended IV length
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(plainText, 'utf8')), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString('base64');
}

export function decryptString(encoded: string): string {
  const key = getKey();
  const packed = Buffer.from(encoded, 'base64');
  const iv = packed.subarray(0, 12);
  const authTag = packed.subarray(12, 28);
  const data = packed.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

export function maskSecret(): string {
  return '********';
}