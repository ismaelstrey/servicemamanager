import { css, keyframes } from 'styled-components'

export const srOnly = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

export const focusRing = (options?: { color?: string; offset?: number; radius?: number }) =>
  css(({ theme }) => {
    const fallback = 'rgba(0, 99, 255, 0.45)'
    const primaryScale500 = (theme as any)?.colors?.primary?.[500]
    const primaryMain = (theme as any)?.colors?.primary?.main
    const ring = (theme as any)?.colors?.ring
    const color = options?.color ?? ring ?? primaryScale500 ?? primaryMain ?? fallback
    const offset = options?.offset ?? 2
    const radius = options?.radius ?? 4
    return `
      outline: none;
      box-shadow: 0 0 0 ${offset}px ${color};
      border-radius: ${radius}px;
    `
  })

export const focusVisible = (options?: { color?: string; offset?: number; radius?: number }) => css`
  &:focus-visible {
    ${focusRing(options)}
  }
`

export const bounceIn = keyframes`
  0% { transform: scale(0.98); opacity: 0; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); }
`