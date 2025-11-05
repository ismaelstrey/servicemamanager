"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOutboundBullWorker = startOutboundBullWorker;
exports.stopOutboundBullWorker = stopOutboundBullWorker;
const bullmq_1 = require("bullmq");
const outboundQueue_1 = require("../queues/outboundQueue");
const redisConnection_1 = require("../queues/redisConnection");
const outboundSendService_1 = require("../services/outboundSendService");
let worker = null;
let started = false;
async function startOutboundBullWorker() {
    if (!(0, redisConnection_1.isBullEnabled)() || started)
        return;
    const connection = (0, redisConnection_1.createRedisConnection)();
    const service = new outboundSendService_1.OutboundSendService();
    worker = new bullmq_1.Worker('outbound', async (job) => {
        const { queueId } = job.data;
        await service.processQueueItem(queueId);
    }, { connection, concurrency: 5 });
    // Use local const aliases for control-flow narrowing
    const events = outboundQueue_1.outboundEvents;
    const queue = outboundQueue_1.outboundQueue;
    const dlq = outboundQueue_1.outboundDlq;
    if (events && queue && dlq) {
        events.on('failed', async ({ jobId, failedReason, prev, attemptsMade }) => {
            try {
                // Quando atingir o máximo de tentativas, move para DLQ
                // Nota: BullMQ não passa job completo no evento; recuperamos via Queue.getJob
                const job = jobId ? await queue.getJob(jobId) : null;
                if (job && attemptsMade >= (job?.opts?.attempts || 1)) {
                    await dlq.add('dead-letter', job.data, { removeOnComplete: true });
                    console.error(`[BullMQ] Job ${jobId} movido para DLQ: ${failedReason}`);
                }
            }
            catch (err) {
                console.error('[BullMQ] Falha ao mover para DLQ:', err);
            }
        });
    }
    started = true;
}
async function stopOutboundBullWorker() {
    if (worker) {
        await worker.close();
        worker = null;
    }
    started = false;
}
