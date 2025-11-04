import { useEffect, useRef, useState } from 'react';

// Hook de presença em tempo real usando BroadcastChannel (colaboração simples)
export function usePresence(channelName: string = 'telecomai-presence') {
  const [count, setCount] = useState(1);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const idRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (!('BroadcastChannel' in window)) {
      setCount(1);
      return;
    }

    const bc = new BroadcastChannel(channelName);
    bcRef.current = bc;

    const ping = () => bc.postMessage({ type: 'presence', id: idRef.current, ts: Date.now() });
    const interval = setInterval(ping, 2000);
    // Aviso inicial
    ping();

    const peers = new Map<string, number>();
    peers.set(idRef.current, Date.now());

    const prune = () => {
      const now = Date.now();
      for (const [pid, ts] of peers.entries()) {
        if (now - ts > 5000) peers.delete(pid);
      }
      setCount(Math.max(1, peers.size));
    };
    const pruneInterval = setInterval(prune, 3000);

    bc.onmessage = (ev) => {
      const data = ev.data;
      if (data?.type === 'presence' && typeof data.id === 'string') {
        peers.set(data.id, Date.now());
      }
    };

    window.addEventListener('beforeunload', () => {
      bc.postMessage({ type: 'leave', id: idRef.current });
    });

    return () => {
      clearInterval(interval);
      clearInterval(pruneInterval);
      bc.close();
    };
  }, [channelName]);

  return { count };
}