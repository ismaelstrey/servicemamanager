// Tema base para styled-components
// Comentários em PT-BR: Define paleta de cores, tipografia e espaçamentos
export const theme = {
  colors: {
    primary: '#2563eb', // azul principal
    secondary: '#10b981', // verde secundário
    background: '#0b0f1a', // fundo escuro
    surface: '#111827', // superfície (cards, containers)
    text: '#e5e7eb', // texto padrão
    muted: '#9ca3af', // texto secundário
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    full: '9999px',
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    baseSize: '16px',
    lineHeight: 1.5,
  },
} as const

export type AppTheme = typeof theme