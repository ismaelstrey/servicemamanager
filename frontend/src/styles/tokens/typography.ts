// Design Tokens - Tipografia
// Sistema tipográfico escalável com hierarquia semântica

export const typography = {
  // Famílias de fonte
  fontFamily: {
    primary: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    secondary: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },

  // Tamanhos de fonte (escala modular 1.25)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    md: '1rem',       // 16px (alias)
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem',    // 128px
  },

  // Pesos de fonte
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Altura de linha
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Espaçamento entre letras
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Hierarquia semântica
  heading: {
    h1: {
      fontSize: '3rem',      // 48px
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',   // 36px
      fontWeight: '600',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',  // 30px
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: 'normal',
    },
    h4: {
      fontSize: '1.5rem',    // 24px
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: 'normal',
    },
    h5: {
      fontSize: '1.25rem',   // 20px
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: 'normal',
    },
    h6: {
      fontSize: '1.125rem',  // 18px
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: 'normal',
    },
  },

  // Texto de corpo
  body: {
    large: {
      fontSize: '1.125rem',  // 18px
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: 'normal',
    },
    base: {
      fontSize: '1rem',      // 16px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: 'normal',
    },
    small: {
      fontSize: '0.875rem',  // 14px
      fontWeight: '400',
      lineHeight: '1.4',
      letterSpacing: 'normal',
    },
    xs: {
      fontSize: '0.75rem',   // 12px
      fontWeight: '400',
      lineHeight: '1.3',
      letterSpacing: 'normal',
    },
  },

  // Texto de interface
  ui: {
    button: {
      fontSize: '0.875rem',  // 14px
      fontWeight: '500',
      lineHeight: '1.25',
      letterSpacing: '0.025em',
    },
    label: {
      fontSize: '0.875rem',  // 14px
      fontWeight: '500',
      lineHeight: '1.25',
      letterSpacing: 'normal',
    },
    caption: {
      fontSize: '0.75rem',   // 12px
      fontWeight: '400',
      lineHeight: '1.25',
      letterSpacing: '0.025em',
    },
    overline: {
      fontSize: '0.75rem',   // 12px
      fontWeight: '600',
      lineHeight: '1.25',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
  },

  // Código
  code: {
    inline: {
      fontSize: '0.875em',   // Relativo ao contexto
      fontWeight: '400',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
    block: {
      fontSize: '0.875rem',  // 14px
      fontWeight: '400',
      lineHeight: '1.6',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
  },
} as const;

export type TypographyTokens = typeof typography;