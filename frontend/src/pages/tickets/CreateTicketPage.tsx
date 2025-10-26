import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageHeader } from '../../components/layout/PageHeader';
import { TicketForm } from '../../components/composite/TicketForm';
import type { CreateTicketFormValues, PriorityOption, EquipmentOption } from '../../components/composite/TicketForm';
import { Card, Spinner, Button } from '../../components/ui';

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

  // Mock function to load equipment
  const loadEquipment = async () => {
    setLoadingEquipment(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockEquipment: EquipmentOption[] = [
        { id: '1', name: 'Server-01', type: 'Server' },
        { id: '2', name: 'Switch-Core-01', type: 'Network' },
        { id: '3', name: 'Firewall-01', type: 'Security' },
        { id: '4', name: 'Router-WAN-01', type: 'Network' },
        { id: '5', name: 'UPS-01', type: 'Power' }
      ];
      setEquipment(mockEquipment);
    } catch (err) {
      console.error('Error loading equipment:', err);
    } finally {
      setLoadingEquipment(false);
    }
  };

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setTimeout(() => {
        navigate('/tickets');
      }, 2000);
    } catch {
      setError('Erro ao criar ticket. Tente novamente.');
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