"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outboundEvents = exports.outboundDlq = exports.outboundQueue = void 0;
exports.enqueueOutbound = enqueueOutbound;
const bullmq_1 = require("bullmq");
const redisConnection_1 = require("./redisConnection");
let outboundQueue = null;
exports.outboundQueue = outboundQueue;
let outboundDlq = null;
exports.outboundDlq = outboundDlq;
let outboundEvents = null;
exports.outboundEvents = outboundEvents;
if ((0, redisConnection_1.isBullEnabled)()) {
    const connection = (0, redisConnection_1.createRedisConnection)();
    exports.outboundQueue = outboundQueue = new bullmq_1.Queue('outbound', { connection });
    exports.outboundDlq = outboundDlq = new bullmq_1.Queue('outbound_dlq', { connection });
    exports.outboundEvents = outboundEvents = new bullmq_1.QueueEvents('outbound', { connection });
}
async function enqueueOutbound(queueId) {
    if (!outboundQueue) {
        // BullMQ desabilitado; não enfileira
        return;
    }
    await outboundQueue.add('send', { queueId }, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
    });
}
