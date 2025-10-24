// Breakpoints Tokens
// Sistema de breakpoints responsivos baseado em mobile-first

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Tipo para breakpoints
export type BreakpointTokens = typeof breakpoints;

// Utilitários para media queries
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
} as const;

// Breakpoints para max-width (mobile-last approach quando necessário)
export const maxWidthBreakpoints = {
  xs: `(max-width: ${parseInt(breakpoints.xs) - 1}px)`,
  sm: `(max-width: ${parseInt(breakpoints.sm) - 1}px)`,
  md: `(max-width: ${parseInt(breakpoints.md) - 1}px)`,
  lg: `(max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  xl: `(max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  '2xl': `(max-width: ${parseInt(breakpoints['2xl']) - 1}px)`,
} as const;