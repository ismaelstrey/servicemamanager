// Design Tokens - Animações e Transições
// Sistema de animações consistente para micro-interações

export const animations = {
  // Durações
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
    slowest: '750ms',
  },

  // Curvas de easing
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Curvas customizadas
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    
    // Material Design
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },

  // Transições pré-definidas
  transition: {
    // Básicas
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Por propriedade
    color: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Combinadas
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    interactive: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Keyframes para animações
  keyframes: {
    // Fade
    fadeIn: `
      from { opacity: 0; }
      to { opacity: 1; }
    `,
    fadeOut: `
      from { opacity: 1; }
      to { opacity: 0; }
    `,
    
    // Slide
    slideInUp: `
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    `,
    slideInDown: `
      from { 
        opacity: 0;
        transform: translateY(-20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    `,
    slideInLeft: `
      from { 
        opacity: 0;
        transform: translateX(-20px);
      }
      to { 
        opacity: 1;
        transform: translateX(0);
      }
    `,
    slideInRight: `
      from { 
        opacity: 0;
        transform: translateX(20px);
      }
      to { 
        opacity: 1;
        transform: translateX(0);
      }
    `,
    
    // Scale
    scaleIn: `
      from { 
        opacity: 0;
        transform: scale(0.9);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    `,
    scaleOut: `
      from { 
        opacity: 1;
        transform: scale(1);
      }
      to { 
        opacity: 0;
        transform: scale(0.9);
      }
    `,
    
    // Rotate
    spin: `
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `,
    
    // Bounce
    bounce: `
      0%, 20%, 53%, 80%, to {
        animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
        transform: translate3d(0, 0, 0);
      }
      40%, 43% {
        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
        transform: translate3d(0, -30px, 0);
      }
      70% {
        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
        transform: translate3d(0, -15px, 0);
      }
      90% {
        transform: translate3d(0, -4px, 0);
      }
    `,
    
    // Pulse
    pulse: `
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    `,
    
    // Shake
    shake: `
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-10px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(10px);
      }
    `,
  },

  // Animações para componentes específicos
  component: {
    button: {
      hover: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      press: 'transform 100ms cubic-bezier(0.4, 0, 0.2, 1)',
      loading: 'spin 1s linear infinite',
    },
    modal: {
      enter: 'fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1), scaleIn 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      exit: 'fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1), scaleOut 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    dropdown: {
      enter: 'fadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1), slideInDown 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      exit: 'fadeOut 100ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    tooltip: {
      enter: 'fadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      exit: 'fadeOut 100ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    toast: {
      enter: 'slideInRight 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      exit: 'slideOutRight 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    loading: {
      spin: 'spin 1s linear infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
    },
  },
} as const;

export type AnimationTokens = typeof animations;