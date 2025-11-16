// Tema base para styled-components
// Sistema de design baseado em tokens semânticos
import {
  darkColors,
  lightColors,
  typography,
  spacing,
  shadows,
  animations,
  borders,
  zIndex,
  breakpoints,
  type DesignTokens,
} from './tokens';

// Determina o modo efetivo quando "system" é selecionado
function resolveEffectiveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }
  return mode;
}

// Tema base (suporta light/dark e system via resolução do modo efetivo)
export const createTheme = (mode: ThemeMode = 'dark'): DesignTokens & { mode: string } => {
  const effective = resolveEffectiveMode(mode);
  const baseColors = effective === 'dark' ? darkColors : lightColors;
  const colorsWithAlias = { ...(baseColors as any), danger: (baseColors as any).error };
  return {
    mode: effective,
    colors: colorsWithAlias as any,
    typography,
    spacing,
    shadows,
    animations,
    borders,
    zIndex,
    breakpoints,
  };
};

// Temas pré-definidos
export const darkTheme = createTheme('dark');
export const lightTheme = createTheme('light');

// Tema padrão (compatibilidade com código existente)
export const theme = darkTheme;

// Tipos
export type AppTheme = ReturnType<typeof createTheme>;
export type ThemeMode = 'light' | 'dark' | 'system';