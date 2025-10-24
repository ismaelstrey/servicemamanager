// Design Tokens - Bordas e Raios
// Sistema de bordas consistente para componentes

export const borders = {
  // Larguras de borda
  width: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
    
    // Aliases semânticos
    none: '0px',
    thin: '1px',
    medium: '2px',
    thick: '4px',
    thicker: '8px',
  },

  // Estilos de borda
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double',
    groove: 'groove',
    ridge: 'ridge',
    inset: 'inset',
    outset: 'outset',
    none: 'none',
    hidden: 'hidden',
  },

  // Raios de borda (border-radius)
  radius: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    base: '6px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
    
    // Raios específicos
    button: {
      xs: '4px',
      sm: '6px',
      md: '8px',
      lg: '10px',
      xl: '12px',
    },
    input: {
      xs: '4px',
      sm: '6px',
      md: '8px',
      lg: '10px',
      xl: '12px',
    },
    card: {
      xs: '6px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
    modal: {
      xs: '8px',
      sm: '12px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
  },

  // Bordas pré-definidas
  preset: {
    // Básicas
    none: 'none',
    thin: '1px solid',
    medium: '2px solid',
    thick: '4px solid',
    
    // Com cores (usar com theme)
    default: '1px solid var(--border-color, #e5e7eb)',
    focus: '2px solid var(--focus-color, rgba(16, 185, 129, 0.35))',
    error: '1px solid var(--error-color, #ef4444)',
    success: '1px solid var(--success-color, #22c55e)',
    warning: '1px solid var(--warning-color, #f59e0b)',
    
    // Estilos especiais
    dashed: '1px dashed var(--border-color, #e5e7eb)',
    dotted: '2px dotted var(--border-color, #e5e7eb)',
  },

  // Bordas para componentes específicos
  component: {
    button: {
      default: '1px solid transparent',
      outline: '1px solid currentColor',
      focus: '2px solid rgba(16, 185, 129, 0.35)',
    },
    input: {
      default: '1px solid var(--border-color, #d1d5db)',
      focus: '2px solid var(--focus-color, rgba(16, 185, 129, 0.35))',
      error: '1px solid var(--error-color, #ef4444)',
      disabled: '1px solid var(--border-disabled, #9ca3af)',
    },
    card: {
      default: '1px solid var(--border-color, #e5e7eb)',
      hover: '1px solid var(--border-hover, #d1d5db)',
      selected: '2px solid var(--primary-color, #10b981)',
    },
    table: {
      cell: '1px solid var(--border-color, #e5e7eb)',
      header: '2px solid var(--border-color, #d1d5db)',
    },
    divider: {
      horizontal: '1px solid var(--border-color, #e5e7eb)',
      vertical: '1px solid var(--border-color, #e5e7eb)',
    },
  },

  // Bordas direcionais
  directional: {
    top: {
      thin: 'border-top: 1px solid',
      medium: 'border-top: 2px solid',
      thick: 'border-top: 4px solid',
    },
    right: {
      thin: 'border-right: 1px solid',
      medium: 'border-right: 2px solid',
      thick: 'border-right: 4px solid',
    },
    bottom: {
      thin: 'border-bottom: 1px solid',
      medium: 'border-bottom: 2px solid',
      thick: 'border-bottom: 4px solid',
    },
    left: {
      thin: 'border-left: 1px solid',
      medium: 'border-left: 2px solid',
      thick: 'border-left: 4px solid',
    },
  },
} as const;

export type BorderTokens = typeof borders;