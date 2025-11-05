import type { Namespace } from 'socket.io';

let providerNs: Namespace | null = null;

export function setProviderNamespace(ns: Namespace) {
  providerNs = ns;
}

export function emitMessageNew(conversationId: number, message: any) {
  try {
    if (!providerNs) return;
    const room = `conv:${conversationId}`;
    providerNs.to(room).emit('message:new', { message });
    providerNs.to(room).emit('message:delivered', { messageId: message?.id, conversationId });
  } catch (err) {
    // silencioso
  }
}

export function emitPresence(conversationId: number, userId: number, status: 'online' | 'offline') {
  try {
    if (!providerNs) return;
    const room = `conv:${conversationId}`;
    providerNs.to(room).emit('presence', { conversationId, userId, status });
  } catch (err) {
    // silencioso
  }
}