import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Alert, Spinner } from '../../components/ui';
import '../../styles/tickets.css';

interface CreateTicketForm {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  equipmentId?: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
}

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  const [form, setForm] = useState<CreateTicketForm>({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    equipmentId: ''
  });

  const [errors, setErrors] = useState<Partial<CreateTicketForm>>({});

  const categories = [
    'Hardware',
    'Software',
    'Network',
    'Security',
    'Maintenance',
    'Support',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Baixa', color: 'success' },
    { value: 'medium', label: 'Média', color: 'warning' },
    { value: 'high', label: 'Alta', color: 'danger' },
    { value: 'urgent', label: 'Urgente', color: 'danger' }
  ];

  // Mock function to load equipment
  const loadEquipment = async () => {
    setLoadingEquipment(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockEquipment: Equipment[] = [
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
    const newErrors: Partial<CreateTicketForm> = {};

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
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/tickets');
      }, 2000);
    } catch {
      setError('Erro ao criar ticket. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTicketForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (success) {
    return (
      <div className="create-ticket-page">
        <div className="create-ticket-container">
          <Card>
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Ticket Criado com Sucesso!</h2>
              <p>Seu ticket foi criado e será processado em breve.</p>
              <Spinner size="sm" />
              <p className="redirect-text">Redirecionando...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="create-ticket-page">
      <div className="create-ticket-container">
        <div className="create-ticket-header">
          <h1>Criar Novo Ticket</h1>
          <Button
            variant="outline"
            onClick={() => navigate('/tickets')}
          >
            Voltar
          </Button>
        </div>

        {error && (
          <Alert
            variant="danger"
            title="Erro"
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="create-ticket-form">
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Título do Ticket *"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  placeholder="Descreva brevemente o problema"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Descrição *</label>
                <textarea
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva detalhadamente o problema, incluindo passos para reproduzir, mensagens de erro, etc."
                  rows={6}
                  disabled={isLoading}
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Prioridade *</label>
                <select
                  className="form-select"
                  value={form.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as CreateTicketForm['priority'])}
                  disabled={isLoading}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select
                  className={`form-select ${errors.category ? 'error' : ''}`}
                  value={form.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="error-message">{errors.category}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Equipamento (Opcional)</label>
                {loadingEquipment ? (
                  <div className="loading-equipment">
                    <Spinner size="sm" />
                    <span>Carregando equipamentos...</span>
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={form.equipmentId}
                    onChange={(e) => handleInputChange('equipmentId', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Nenhum equipamento específico</option>
                    {equipment.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.type})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tickets')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Criando...' : 'Criar Ticket'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateTicketPage;