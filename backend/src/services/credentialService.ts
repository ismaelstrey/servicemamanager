import crypto from 'node:crypto'

const encKey = (() => {
  const base64 = process.env.CREDENTIALS_ENCRYPTION_KEY || ''
  return base64 ? Buffer.from(base64, 'base64') : crypto.randomBytes(32)
})()

export class CredentialService {
  encrypt(password: string): string {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', encKey, iv)
    const enc = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return Buffer.concat([iv, tag, enc]).toString('base64')
  }
  decrypt(passwordEnc: string): string {
    const buf = Buffer.from(passwordEnc, 'base64')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const data = buf.subarray(28)
    const decipher = crypto.createDecipheriv('aes-256-gcm', encKey, iv)
    decipher.setAuthTag(tag)
    const dec = Buffer.concat([decipher.update(data), decipher.final()])
    return dec.toString('utf8')
  }
  mask(): string { return '••••••' }
  canView(visibility: 'PUBLIC'|'PROVIDER_ONLY'|'CUSTOM', user: { role?: string }, allowedUserIds?: number[], userId?: number, allowedGroupIds?: number[], userGroupIds?: number[]): boolean {
    if (visibility === 'PUBLIC') return true
    if (visibility === 'PROVIDER_ONLY') return user?.role !== 'customer_user'
    if (visibility === 'CUSTOM') {
      if (allowedUserIds && userId && allowedUserIds.includes(userId)) return true
      if (allowedGroupIds && userGroupIds && userGroupIds.some(id => allowedGroupIds.includes(id))) return true
      return false
    }
    return false
  }
}