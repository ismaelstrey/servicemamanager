(() => {
  // Helper: get current script element
  const getCurrentScript = () => {
    const cs = document.currentScript;
    if (cs) return cs;
    const scripts = Array.from(document.getElementsByTagName('script'));
    return scripts.find(s => (s.getAttribute('src') || '').includes('chat-widget.js')) || null;
  };

  const scriptEl = getCurrentScript();
  const ds = scriptEl ? scriptEl.dataset : {};

  // Read configuration from data-* attributes
  const providerId = ds.providerId || '';
  const theme = ds.theme || 'light';
  const sseEndpoint = ds.sseEndpoint || '/chat/events';
  const mountSelector = ds.mount || null;

  // Create minimal UI container
  const container = mountSelector ? document.querySelector(mountSelector) : null;
  const root = container || (() => {
    const el = document.createElement('div');
    el.id = 'chat-widget-root';
    el.style.position = 'fixed';
    el.style.bottom = '16px';
    el.style.right = '16px';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
    return el;
  })();

  // Basic styles
  const styles = document.createElement('style');
  styles.textContent = `
    .cw-bubble { background: ${theme === 'dark' ? '#222' : '#fff'}; color: ${theme === 'dark' ? '#eee' : '#222'}; border: 1px solid #ccc; border-radius: 10px; padding: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
    .cw-status { font-size: 12px; opacity: 0.7; }
  `;
  document.head.appendChild(styles);

  const bubble = document.createElement('div');
  bubble.className = 'cw-bubble';
  bubble.innerHTML = `
    <div class="cw-status">Conectando ao chat...</div>
  `;
  root.appendChild(bubble);

  // Initialize SSE connection
  const buildSseUrl = () => {
    try {
      const url = new URL(sseEndpoint, window.location.origin);
      if (providerId) url.searchParams.set('providerId', providerId);
      return url.toString();
    } catch {
      // Fallback for relative path
      const qp = providerId ? `?providerId=${encodeURIComponent(providerId)}` : '';
      return `${sseEndpoint}${qp}`;
    }
  };

  const sseUrl = buildSseUrl();
  let es = null;
  try {
    es = new EventSource(sseUrl, { withCredentials: false });
  } catch (err) {
    console.warn('Falha ao inicializar SSE:', err);
  }

  if (es) {
    es.addEventListener('open', (evt) => {
      try {
        const data = JSON.parse(evt.data);
        bubble.querySelector('.cw-status').textContent = `Chat conectado • ${new Date(data.ts).toLocaleTimeString()}`;
      } catch {
        bubble.querySelector('.cw-status').textContent = 'Chat conectado';
      }
    });

    es.addEventListener('ping', (evt) => {
      // Keep-alive; optionally update UI
      // no-op
    });

    es.onerror = () => {
      bubble.querySelector('.cw-status').textContent = 'Conexão instável, tentando reconectar...';
    };
  }
})();