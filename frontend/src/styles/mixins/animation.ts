import { css, keyframes } from 'styled-components'

export const fadeInKeyframes = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export const slideUpKeyframes = keyframes`
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

export const fadeIn = (duration?: number | string) =>
  css(({ theme }) => {
    const tokenDuration = (theme as any)?.animations?.duration?.normal ?? '250ms'
    const d = duration ?? tokenDuration
    const durationStr = typeof d === 'number' ? `${d}ms` : d
    const easing = (theme as any)?.animations?.easing?.standard ?? 'ease-in-out'
    return `animation: ${fadeInKeyframes} ${durationStr} ${easing} both;`
  })

export const slideUp = (duration?: number | string) =>
  css(({ theme }) => {
    const tokenDuration = (theme as any)?.animations?.duration?.normal ?? '250ms'
    const d = duration ?? tokenDuration
    const durationStr = typeof d === 'number' ? `${d}ms` : d
    const easing = (theme as any)?.animations?.easing?.easeOut ?? (theme as any)?.animations?.easing?.standard ?? 'ease-out'
    return `animation: ${slideUpKeyframes} ${durationStr} ${easing} both;`
  })

export const transitionBase = (props = 'all', duration?: number | string) =>
  css(({ theme }) => {
    const tokenDuration = (theme as any)?.animations?.duration?.normal ?? '250ms'
    const d = duration ?? tokenDuration
    const durationStr = typeof d === 'number' ? `${d}ms` : d
    const easing = (theme as any)?.animations?.easing?.standard ?? 'ease'
    return `transition: ${props} ${durationStr} ${easing};`
  })