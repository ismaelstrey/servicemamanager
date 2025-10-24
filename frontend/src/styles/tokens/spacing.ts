// Design Tokens - Espaçamentos
// Sistema de espaçamentos baseado em múltiplos de 4px

export const spacing = {
  // Escala base (múltiplos de 4px)
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',

  // Aliases semânticos
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
  '5xl': '128px',
  '6xl': '192px',

  // Espaçamentos específicos para componentes
  component: {
    // Padding interno de componentes
    button: {
      xs: '6px 12px',
      sm: '8px 16px',
      md: '12px 20px',
      lg: '16px 24px',
      xl: '20px 32px',
    },
    input: {
      xs: '6px 8px',
      sm: '8px 12px',
      md: '12px 16px',
      lg: '16px 20px',
      xl: '20px 24px',
    },
    card: {
      xs: '12px',
      sm: '16px',
      md: '20px',
      lg: '24px',
      xl: '32px',
    },
    modal: {
      xs: '16px',
      sm: '20px',
      md: '24px',
      lg: '32px',
      xl: '40px',
    },
  },

  // Gaps para layouts
  gap: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },

  // Margens para seções
  section: {
    xs: '24px',
    sm: '32px',
    md: '48px',
    lg: '64px',
    xl: '96px',
    '2xl': '128px',
  },

  // Espaçamentos para containers
  container: {
    padding: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px',
    },
    maxWidth: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
} as const;

export type SpacingTokens = typeof spacing;