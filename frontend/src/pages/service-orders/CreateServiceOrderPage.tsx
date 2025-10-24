import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Alert, Button } from '../../components/ui';
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
    category: 'technical',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    location: '',
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

  return (
    <div className="create-service-order-page">
      <div className="page-header">
        <div className="header-content">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/service-orders')}
            className="back-button"
          >
            ← Voltar
          </Button>
          <h1>Nova Ordem de Serviço</h1>
        </div>
      </div>

      <div className="page-content">
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        <Card>
          <ServiceOrderFormComponent
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
            submitButtonText="Criar Ordem de Serviço"
          />
        </Card>
      </div>
    </div>
  );
};

export default CreateServiceOrderPage;