import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageHeader } from '../../components/layout';
import { TicketForm } from '../../components/composite';
import type { CreateTicketFormValues, PriorityOption, EquipmentOption } from '../../components/composite';
import { Card, Spinner, Button } from '../../components/ui';
import { useTickets } from '../../hooks/useTickets'
import type { CreateTicketData } from '../../types/ticket'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SuccessContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const SuccessMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.success.main};
  color: ${({ theme }) => theme.colors.success.contrast};
  font-size: 24px;
`;

const RedirectText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const { createTicket, listEquipments } = useTickets()

  const [form, setForm] = useState<CreateTicketFormValues>({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    equipmentId: ''
  });

  const [errors, setErrors] = useState<Partial<CreateTicketFormValues>>({});

  const categories = [
    'Hardware',
    'Software',
    'Network',
    'Security',
    'Maintenance',
    'Support',
    'Other'
  ];

  const priorities: PriorityOption[] = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
  ];

  const loadEquipment = async () => {
    setLoadingEquipment(true)
    try {
      const items = await listEquipments()
      setEquipment(items.map((i) => ({ id: String(i.id), name: i.name })))
    } catch (err) {
      console.error('Error loading equipment:', err)
    } finally {
      setLoadingEquipment(false)
    }
  }

  React.useEffect(() => {
    loadEquipment();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateTicketFormValues> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (form.title.length < 5) {
      newErrors.title = 'Título deve ter pelo menos 5 caracteres';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (form.description.length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (!form.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data: CreateTicketData = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category.toLowerCase() as any,
        source: 'portal' as any,
        customerInfo: { name: '-', email: '-' },
        equipmentId: form.equipmentId ? Number(form.equipmentId) : undefined,
        tags: []
      }
      const ticket = await createTicket.mutateAsync(data)
      setSuccess(true)
      setTimeout(() => {
        navigate(`/tickets/${ticket.id}`)
      }, 1500)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao criar ticket. Tente novamente.'
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTicketFormValues, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (success) {
    return (
      <PageWrapper>
        <SuccessContainer>
          <Card>
            <SuccessMessage>
              <SuccessIcon>✓</SuccessIcon>
              <h2>Ticket Criado com Sucesso!</h2>
              <p>Seu ticket foi criado e será processado em breve.</p>
              <Spinner size="sm" />
              <RedirectText>Redirecionando...</RedirectText>
            </SuccessMessage>
          </Card>
        </SuccessContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Criar Novo Ticket"
        actions={(
          <Button variant="secondary" onClick={() => navigate('/tickets')}>
            Voltar
          </Button>
        )}
      />

      <TicketForm
        values={form}
        errors={errors}
        isLoading={isLoading || loadingEquipment}
        errorMessage={error}
        categories={categories}
        priorities={priorities}
        equipmentList={equipment}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        onDismissError={() => setError(null)}
        onCancel={() => navigate('/tickets')}
      />
    </PageWrapper>
  );
};

export default CreateTicketPage;
