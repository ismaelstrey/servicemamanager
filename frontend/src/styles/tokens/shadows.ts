// Design Tokens - Sombras e Elevações
// Sistema de sombras para criar hierarquia visual

export const shadows = {
  // Sombras básicas
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Sombras para tema escuro (mais intensas)
  dark: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
  },

  // Elevações semânticas
  elevation: {
    0: 'none',
    1: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    2: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    3: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    4: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    5: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Sombras coloridas
  colored: {
    primary: '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
    secondary: '0 4px 14px 0 rgba(45, 212, 191, 0.25)',
    success: '0 4px 14px 0 rgba(34, 197, 94, 0.25)',
    warning: '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
    danger: '0 4px 14px 0 rgba(239, 68, 68, 0.25)',
    info: '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
  },

  // Sombras para componentes específicos
  component: {
    button: {
      default: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      active: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      focus: '0 0 0 3px rgba(16, 185, 129, 0.1)',
    },
    card: {
      default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    },
    modal: {
      backdrop: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      content: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    },
    dropdown: {
      default: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    },
    tooltip: {
      default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },
  },

  // Sombras de foco
  focus: {
    default: '0 0 0 3px rgba(16, 185, 129, 0.1)',
    primary: '0 0 0 3px rgba(16, 185, 129, 0.1)',
    secondary: '0 0 0 3px rgba(45, 212, 191, 0.1)',
    success: '0 0 0 3px rgba(34, 197, 94, 0.1)',
    warning: '0 0 0 3px rgba(245, 158, 11, 0.1)',
    danger: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    info: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
} as const;

export type ShadowTokens = typeof shadows;