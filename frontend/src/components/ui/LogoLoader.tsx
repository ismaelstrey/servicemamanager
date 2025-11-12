import React, { useEffect, useState } from 'react'
import styled, { keyframes, css } from 'styled-components'

export type LogoLoaderVariant = 'spinner' | 'pulse'

export interface LogoLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  // Tamanho do logo. Pode ser número (px) ou string (ex: '2rem').
  size?: number | string
  // Mensagem opcional exibida abaixo do logo.
  message?: string
  // Quando true, ocupa a tela toda com um overlay discreto.
  fullscreen?: boolean
  // Variante de animação: rotação contínua (spinner) ou pulso suave.
  variant?: LogoLoaderVariant
}

// Animação de rotação (spinner)
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

// Animação de pulso suave
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.06); opacity: 1; }
`

const Overlay = styled.div<{ $fullscreen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  ${({ $fullscreen, theme }) => $fullscreen && css`
    position: fixed;
    inset: 0;
    background: ${theme.colors.background.overlay};
    z-index: ${theme.zIndex.overlay};
  `}
`

const LogoBox = styled.div<{ $size: string; $variant: LogoLoaderVariant; $loaded: boolean }>`
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  /* leve sombra para destacar de forma minimalista */
  box-shadow: ${({ theme }) => theme.shadows.sm};
  /* suavização na entrada do logo */
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0.8)};
  transition: opacity 180ms ease-in-out;
  
  /* Aplicar animação conforme variante escolhida */
  ${({ $variant }) => $variant === 'spinner' ? css`
    animation: ${spin} 1.1s linear infinite;
  ` : css`
    animation: ${pulse} 900ms ease-in-out infinite;
  `}
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    /* Evitar seleção e arrasto */
    user-select: none;
    pointer-events: none;
  }
`

const Message = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`

/**
 * Componente de loading utilizando o logo da aplicação.
 * Comentário: Mostra um loader minimalista com o logo.svg e animação discreta.
 */
export const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = 48,
  message,
  fullscreen = false,
  variant = 'spinner',
  className,
  ...rest
}) => {
  const sizeCss = typeof size === 'number' ? `${size}px` : size
  const [loaded, setLoaded] = useState<boolean>(false)

  // Pré-carrega o logo para acelerar exibição
  useEffect(() => {
    const img = new Image()
    img.src = '/images/logo.svg'
    img.onload = () => setLoaded(true)
  }, [])

  return (
    <Overlay $fullscreen={fullscreen} className={className} aria-busy={!loaded} {...rest}>
      <LogoBox $size={sizeCss} $variant={variant} $loaded={loaded} aria-label="Carregando">
        <img
          src="/images/logo.svg"
          alt="Carregando"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          draggable={false}
          onLoad={() => setLoaded(true)}
        />
      </LogoBox>
      {message && <Message>{message}</Message>}
    </Overlay>
  )
}

export default LogoLoader