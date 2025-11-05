"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setProviderNamespace = setProviderNamespace;
exports.emitMessageNew = emitMessageNew;
exports.emitPresence = emitPresence;
let providerNs = null;
function setProviderNamespace(ns) {
    providerNs = ns;
}
function emitMessageNew(conversationId, message) {
    try {
        if (!providerNs)
            return;
        const room = `conv:${conversationId}`;
        providerNs.to(room).emit('message:new', { message });
        providerNs.to(room).emit('message:delivered', { messageId: message?.id, conversationId });
    }
    catch (err) {
        // silencioso
    }
}
function emitPresence(conversationId, userId, status) {
    try {
        if (!providerNs)
            return;
        const room = `conv:${conversationId}`;
        providerNs.to(room).emit('presence', { conversationId, userId, status });
    }
    catch (err) {
        // silencioso
    }
}
