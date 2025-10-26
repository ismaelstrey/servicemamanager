import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TicketForm } from './TicketForm';
import type { CreateTicketFormValues, PriorityOption } from './TicketForm';

const meta: Meta<typeof TicketForm> = {
  title: 'Composite/TicketForm',
  component: TicketForm,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof TicketForm>;

const categories = [
  'Hardware',
  'Software',
  'Network',
  'Security',
  'Maintenance',
  'Support',
  'Other',
];

const priorities: PriorityOption[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export const Default: Story = {
  render: () => {
    const [values, setValues] = React.useState<CreateTicketFormValues>({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      equipmentId: '',
    });

    const [errors, setErrors] = React.useState<Partial<CreateTicketFormValues>>({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const onChange = (field: keyof CreateTicketFormValues, value: string) => {
      setValues(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Simple validation
      const newErrors: Partial<CreateTicketFormValues> = {};
      if (!values.title?.trim()) newErrors.title = 'Título é obrigatório';
      if (!values.description?.trim()) newErrors.description = 'Descrição é obrigatória';
      if (!values.category) newErrors.category = 'Categoria é obrigatória';

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      setIsLoading(true);
      setErrorMessage(null);
      await new Promise(r => setTimeout(r, 1200));
      setIsLoading(false);
      alert('Ticket criado!');
    };

    return (
      <TicketForm
        values={values}
        errors={errors}
        isLoading={isLoading}
        errorMessage={errorMessage}
        categories={categories}
        priorities={priorities}
        equipmentList={[{ id: '1', name: 'Server-01' }, { id: '2', name: 'Switch-Core-01' }]}
        onChange={onChange}
        onSubmit={onSubmit}
        onDismissError={() => setErrorMessage(null)}
        onCancel={() => alert('Voltar')}
      />
    );
  },
};