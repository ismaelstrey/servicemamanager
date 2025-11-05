import { Worker, Job } from 'bullmq';
import { outboundEvents, outboundDlq, outboundQueue } from '../queues/outboundQueue';
import { createRedisConnection, isBullEnabled } from '../queues/redisConnection';
import { OutboundSendService } from '../services/outboundSendService';

let worker: Worker | null = null;
let started = false;

export async function startOutboundBullWorker() {
  if (!isBullEnabled() || started) return;
  const connection = createRedisConnection();
  const service = new OutboundSendService();

  worker = new Worker('outbound', async (job: Job) => {
    const { queueId } = job.data as { queueId: number };
    await service.processQueueItem(queueId);
  }, { connection, concurrency: 5 });

  // Use local const aliases for control-flow narrowing
  const events = outboundEvents;
  const queue = outboundQueue;
  const dlq = outboundDlq;

  if (events && queue && dlq) {
    events.on('failed', async ({ jobId, failedReason, prev, attemptsMade }: any) => {
      try {
        // Quando atingir o máximo de tentativas, move para DLQ
        // Nota: BullMQ não passa job completo no evento; recuperamos via Queue.getJob
        const job = jobId ? await queue.getJob(jobId) : null;
        if (job && attemptsMade >= ((job as any)?.opts?.attempts || 1)) {
          await dlq.add('dead-letter', job.data, { removeOnComplete: true });
          console.error(`[BullMQ] Job ${jobId} movido para DLQ: ${failedReason}`);
        }
      } catch (err) {
        console.error('[BullMQ] Falha ao mover para DLQ:', err);
      }
    });
  }

  started = true;
}

export async function stopOutboundBullWorker() {
  if (worker) {
    await worker.close();
    worker = null;
  }
  started = false;
}