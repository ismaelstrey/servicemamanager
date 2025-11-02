import { css } from 'styled-components'

export const truncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const lineClamp = (lines = 2) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export const headingVariant = (level: 1 | 2 | 3 | 4 | 5 | 6 = 3) =>
  css(({ theme }) => {
    const t = (theme as any)?.typography ?? {}
    const fs = t?.fontSize ?? {}
    const fw = t?.fontWeight ?? {}
    const lh = t?.lineHeight ?? {}

    const sizeMap: Record<number, string> = {
      1: t?.heading?.h1?.fontSize ?? fs['5xl'] ?? '3rem',
      2: t?.heading?.h2?.fontSize ?? fs['4xl'] ?? '2.25rem',
      3: t?.heading?.h3?.fontSize ?? fs['3xl'] ?? '1.875rem',
      4: t?.heading?.h4?.fontSize ?? fs['2xl'] ?? '1.5rem',
      5: t?.heading?.h5?.fontSize ?? fs['xl'] ?? '1.25rem',
      6: t?.heading?.h6?.fontSize ?? fs['lg'] ?? '1.125rem',
    }

    const weight = t?.heading?.[`h${level}`]?.fontWeight ?? fw.semibold ?? '600'
    const lineHeight = t?.heading?.[`h${level}`]?.lineHeight ?? lh.tight ?? '1.25'
    const letterSpacing = t?.heading?.[`h${level}`]?.letterSpacing ?? t?.letterSpacing?.normal ?? 'normal'

    return `
      font-size: ${sizeMap[level]};
      font-weight: ${weight};
      line-height: ${lineHeight};
      letter-spacing: ${letterSpacing};
      margin: 0;
    `
  })