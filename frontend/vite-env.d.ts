// Referência removida: 'vite/client'. Mantemos tipos locais para ImportMeta.

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_ENABLE_PERF_MONITOR?: string | boolean;
  // adicione mais variáveis de ambiente aqui conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}