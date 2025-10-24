import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Input, 
  TextArea, 
  Select, 
  Alert,
  Spinner
} from '../../components/ui';
import { ServiceOrder, ServiceOrderStatus, ServiceOrderPriority, ServiceOrderType, ServiceOrderCategory } from '../../types/serviceOrder';
import '../../styles/service-orders.css';

interface ServiceOrderFormData {
  title: string;
  description: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  type: ServiceOrderType;
  category: ServiceOrderCategory;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: string;
  };
  estimatedHours: number;
  estimatedCost: number;
  dueDate: string;
  scheduledDate?: string;
  notes: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'waiting_parts', label: 'Aguardando Peças' },
  { value: 'waiting_customer', label: 'Aguardando Cliente' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' }
];

const priorityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];

const typeOptions = [
  { value: 'installation', label: 'Instalação' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'repair', label: 'Reparo' },
  { value: 'upgrade', label: 'Upgrade' },
  { value: 'consultation', label: 'Consultoria' }
];

const categoryOptions = [
  { value: 'technical', label: 'Técnico' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'support', label: 'Suporte' },
  { value: 'emergency', label: 'Emergência' }
];

export function EditServiceOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ServiceOrderFormData>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    type: 'installation',
    category: 'technical',
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      company: ''
    },
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    estimatedHours: 0,
    estimatedCost: 0,
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      loadServiceOrder(id);
    }
  }, [id]);

  const loadServiceOrder = async (serviceOrderId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - em uma aplicação real, isso viria da API
      const mockServiceOrder: ServiceOrder = {
        id: serviceOrderId,
        number: `OS-2024-${serviceOrderId.padStart(3, '0')}`,
        title: 'Instalação de Servidor Dell PowerEdge',
        description: 'Instalação e configuração completa de servidor Dell PowerEdge R740 incluindo sistema operacional, configuração de RAID, instalação de aplicações básicas e testes de funcionamento.',
        status: 'in_progress',
        priority: 'high',
        type: 'installation',
        category: 'technical',
        customerInfo: {
          name: 'João Silva',
          email: 'joao.silva@empresa.com',
          phone: '(11) 99999-9999',
          company: 'Empresa ABC Ltda'
        },
        assignedTo: {
          id: '1',
          name: 'Maria Santos',
          email: 'maria.santos@telecom.com'
        },
        location: {
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          coordinates: '-23.5505,-46.6333'
        },
        estimatedHours: 8,
        actualHours: 6,
        estimatedCost: 2500.00,
        actualCost: 2300.00,
        dueDate: '2024-01-20T18:00:00Z',
        scheduledDate: '2024-01-18T09:00:00Z',
        completedDate: null,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        createdBy: {
          id: '2',
          name: 'Carlos Admin',
          email: 'carlos@telecom.com'
        },
        tasks: [],
        comments: [],
        attachments: [],
        history: []
      };

      // Converter os dados para o formato do formulário
      setFormData({
        title: mockServiceOrder.title,
        description: mockServiceOrder.description,
        status: mockServiceOrder.status,
        priority: mockServiceOrder.priority,
        type: mockServiceOrder.type,
        category: mockServiceOrder.category,
        customerInfo: mockServiceOrder.customerInfo,
        assignedTo: mockServiceOrder.assignedTo,
        location: mockServiceOrder.location,
        estimatedHours: mockServiceOrder.estimatedHours,
        estimatedCost: mockServiceOrder.estimatedCost,
        dueDate: mockServiceOrder.dueDate ? new Date(mockServiceOrder.dueDate).toISOString().split('T')[0] : '',
        scheduledDate: mockServiceOrder.scheduledDate ? new Date(mockServiceOrder.scheduledDate).toISOString().split('T')[0] : '',
        notes: ''
      });
    } catch (err) {
      setError('Erro ao carregar ordem de serviço');
      console.error('Service order loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ServiceOrderFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('Título é obrigatório');
    }
    
    if (!formData.description.trim()) {
      errors.push('Descrição é obrigatória');
    }
    
    if (!formData.customerInfo.name.trim()) {
      errors.push('Nome do cliente é obrigatório');
    }
    
    if (!formData.customerInfo.email.trim()) {
      errors.push('Email do cliente é obrigatório');
    }
    
    if (!formData.customerInfo.phone.trim()) {
      errors.push('Telefone do cliente é obrigatório');
    }
    
    if (!formData.location.address.trim()) {
      errors.push('Endereço é obrigatório');
    }
    
    if (!formData.location.city.trim()) {
      errors.push('Cidade é obrigatória');
    }
    
    if (!formData.location.state.trim()) {
      errors.push('Estado é obrigatório');
    }
    
    if (!formData.location.zipCode.trim()) {
      errors.push('CEP é obrigatório');
    }
    
    if (formData.estimatedHours <= 0) {
      errors.push('Horas estimadas deve ser maior que zero');
    }
    
    if (formData.estimatedCost <= 0) {
      errors.push('Custo estimado deve ser maior que zero');
    }
    
    if (!formData.dueDate) {
      errors.push('Data de vencimento é obrigatória');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em uma aplicação real, aqui seria feita a chamada para a API
      console.log('Updating service order:', formData);
      
      setSuccess(true);
      
      // Redirecionar após sucesso
      setTimeout(() => {
        navigate(`/service-orders/${id}`);
      }, 1500);
      
    } catch (err) {
      setError('Erro ao atualizar ordem de serviço. Tente novamente.');
      console.error('Service order update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-service-order-page edit-service-order-page--loading">
        <Spinner size="lg" centered label="Carregando ordem de serviço..." />
      </div>
    );
  }

  return (
    <div className="edit-service-order-page">
      <div className="edit-service-order-header">
        <div className="edit-service-order-breadcrumb">
          <Button
            variant="ghost"
            onClick={() => navigate('/service-orders')}
          >
            ← Ordens de Serviço
          </Button>
          <span>/</span>
          <Button
            variant="ghost"
            onClick={() => navigate(`/service-orders/${id}`)}
          >
            {formData.title || 'Detalhes'}
          </Button>
        </div>
        <h1 className="edit-service-order-title">Editar Ordem de Serviço</h1>
      </div>

      {error && (
        <Alert variant="danger" className="edit-service-order-alert">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="edit-service-order-alert">
          Ordem de serviço atualizada com sucesso! Redirecionando...
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="edit-service-order-form">
        <div className="edit-service-order-grid">
          <div className="edit-service-order-main">
            <Card className="edit-service-order-card">
              <h2>Informações Básicas</h2>
              
              <div className="edit-service-order-form-group">
                <label htmlFor="title">Título *</label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Digite o título da ordem de serviço"
                  required
                />
              </div>

              <div className="edit-service-order-form-group">
                <label htmlFor="description">Descrição *</label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva detalhadamente o serviço a ser realizado"
                  rows={4}
                  required
                />
              </div>

              <div className="edit-service-order-form-row">
                <div className="edit-service-order-form-group">
                  <label htmlFor="status">Status</label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="edit-service-order-form-group">
                  <label htmlFor="priority">Prioridade</label>
                  <Select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="edit-service-order-form-row">
                <div className="edit-service-order-form-group">
                  <label htmlFor="type">Tipo</label>
                  <Select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    {typeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="edit-service-order-form-group">
                  <label htmlFor="category">Categoria</label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="edit-service-order-card">
              <h2>Informações do Cliente</h2>
              
              <div className="edit-service-order-form-row">
                <div className="edit-service-order-form-group">
                  <label htmlFor="customerName">Nome *</label>
                  <Input
                    id="customerName"
                    type="text"
                    value={formData.customerInfo.name}
                    onChange={(e) => handleInputChange('customerInfo.name', e.target.value)}
                    placeholder="Nome do cliente"
                    required
                  />
                </div>

                <div className="edit-service-order-form-group">
                  <label htmlFor="customerEmail">Email *</label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerInfo.email}
                    onChange={(e) => handleInputChange('customerInfo.email', e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="edit-service-order-form-row">
                <div className="edit-service-order-form-group">
                  <label htmlFor="customerPhone">Telefone *</label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerInfo.phone}
                    onChange={(e) => handleInputChange('customerInfo.phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div className="edit-service-order-form-group">
                  <label htmlFor="customerCompany">Empresa</label>
                  <Input
                    id="customerCompany"
                    type="text"
                    value={formData.customerInfo.company}
                    onChange={(e) => handleInputChange('customerInfo.company', e.target.value)}
                    placeholder="Nome da empresa (opcional)"
                  />
                </div>
              </div>
            </Card>

            <Card className="edit-service-order-card">
              <h2>Localização</h2>
              
              <div className="edit-service-order-form-group">
                <label htmlFor="address">Endereço *</label>
                <Input
                  id="address"
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  placeholder="Rua, número, complemento"
                  required
                />
              </div>

              <div className="edit-service-order-form-row">
                <div className="edit-service-order-form-group">
                  <label htmlFor="city">Cidade *</label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    placeholder="Cidade"
                    required
                  />
                </div>

                <div className="edit-service-order-form-group">
                  <label htmlFor="state">Estado *</label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                    required
                  />
                </div>

                <div className="edit-service-order-form-group">
                  <label htmlFor="zipCode">CEP *</label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={formData.location.zipCode}
                    onChange={(e) => handleInputChange('location.zipCode', e.target.value)}
                    placeholder="00000-000"
                    required
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="edit-service-order-sidebar">
            <Card className="edit-service-order-card">
              <h2>Estimativas e Prazos</h2>
              
              <div className="edit-service-order-form-group">
                <label htmlFor="estimatedHours">Horas Estimadas *</label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="edit-service-order-form-group">
                <label htmlFor="estimatedCost">Custo Estimado (R$) *</label>
                <Input
                  id="estimatedCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="edit-service-order-form-group">
                <label htmlFor="dueDate">Data de Vencimento *</label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  required
                />
              </div>

              <div className="edit-service-order-form-group">
                <label htmlFor="scheduledDate">Data Agendada</label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate || ''}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                />
              </div>
            </Card>

            <Card className="edit-service-order-card">
              <h2>Observações</h2>
              
              <div className="edit-service-order-form-group">
                <label htmlFor="notes">Notas Adicionais</label>
                <TextArea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Informações adicionais sobre a ordem de serviço..."
                  rows={4}
                />
              </div>
            </Card>

            <div className="edit-service-order-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/service-orders/${id}`)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditServiceOrderPage;