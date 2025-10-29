// Design Tokens - Barrel Export
// Exportação centralizada de todos os tokens de design

// Imports de tipos necessários localmente para compor DesignTokens
import type { ColorTokens } from './colors';
import type { TypographyTokens } from './typography';
import type { SpacingTokens } from './spacing';
import type { ShadowTokens } from './shadows';
import type { AnimationTokens } from './animations';
import type { BorderTokens } from './borders';
import type { ZIndexTokens } from './zIndex';
import type { BreakpointTokens } from './breakpoints';

export { colors, darkColors, lightColors, type ColorTokens } from './colors';
export { typography, type TypographyTokens } from './typography';
export { spacing, type SpacingTokens } from './spacing';
export { shadows, type ShadowTokens } from './shadows';
export { animations, type AnimationTokens } from './animations';
export { borders, type BorderTokens } from './borders';
export { zIndex, type ZIndexTokens } from './zIndex';
export { breakpoints, mediaQueries, maxWidthBreakpoints, type BreakpointTokens } from './breakpoints';

// Tipo combinado de todos os tokens
export type DesignTokens = {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  animations: AnimationTokens;
  borders: BorderTokens;
  zIndex: ZIndexTokens;
  breakpoints: BreakpointTokens;
};