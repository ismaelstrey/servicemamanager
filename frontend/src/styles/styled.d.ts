import 'styled-components'
import type { AppTheme } from './theme'

// Augmentação de tipo para o tema do styled-components (PT-BR)
declare module 'styled-components' {
  // Define a tipagem DefaultTheme usada por ThemeProvider
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}