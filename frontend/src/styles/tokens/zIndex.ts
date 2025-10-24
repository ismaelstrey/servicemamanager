// Design Tokens - Z-Index
// Sistema de camadas para controle de sobreposição

export const zIndex = {
  // Valores base
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  skipLink: 1070,
  toast: 1080,
  tooltip: 1090,

  // Camadas específicas por componente
  component: {
    // Navegação
    navbar: 1020,
    sidebar: 1010,
    breadcrumb: 5,
    
    // Conteúdo
    content: 1,
    card: 2,
    cardHover: 3,
    
    // Overlays
    backdrop: 1040,
    modal: 1050,
    drawer: 1045,
    
    // Feedback
    toast: 1080,
    notification: 1085,
    alert: 1070,
    
    // Interação
    dropdown: 1000,
    popover: 1060,
    tooltip: 1090,
    contextMenu: 1065,
    
    // Loading
    loading: 1075,
    spinner: 1076,
    
    // Especiais
    skipToContent: 1100,
    debugPanel: 9999,
  },

  // Camadas por contexto
  context: {
    // Layout principal
    layout: {
      header: 1020,
      sidebar: 1010,
      main: 1,
      footer: 5,
    },
    
    // Modais e overlays
    overlay: {
      backdrop: 1040,
      content: 1050,
      header: 1051,
      footer: 1051,
      closeButton: 1052,
    },
    
    // Navegação
    navigation: {
      primary: 1020,
      secondary: 1015,
      mobile: 1025,
      dropdown: 1030,
    },
    
    // Formulários
    form: {
      field: 1,
      label: 2,
      error: 3,
      help: 2,
      dropdown: 1000,
      datepicker: 1005,
    },
    
    // Tabelas
    table: {
      header: 10,
      stickyColumn: 11,
      dropdown: 1000,
      tooltip: 1090,
    },
  },

  // Utilitários
  utility: {
    hide: -1,
    behind: -10,
    base: 0,
    raised: 1,
    floating: 10,
    overlay: 100,
    modal: 1000,
    maximum: 9999,
  },
} as const;

export type ZIndexTokens = typeof zIndex;