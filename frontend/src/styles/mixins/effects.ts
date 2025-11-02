import { css } from 'styled-components'

export const elevation = (level = 1) =>
  css(({ theme }) => {
    const elevationMap = (theme as any)?.shadows?.elevation ?? {}
    const value = elevationMap?.[level] ?? (theme as any)?.shadows?.sm ?? '0 1px 2px rgba(0,0,0,0.08)'
    return `box-shadow: ${value};`
  })

export const hoverLift = (level = 2) => css`
  transition: transform 150ms ease, box-shadow 150ms ease;
  &:hover {
    transform: translateY(-2px);
    ${elevation(level)}
  }
`

export const rounded = (radiusKey: string | number = 'md') =>
  css(({ theme }) => {
    const r = (theme as any)?.borders?.radius?.[radiusKey as any] ?? (typeof radiusKey === 'number' ? `${radiusKey}px` : '8px')
    return `border-radius: ${r};`
  })