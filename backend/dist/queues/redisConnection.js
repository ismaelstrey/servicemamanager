"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisConnection = createRedisConnection;
exports.isBullEnabled = isBullEnabled;
const ioredis_1 = __importDefault(require("ioredis"));
function createRedisConnection() {
    const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    const tls = process.env.REDIS_TLS === 'true';
    const opt = { lazyConnect: true, maxRetriesPerRequest: null };
    // Autenticação quando necessário
    if (process.env.REDIS_PASSWORD) {
        opt.password = process.env.REDIS_PASSWORD;
    }
    if (process.env.REDIS_USERNAME) {
        opt.username = process.env.REDIS_USERNAME;
    }
    // ioredis aceita URL diretamente
    if (tls) {
        // Ativa TLS quando configurado
        opt.tls = {};
    }
    const conn = new ioredis_1.default(url, opt);
    return conn;
}
function isBullEnabled() {
    return (process.env.OUTBOUND_BULLMQ_ENABLED || 'false').toLowerCase() === 'true';
}
