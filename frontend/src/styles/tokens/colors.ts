// Design Tokens - Cores
// Sistema de cores semântico com suporte a temas claro/escuro

// Tipos para assegurar formato dos tokens sem restringir a valores literais
export type ColorScale = {
  50: string; 100: string; 200: string; 300: string; 400: string; 500: string;
  600: string; 700: string; 800: string; 900: string;
  main: string; light: string; dark: string;
  darker?: string; contrast?: string;
};

export type BackgroundColors = {
  primary: string; secondary: string; tertiary: string; overlay: string;
};

export type TextColors = {
  primary: string; secondary: string; tertiary: string; inverse: string; disabled: string;
};

export type BorderColors = {
  primary: string; secondary: string; tertiary: string; focus: string;
};

export type AlphaScale = {
  white: { 5: string; 10: string; 20: string; 30: string; 40: string; 50: string; };
  black: { 5: string; 10: string; 20: string; 30: string; 40: string; 50: string; };
};

export type ColorTokens = {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: Omit<ColorScale, 'contrast'>;
  success: ColorScale;
  warning: ColorScale;
  danger: ColorScale;
  error: ColorScale;
  info: ColorScale;
  // Aliases/shortcuts para compatibilidade com código existente
  surface: string;
  ring: string;
  accent: string;
  accentHover: string;
  muted: string;
  background: BackgroundColors;
  text: TextColors;
  border: BorderColors;
  alpha: AlphaScale;
};

export const colors = {
  // Cores primárias
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // main
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    darker: '#047857',
    contrast: '#ffffff',
  },

  // Aliases/shortcuts (modo escuro padrão)
  // surface: usa background.secondary
  surface: '#121826',
  // ring: usa mesma cor de foco da borda
  ring: 'rgba(16, 185, 129, 0.35)',
  // accent: baseado na paleta secondary
  accent: '#2dd4bf',
  // accentHover: versão light da paleta secondary
  accentHover: '#5eead4',
  // muted: usa texto secundário
  muted: '#9ca3af',

  // Cores secundárias
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf', // main
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    main: '#2dd4bf',
    light: '#5eead4',
    dark: '#14b8a6',
    darker: '#0d9488',
    contrast: '#ffffff',
  },

  // Cores neutras
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    main: '#64748b',
    light: '#94a3b8',
    dark: '#475569',
    darker: '#334155',
  },

  // Estados semânticos
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // main
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
    contrast: '#ffffff',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // main
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrast: '#ffffff',
  },

  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // main
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrast: '#ffffff',
  },

  // Alias semântico para erro (mesma paleta que danger)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // main
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrast: '#ffffff',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // main
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrast: '#ffffff',
  },

  // Cores de fundo e superfície
  background: {
    primary: '#0b1020',
    secondary: '#121826',
    tertiary: '#1e293b',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },

  // Cores de texto
  text: {
    primary: '#e5e7eb',
    secondary: '#9ca3af',
    tertiary: '#6b7280',
    inverse: '#1f2937',
    disabled: '#4b5563',
  },

  // Cores de borda
  border: {
    primary: '#1e293b',
    secondary: '#374151',
    tertiary: '#4b5563',
    focus: 'rgba(16, 185, 129, 0.35)',
  },

  // Transparências
  alpha: {
    white: {
      5: 'rgba(255, 255, 255, 0.05)',
      10: 'rgba(255, 255, 255, 0.10)',
      20: 'rgba(255, 255, 255, 0.20)',
      30: 'rgba(255, 255, 255, 0.30)',
      40: 'rgba(255, 255, 255, 0.40)',
      50: 'rgba(255, 255, 255, 0.50)',
    },
    black: {
      5: 'rgba(0, 0, 0, 0.05)',
      10: 'rgba(0, 0, 0, 0.10)',
      20: 'rgba(0, 0, 0, 0.20)',
      30: 'rgba(0, 0, 0, 0.30)',
      40: 'rgba(0, 0, 0, 0.40)',
      50: 'rgba(0, 0, 0, 0.50)',
    },
  },
} satisfies ColorTokens;

// Tema escuro (padrão)
export const darkColors = colors;

// Tema claro (override)
export const lightColors = {
  ...colors,
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: '#1f2937',
    secondary: '#4b5563',
    tertiary: '#6b7280',
    inverse: '#ffffff',
    disabled: '#9ca3af',
  },
  border: {
    primary: '#e5e7eb',
    secondary: '#d1d5db',
    tertiary: '#9ca3af',
    focus: 'rgba(16, 185, 129, 0.35)',
  },
  // Overrides para aliases/shortcuts no modo claro
  surface: '#f8fafc', // background.secondary
  ring: 'rgba(16, 185, 129, 0.35)', // igual ao border.focus
  accent: '#2dd4bf', // secondary.main
  accentHover: '#5eead4', // secondary.light
  muted: '#4b5563', // text.secondary
} satisfies ColorTokens;
// Mantemos tipos declarados acima como forma canônica