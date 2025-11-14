import fs from 'node:fs'
import path from 'node:path'

export interface SavedAttachmentMeta {
  url: string
  originalName: string
  mimeType: string
  size?: number
}

export class AttachmentService {
  private baseDir: string

  constructor() {
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
    this.baseDir = uploadDir
  }

  async saveTicketAttachment(ticketId: number, file: { originalname: string; mimetype: string; buffer: Buffer; size?: number }): Promise<SavedAttachmentMeta> {
    const ticketDir = path.join(this.baseDir, 'tickets', String(ticketId))
    await fs.promises.mkdir(ticketDir, { recursive: true })

    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const fullPath = path.join(ticketDir, safeName)
    await fs.promises.writeFile(fullPath, file.buffer)

    const publicUrlBase = process.env.PUBLIC_UPLOAD_BASE_URL || '/uploads'
    const url = path.join(publicUrlBase, 'tickets', String(ticketId), safeName).replace(/\\/g, '/')

    return {
      url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    }
  }
}