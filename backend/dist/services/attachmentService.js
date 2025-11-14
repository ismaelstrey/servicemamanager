"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentService = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
class AttachmentService {
    constructor() {
        const uploadDir = process.env.UPLOAD_DIR || node_path_1.default.join(process.cwd(), 'uploads');
        this.baseDir = uploadDir;
    }
    async saveTicketAttachment(ticketId, file) {
        const ticketDir = node_path_1.default.join(this.baseDir, 'tickets', String(ticketId));
        await node_fs_1.default.promises.mkdir(ticketDir, { recursive: true });
        const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const fullPath = node_path_1.default.join(ticketDir, safeName);
        await node_fs_1.default.promises.writeFile(fullPath, file.buffer);
        const publicUrlBase = process.env.PUBLIC_UPLOAD_BASE_URL || '/uploads';
        const url = node_path_1.default.join(publicUrlBase, 'tickets', String(ticketId), safeName).replace(/\\/g, '/');
        return {
            url,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size
        };
    }
}
exports.AttachmentService = AttachmentService;
