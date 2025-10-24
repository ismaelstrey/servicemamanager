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

// Tema base (escuro)
export const createTheme = (mode: 'light' | 'dark' = 'dark'): DesignTokens & { mode: string } => ({
  mode,
  colors: mode === 'dark' ? darkColors : lightColors,
  typography,
  spacing,
  shadows: mode === 'dark' ? shadows.dark : shadows,
  animations,
  borders,
  zIndex,
  breakpoints,
});

// Temas pré-definidos
export const darkTheme = createTheme('dark');
export const lightTheme = createTheme('light');

// Tema padrão (compatibilidade com código existente)
export const theme = darkTheme;

// Tipos
export type AppTheme = ReturnType<typeof createTheme>;
export type ThemeMode = 'light' | 'dark';