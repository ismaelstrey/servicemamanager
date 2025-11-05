import { useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { ChatService, type Conversation, type Message } from '../services/chatService';

interface UseChatOptions {
  autoConnect?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
  const { user, token } = useAuth();
  const providerId = user?.providerId;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const wsBaseUrl = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    if (apiUrl.endsWith('/api')) return apiUrl.slice(0, -4); // remove '/api'
    return apiUrl;
  }, []);

  useEffect(() => {
    if (!options.autoConnect) return;
    if (!token || !providerId) return;

    const url = `${wsBaseUrl}/providers/${providerId}`;
    const socket = io(url, {
      transports: ['websocket'],
      auth: { token },
    });

    socket.on('connect', () => {
      // noop
    });

    socket.on('message:new', (payload: { message: Message }) => {
      setMessages(prev => {
        // Se for de conversa atual, adiciona
        if (payload.message.conversationId === selectedConversationId) {
          return [...prev, payload.message];
        }
        return prev;
      });
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, providerId, wsBaseUrl, options.autoConnect, selectedConversationId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await ChatService.listConversations();
      const list = (res.data?.data ?? []) as Conversation[];
      setConversations(list);
    } catch (e) {
      setError('Falha ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversationId: number) => {
    setSelectedConversationId(conversationId);
    try {
      setLoading(true);
      const res = await ChatService.listMessages(conversationId);
      // const list = (res.data?.data ?? []) as unknown as { data?: Message[]; pagination?: any };
      // normalizeApiResponse embrulha, então res.data contém envelope; acessa direta
      const msgs = (res.data as any).data as Message[];
      setMessages(msgs);
      if (socketRef.current) {
        socketRef.current.emit('conversation:join', { conversationId });
      }
    } catch (e) {
      setError('Falha ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, mimeType?: string) => {
    if (!selectedConversationId) return;
    const res = await ChatService.sendMessage(selectedConversationId, content, mimeType);
    const msg = (res.data as any).data as Message;
    setMessages(prev => [...prev, msg]);
    if (socketRef.current) {
      socketRef.current.emit('message:new', { conversationId: selectedConversationId, content, mimeType });
    }
  };

  const uploadAttachment = async (file: File) => {
    if (!selectedConversationId) return;
    const res = await ChatService.uploadAttachment(selectedConversationId, file);
    const msg = (res.data as any).data as Message;
    setMessages(prev => [...prev, msg]);
  };

  const createConversation = async (title?: string) => {
    const res = await ChatService.createConversation(title);
    const conv = (res.data as any).data as Conversation;
    setConversations(prev => [conv, ...prev]);
    await selectConversation(conv.id);
  };

  return {
    conversations,
    messages,
    selectedConversationId,
    loading,
    error,
    loadConversations,
    selectConversation,
    sendMessage,
    uploadAttachment,
    createConversation,
  };
}