import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
import { Heading } from '../../components/ui';
import type { ServiceOrder, ServiceOrderStatus, ServiceOrderPriority, ServiceOrderType, ServiceOrderCategory } from '../../types/serviceOrder';
import { UserRole } from '../../types/auth';

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
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'network', label: 'Rede' },
  { value: 'security', label: 'Segurança' },
  { value: 'infrastructure', label: 'Infraestrutura' },
  { value: 'support', label: 'Suporte' },
  { value: 'project', label: 'Projeto' }
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
    category: 'hardware',
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
        id: Number(serviceOrderId),
        providerId: 1,
        number: `OS-2024-${serviceOrderId.padStart(3, '0')}`,
        title: 'Instalação de Servidor Dell PowerEdge',
        description: 'Instalação e configuração completa de servidor Dell PowerEdge R740 incluindo sistema operacional, configuração de RAID, instalação de aplicações básicas e testes de funcionamento.',
        status: 'in_progress',
        priority: 'high',
        type: 'installation',
        category: 'hardware',
        customerInfo: {
          name: 'João Silva',
          email: 'joao.silva@empresa.com',
          phone: '(11) 99999-9999',
          company: 'Empresa ABC Ltda'
        },
        assignedTo: 1,
        assignee: {
          id: 1,
          name: 'Maria Santos',
          email: 'maria.santos@telecom.com',
          role: UserRole.USER,
          status: 'active',
          emailVerified: true,
          loginAttempts: 0,
          createdAt: new Date('2024-01-10T09:00:00Z'),
          updatedAt: new Date('2024-01-10T09:00:00Z')
        } as unknown as import('../../types/user').User,
        location: {
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil',
          coordinates: {
            latitude: -23.5505,
            longitude: -46.6333
          }
        },
        estimatedHours: 8,
        actualHours: 6,
        dueDate: new Date('2024-01-20T18:00:00Z'),
        scheduledDate: new Date('2024-01-18T09:00:00Z'),
        completedAt: undefined,
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-16T14:20:00Z'),
        createdBy: 2,
        tasks: [],
        comments: [],
        attachments: [],
        history: [],
        tags: []
      };

      // Converter os dados para o formato do formulário
      setFormData({
        title: mockServiceOrder.title,
        description: mockServiceOrder.description,
        status: mockServiceOrder.status,
        priority: mockServiceOrder.priority,
        type: mockServiceOrder.type,
        category: mockServiceOrder.category,
        customerInfo: {
          name: mockServiceOrder.customerInfo.name,
          email: mockServiceOrder.customerInfo.email,
          phone: mockServiceOrder.customerInfo.phone ?? '',
          company: mockServiceOrder.customerInfo.company ?? ''
        },
        assignedTo: mockServiceOrder.assignee ? {
          id: String(mockServiceOrder.assignee.id),
          name: mockServiceOrder.assignee.name,
          email: mockServiceOrder.assignee.email
        } : undefined,
        location: {
          address: mockServiceOrder.location?.address ?? '',
          city: mockServiceOrder.location?.city ?? '',
          state: mockServiceOrder.location?.state ?? '',
          zipCode: mockServiceOrder.location?.zipCode ?? '',
          coordinates: mockServiceOrder.location?.coordinates ? `${mockServiceOrder.location.coordinates.latitude},${mockServiceOrder.location.coordinates.longitude}` : undefined
        },
        estimatedHours: mockServiceOrder.estimatedHours ?? 0,
        estimatedCost: 0,
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
      setFormData(prev => {
        if (parent === 'customerInfo') {
          return {
            ...prev,
            customerInfo: {
              ...prev.customerInfo,
              [child]: value as string
            }
          };
        }
        if (parent === 'location') {
          return {
            ...prev,
            location: {
              ...prev.location,
              [child]: value as string
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value as never
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
      <LoadingWrap>
        <Spinner size="lg" centered label="Carregando ordem de serviço..." />
      </LoadingWrap>
    );
  }

  return (
    <PageWrap>
      <HeaderRow>
        <BreadcrumbRow>
          <Button variant="ghost" onClick={() => navigate('/service-orders')}>← Ordens de Serviço</Button>
          <span>/</span>
          <Button variant="ghost" onClick={() => navigate(`/service-orders/${id}`)}>{formData.title || 'Detalhes'}</Button>
        </BreadcrumbRow>
        <Heading level={1}>Editar Ordem de Serviço</Heading>
      </HeaderRow>

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {success && (
        <Alert variant="success">Ordem de serviço atualizada com sucesso! Redirecionando...</Alert>
      )}

      <FormEl onSubmit={handleSubmit}>
        <Grid>
          <Main>
            <Card>
              <Heading level={2}>Informações Básicas</Heading>
              
              <FormGroup>
                <label htmlFor="title">Título *</label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Digite o título da ordem de serviço"
                  required
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="description">Descrição *</label>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva detalhadamente o serviço a ser realizado"
                  rows={4}
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
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
                </FormGroup>

                <FormGroup>
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
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
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
                </FormGroup>

                <FormGroup>
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
                </FormGroup>
              </FormRow>
            </Card>

            <Card>
              <Heading level={2}>Informações do Cliente</Heading>
              
              <FormRow>
                <FormGroup>
                  <label htmlFor="customerName">Nome *</label>
                  <Input
                    id="customerName"
                    type="text"
                    value={formData.customerInfo.name}
                    onChange={(e) => handleInputChange('customerInfo.name', e.target.value)}
                    placeholder="Nome do cliente"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label htmlFor="customerEmail">Email *</label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerInfo.email}
                    onChange={(e) => handleInputChange('customerInfo.email', e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <label htmlFor="customerPhone">Telefone *</label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerInfo.phone}
                    onChange={(e) => handleInputChange('customerInfo.phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label htmlFor="customerCompany">Empresa</label>
                  <Input
                    id="customerCompany"
                    type="text"
                    value={formData.customerInfo.company}
                    onChange={(e) => handleInputChange('customerInfo.company', e.target.value)}
                    placeholder="Nome da empresa (opcional)"
                  />
                </FormGroup>
              </FormRow>
            </Card>

            <Card>
              <Heading level={2}>Localização</Heading>
              
              <FormGroup>
                <label htmlFor="address">Endereço *</label>
                <Input
                  id="address"
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  placeholder="Rua, número, complemento"
                  required
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label htmlFor="city">Cidade *</label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    placeholder="Cidade"
                    required
                  />
                </FormGroup>

                <FormGroup>
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
                </FormGroup>

                <FormGroup>
                  <label htmlFor="zipCode">CEP *</label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={formData.location.zipCode}
                    onChange={(e) => handleInputChange('location.zipCode', e.target.value)}
                    placeholder="00000-000"
                    required
                  />
                </FormGroup>
              </FormRow>
            </Card>
          </Main>

          <Sidebar>
            <Card>
              <Heading level={2}>Estimativas e Prazos</Heading>
              
              <FormGroup>
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
              </FormGroup>

              <FormGroup>
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
              </FormGroup>

              <FormGroup>
                <label htmlFor="dueDate">Data de Vencimento *</label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="scheduledDate">Data Agendada</label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate || ''}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                />
              </FormGroup>
            </Card>

            <Card>
              <Heading level={2}>Observações</Heading>
              
              <FormGroup>
                <label htmlFor="notes">Notas Adicionais</label>
                <TextArea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Informações adicionais sobre a ordem de serviço..."
                  rows={4}
                />
              </FormGroup>
            </Card>

            <ActionsRow>
              <Button type="button" variant="secondary" onClick={() => navigate(`/service-orders/${id}`)} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
            </ActionsRow>
          </Sidebar>
        </Grid>
      </FormEl>
    </PageWrap>
  );
}

export default EditServiceOrderPage;

const PageWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BreadcrumbRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const LoadingWrap = styled.div`
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const FormEl = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`;