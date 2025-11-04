import { useEffect, useRef, useState } from 'react';

// Hook de notificações em tempo real via WebSocket
// Controlado por VITE_WS_URL, caso não definido o hook permanece inativo
export interface NotificationMessage {
  id: string;
  type: string;
  title?: string;
  message?: string;
  createdAt?: string;
}

export function useNotifications() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL as string | undefined;
    if (!url) return; // Inativo se não houver URL

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onerror = () => setError('Falha na conexão de notificações');
      ws.onclose = () => setConnected(false);
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data) {
            setNotifications(prev => [{
              id: String(data.id ?? crypto.randomUUID()),
              type: String(data.type ?? 'notification'),
              title: String(data.title ?? ''),
              message: String(data.message ?? ''),
              createdAt: String(data.createdAt ?? new Date().toISOString())
            }, ...prev].slice(0, 100));
          }
        } catch {
          // Ignora mensagens não JSON
        }
      };

      return () => {
        ws.close();
      };
    } catch (e) {
      setError('Não foi possível iniciar WebSocket');
    }
  }, []);

  return {
    connected,
    error,
    notifications,
    count: notifications.length
  };
}