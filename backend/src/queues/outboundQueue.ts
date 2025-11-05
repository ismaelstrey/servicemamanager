import { Queue, QueueEvents } from 'bullmq';
import { createRedisConnection, isBullEnabled } from './redisConnection';

let outboundQueue: Queue | null = null;
let outboundDlq: Queue | null = null;
let outboundEvents: QueueEvents | null = null;

if (isBullEnabled()) {
  const connection = createRedisConnection();
  outboundQueue = new Queue('outbound', { connection });
  outboundDlq = new Queue('outbound_dlq', { connection });
  outboundEvents = new QueueEvents('outbound', { connection });
}

export { outboundQueue, outboundDlq, outboundEvents };

export async function enqueueOutbound(queueId: number) {
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