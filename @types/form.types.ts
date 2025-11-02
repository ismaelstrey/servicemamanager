// Tipos utilitários para validação de formulários

// Erro de campo individual
export interface FormFieldError {
  field: string;
  message: string;
  type?: string; // ex.: 'required', 'minLength', 'pattern'
  code?: string; // código interno opcional
}

// Mapa de erros por campo (suporta string simples ou múltiplos erros)
export type FieldErrors<TFields> = Partial<
  Record<keyof TFields, string | FormFieldError | FormFieldError[]>
>;

// Resultado da validação
export interface ValidationResult<TFields> {
  valid: boolean;
  errors?: FieldErrors<TFields>;
  values?: TFields; // valores possivelmente normalizados
}

// Função validadora genérica
export type Validator<TFields> = (values: TFields) => ValidationResult<TFields>;

// Handler de submit que considera validação
export type FormSubmitHandler<TFields> = (
  values: TFields,
  validate: Validator<TFields>
) => Promise<void> | void;