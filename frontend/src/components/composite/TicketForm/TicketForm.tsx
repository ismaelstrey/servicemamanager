import React from 'react';
import { Card, Button, Input, Alert, Spinner } from '../../ui';
import {
  FormContainer,
  Form,
  Row,
  FieldGroup,
  FieldLabel,
  StyledSelect,
  StyledTextarea,
  ErrorText,
  Actions,
} from './TicketForm.styles';

export interface CreateTicketFormValues {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  equipmentId?: string;
}

export interface EquipmentOption {
  id: string;
  name: string;
  type?: string;
}

export interface PriorityOption {
  value: CreateTicketFormValues['priority'];
  label: string;
}

export interface TicketFormProps {
  values: CreateTicketFormValues;
  errors?: Partial<CreateTicketFormValues>;
  isLoading?: boolean;
  errorMessage?: string | null;
  categories: string[];
  priorities: PriorityOption[];
  equipmentList?: EquipmentOption[];
  onChange: (field: keyof CreateTicketFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDismissError?: () => void;
  onCancel?: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  values,
  errors = {},
  isLoading = false,
  errorMessage,
  categories,
  priorities,
  equipmentList = [],
  onChange,
  onSubmit,
  onDismissError,
  onCancel,
}) => {
  return (
    <FormContainer>
      {errorMessage && (
        <Alert variant="danger" title="Erro" onDismiss={onDismissError}>
          {errorMessage}
        </Alert>
      )}

      <Card>
        <Form onSubmit={onSubmit}>
          <Row>
            <FieldGroup>
              <Input
                label="Título do Ticket *"
                value={values.title}
                onChange={(e) => onChange('title', e.target.value)}
                error={errors.title}
                placeholder="Descreva brevemente o problema"
                disabled={isLoading}
              />
            </FieldGroup>
          </Row>

          <Row>
            <FieldGroup>
              <FieldLabel>Descrição *</FieldLabel>
              <StyledTextarea
                value={values.description}
                onChange={(e) => onChange('description', e.target.value)}
                placeholder="Descreva detalhadamente o problema, incluindo passos para reproduzir, mensagens de erro, etc."
                rows={6}
                disabled={isLoading}
              />
              {errors.description && <ErrorText>{errors.description}</ErrorText>}
            </FieldGroup>
          </Row>

          <Row>
            <FieldGroup>
              <FieldLabel>Prioridade *</FieldLabel>
              <StyledSelect
                value={values.priority}
                onChange={(e) => onChange('priority', e.target.value as CreateTicketFormValues['priority'])}
                disabled={isLoading}
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </StyledSelect>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Categoria *</FieldLabel>
              <StyledSelect
                value={values.category}
                onChange={(e) => onChange('category', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </StyledSelect>
              {errors.category && <ErrorText>{errors.category}</ErrorText>}
            </FieldGroup>
          </Row>

          <Row>
            <FieldGroup>
              <FieldLabel>Equipamento (opcional)</FieldLabel>
              <StyledSelect
                value={values.equipmentId || ''}
                onChange={(e) => onChange('equipmentId', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Selecione um equipamento</option>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </StyledSelect>
            </FieldGroup>
          </Row>

          <Actions>
            {isLoading && <Spinner size="sm" />}
            {onCancel && (
              <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
                Voltar
              </Button>
            )}
            <Button variant="primary" type="submit" disabled={isLoading}>
              Criar Ticket
            </Button>
          </Actions>
        </Form>
      </Card>
    </FormContainer>
  );
};

export default TicketForm;