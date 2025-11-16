import { createGlobalStyle } from 'styled-components'
import type { AppTheme } from './theme'

// Estilos globais: reset básico + tema
export const GlobalStyle = createGlobalStyle<{ theme: AppTheme }>`
  /* CSS Variables bridged from styled-components theme */
  :root {
    /* Core colors */
    --color-background: ${({ theme }) => theme.colors.background.primary};
    --color-surface: ${({ theme }) => theme.colors.surface};
    --color-border: ${({ theme }) => theme.colors.border.primary};
    --color-text-primary: ${({ theme }) => theme.colors.text.primary};
    --color-text-secondary: ${({ theme }) => theme.colors.text.secondary};

    /* Semantic palettes */
    --color-primary: ${({ theme }) => theme.colors.primary.main};
    --color-primary-50: ${({ theme }) => theme.colors.primary[50]};
    --color-primary-200: ${({ theme }) => theme.colors.primary[200]};
    --color-success: ${({ theme }) => theme.colors.success.main};
    --color-warning: ${({ theme }) => theme.colors.warning.main};
    --color-error: ${({ theme }) => theme.colors.error.main};
    --color-danger: ${({ theme }) => theme.colors.error.main};
    --color-info: ${({ theme }) => theme.colors.info.main};

    /* Typography */
    --font-mono: ${({ theme }) => theme.typography.fontFamily.mono};

    /* Border radius */
    --radius-md: ${({ theme }) => theme.borders.radius.md};
    --radius-lg: ${({ theme }) => theme.borders.radius.lg};
  }
  /* Reset CSS moderno */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    height: 100%;
    scroll-behavior: smooth;
  }

  body {
    height: 100%;
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  #root {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Links */
  a {
    color: inherit;
    text-decoration: none;
    transition: ${({ theme }) => theme.animations.transition.colors};

    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: 2px;
      border-radius: ${({ theme }) => theme.borders.radius.sm};
    }
  }

  /* Botões */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    transition: ${({ theme }) => theme.animations.transition.interactive};

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: 2px;
      border-radius: ${({ theme }) => theme.borders.radius.sm};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  /* Inputs */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    transition: ${({ theme }) => theme.animations.transition.interactive};

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: 2px;
    }
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.heading.h1.fontSize};
    font-weight: ${({ theme }) => theme.typography.heading.h1.fontWeight};
    line-height: ${({ theme }) => theme.typography.heading.h1.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.heading.h1.letterSpacing};
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.heading.h2.fontSize};
    font-weight: ${({ theme }) => theme.typography.heading.h2.fontWeight};
    line-height: ${({ theme }) => theme.typography.heading.h2.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.heading.h2.letterSpacing};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.heading.h3.fontSize};
    font-weight: ${({ theme }) => theme.typography.heading.h3.fontWeight};
    line-height: ${({ theme }) => theme.typography.heading.h3.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.heading.h3.letterSpacing};
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.heading.h4.fontSize};
    font-weight: ${({ theme }) => theme.typography.heading.h4.fontWeight};
    line-height: ${({ theme }) => theme.typography.heading.h4.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.heading.h4.letterSpacing};
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.heading.h5.fontSize};
    font-weight: ${({ theme }) => theme.typography.heading.h5.fontWeight};
    line-height: ${({ theme }) => theme.typography.heading.h5.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.heading.h5.letterSpacing};
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.heading.h6.fontSize};
    font-weight: ${({ theme }) => theme.typography.heading.h6.fontWeight};
    line-height: ${({ theme }) => theme.typography.heading.h6.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.heading.h6.letterSpacing};
  }

  /* Parágrafos */
  p {
    font-size: ${({ theme }) => theme.typography.body.base.fontSize};
    line-height: ${({ theme }) => theme.typography.body.base.lineHeight};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  /* Código */
  code {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    font-size: ${({ theme }) => theme.typography.code.inline.fontSize};
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  pre {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    font-size: ${({ theme }) => theme.typography.code.block.fontSize};
    line-height: ${({ theme }) => theme.typography.code.block.lineHeight};
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    overflow-x: auto;
    color: ${({ theme }) => theme.colors.text.primary};

    code {
      background: none;
      padding: 0;
    }
  }

  /* Scrollbar customizada */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.secondary};
    border-radius: ${({ theme }) => theme.borders.radius.full};

    &:hover {
      background: ${({ theme }) => theme.colors.border.tertiary};
    }
  }

  /* Seleção de texto */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
  }

  ::-moz-selection {
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
  }

  /* Utilitários de acessibilidade */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .skip-to-content {
    position: absolute;
    top: -40px;
    left: 6px;
    background: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrast};
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    text-decoration: none;
    z-index: ${({ theme }) => theme.zIndex.skipLink};
    transition: ${({ theme }) => theme.animations.transition.fast};

    &:focus {
      top: 6px;
    }
  }

  /* Animações de entrada */
  @media (prefers-reduced-motion: no-preference) {
    * {
      transition-duration: ${({ theme }) => theme.animations.duration.fast};
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`