import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Card, Alert, Button, Heading } from '../../components/ui';
import { ServiceOrderForm as ServiceOrderFormComponent } from '../../components/forms';
import type { ServiceOrderFormData } from '../../components/forms/ServiceOrderForm';

const CreateServiceOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ServiceOrderFormData>({
    title: '',
    description: '',
    priority: 'medium',
    type: 'installation',
    customerInfo:{
      name: '',
      email: '',
      phone: '',
      company: '',
    },
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    status: 'pending',
    category: 'network',
    estimatedHours: 0,
    estimatedCost: 0,
    dueDate: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Ordem de serviço criada com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/service-orders');
      }, 2000);
    } catch {
      setError('Erro ao criar ordem de serviço. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.lg};
  `;

  const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  `;

  const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  `;

  return (
    <PageWrapper>
      <HeaderRow>
        <Button variant="ghost" size="sm" onClick={() => navigate('/service-orders')}>← Voltar</Button>
        <Heading level={1}>Nova Ordem de Serviço</Heading>
      </HeaderRow>

      <Content>
        {error && (<Alert variant="error">{error}</Alert>)}
        {success && (<Alert variant="success">{success}</Alert>)}

        <Card>
          <ServiceOrderFormComponent
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
            submitButtonText="Criar Ordem de Serviço"
          />
        </Card>
      </Content>
    </PageWrapper>
  );
};

export default CreateServiceOrderPage;