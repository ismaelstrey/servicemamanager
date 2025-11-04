// Utilitário de monitoramento de performance usando web-vitals
// Comentário PT-BR: coleta métricas e envia para console ou endpoint
import { onCLS, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'

export type MetricsSender = (metric: Metric) => void

function defaultSender(metric: Metric): void {
  // Envia para o console como fallback
  // Formato: nome, valor e id
  // Em produção, pode enviar para API/observabilidade
  // eslint-disable-next-line no-console
  console.info('[perf]', metric.name, Math.round(metric.value), metric.id)
}

export function initPerformanceMonitor(sender?: MetricsSender): void {
  const isEnabled = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ENABLE_PERF_MONITOR
  if (isEnabled === 'false' || isEnabled === false) {
    return
  }

  const send = sender || defaultSender

  try {
    onCLS(send)
    // FID foi descontinuado nas versões mais recentes do web-vitals.
    // Em substituição, usamos INP (Interaction to Next Paint).
    onLCP(send)
    onTTFB(send)
    onINP(send)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Falha ao inicializar web-vitals:', err)
  }
}