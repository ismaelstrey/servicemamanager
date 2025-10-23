// Tema base para styled-components
// Comentários em PT-BR: Define paleta de cores, tipografia e espaçamentos
export const theme = {
  colors: {
    primary: '#10b981', // emerald-500
    primaryHover: '#34d399', // emerald-400
    accent: '#2dd4bf', // teal-400
    accentHover: '#5eead4', // teal-300
    background: '#0b1020', // base navy
    surface: '#121826', // cards/containers
    text: '#e5e7eb', // texto padrão
    muted: '#9ca3af', // texto secundário
    border: '#1e293b', // borda discreta
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
    ring: 'rgba(16, 185, 129, 0.35)', // foco derivado da primária
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
  shadows: {
    sm: '0 6px 16px rgba(0,0,0,0.20)',
    md: '0 10px 28px rgba(0,0,0,0.25)',
    lg: '0 16px 40px rgba(0,0,0,0.30)'
  },
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease'
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    baseSize: '16px',
    lineHeight: 1.5,
  },
} as const

export type AppTheme = typeof theme