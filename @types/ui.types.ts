// Tipos utilitários para UI (variants, responsive e styled)
// Nota: para evitar depender de tipos do React neste pacote (@types),
// definimos tipos leves equivalentes a CSSProperties e ElementType.
export type CSSProperties = Record<string, string | number | undefined>;
export type ElementType = string | ((props: any) => any);

// Breakpoints padrões utilizados pelo frontend
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

// Prop responsiva: aceita um valor único ou um mapa por breakpoint
export type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>;

// Constrói props responsivas a partir de um shape de props
export type ResponsiveProps<TProps> = {
  [K in keyof TProps]?: ResponsiveProp<TProps[K]>;
};

// Variantes de componentes: utilitário para padronizar variant/size/tone
export type ComponentVariants<
  V extends string = string,
  S extends string = string,
  T extends string = string
> = {
  variant?: V;
  size?: S;
  tone?: T; // opcional, útil para tons como success/warning/danger
};

// Props comuns para componentes estilizados (styled-components)
export interface StyledProps {
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}