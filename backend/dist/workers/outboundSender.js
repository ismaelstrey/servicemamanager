"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOutboundSender = startOutboundSender;
exports.stopOutboundSender = stopOutboundSender;
const outboundSendService_1 = require("../services/outboundSendService");
let started = false;
let timer = null;
async function startOutboundSender() {
    const enabled = (process.env.OUTBOUND_SENDER_ENABLED || 'false').toLowerCase() === 'true';
    if (!enabled)
        return; // respeita env
    if (started)
        return;
    const intervalStr = process.env.OUTBOUND_SENDER_INTERVAL_MS || '3000';
    const interval = Number.parseInt(intervalStr, 10);
    const service = new outboundSendService_1.OutboundSendService();
    started = true;
    timer = setInterval(async () => {
        try {
            await service.processPending(25);
        }
        catch (err) {
            // log leve
            console.error('[Worker] outbound sender error', err);
        }
    }, Number.isFinite(interval) ? interval : 3000);
}
function stopOutboundSender() {
    if (timer)
        clearInterval(timer);
    started = false;
}
