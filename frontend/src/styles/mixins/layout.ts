import { css } from 'styled-components'

export const flexCenter = (direction: 'row' | 'column' = 'row') => css`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: ${direction};
`

export const absoluteCenter = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export const container = () =>
  css(({ theme }) => {
    const max = (theme as any)?.spacing?.container?.maxWidth?.xl ?? '1280px'
    const padding = (theme as any)?.spacing?.container?.padding?.desktop ?? (theme as any)?.spacing?.md ?? '16px'
    return `
      width: 100%;
      max-width: ${max};
      margin-left: auto;
      margin-right: auto;
      padding-left: ${padding};
      padding-right: ${padding};
    `
  })

export const hideBelow = (breakpointKey: keyof any) =>
  css(({ theme }) => {
    const bp = (theme as any)?.breakpoints?.[breakpointKey as any] ?? breakpointKey
    return `@media (max-width: ${bp}) { display: none !important; }`
  })

export const hideAbove = (breakpointKey: keyof any) =>
  css(({ theme }) => {
    const bp = (theme as any)?.breakpoints?.[breakpointKey as any] ?? breakpointKey
    return `@media (min-width: ${bp}) { display: none !important; }`
  })