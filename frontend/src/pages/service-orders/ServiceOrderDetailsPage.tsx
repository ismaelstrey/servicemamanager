import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Badge, 
  Tabs, 
  Tab, 
  TextArea, 
  Select,
  Alert,
  LogoLoader,
  Dropdown,
  DropdownItem
} from '../../components/ui';
import { UserRole } from '../../types/auth';
import type { ServiceOrder, ServiceOrderStatus, ServiceOrderPriority, ServiceOrderComment, ServiceOrderHistory } from '../../types/serviceOrder';
import type { User } from '../../types/user';
import '../../styles/service-orders.css';

const statusLabels: Record<ServiceOrderStatus, string> = {
  pending: 'Pendente',
  scheduled: 'Agendada',
  in_progress: 'Em Andamento',
  waiting_parts: 'Aguardando Peças',
  waiting_customer: 'Aguardando Cliente',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  on_hold: 'Em Espera',
  draft: 'Rascunho',
  approved: 'Aprovada',
  rejected: 'Rejeitada'
} as const;

const priorityLabels: Record<ServiceOrderPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente'
};

type TabValue = 'details' | 'tasks' | 'comments' | 'attachments' | 'history';

const getStatusVariant = (status: ServiceOrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'info';
    case 'waiting_parts':
    case 'waiting_customer': return 'warning';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
};

const getPriorityVariant = (priority: ServiceOrderPriority): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (priority) {
    case 'urgent': return 'danger';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'secondary';
  }
};

export function ServiceOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [serviceOrder, setServiceOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('details');
  // Estados para avaliação do cliente
  const [customerRating, setCustomerRating] = useState<number>(0);
  const [customerFeedback, setCustomerFeedback] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  // Estados para aprovação/rejeição
  const [approving, setApproving] = useState<boolean>(false);
  const [rejecting, setRejecting] = useState<boolean>(false);
  
  // Estados para comentários
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  
  // Estados para mudança de status
  const [newStatus, setNewStatus] = useState<ServiceOrderStatus>('pending');
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      
      // Mock data
      const mockUser: User = {
        id: 1,
        name: 'Maria Santos',
        email: 'maria.santos@telecom.com',
        role: UserRole.USER,
        status: 'active',
        emailVerified: true,
        loginAttempts: 0,
        createdAt: new Date('2024-01-10T09:00:00Z'),
        updatedAt: new Date('2024-01-10T09:00:00Z'),
        
      } as User;

      const adminUser: User = {
        id: 2,
        name: 'Carlos Admin',
        email: 'carlos@telecom.com',
        role: UserRole.ADMIN,
        status: 'active',
        emailVerified: true,
        loginAttempts: 0,
        createdAt: new Date('2024-01-10T09:00:00Z'),
        updatedAt: new Date('2024-01-10T09:00:00Z'),
      } as User;

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
        assignee: mockUser,
        location: {
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil',
          coordinates: {
            latitude: -23.5505,
            longitude: -46.6333,
          },
        },
        estimatedHours: 8,
        actualHours: 6,
        cost: {
          laborCost: 1800,
          materialCost: 500,
          travelCost: 0,
          totalCost: 2300,
          currency: 'BRL',
          approved: true,
        },
        dueDate: new Date('2024-01-20T18:00:00Z'),
        scheduledDate: new Date('2024-01-18T09:00:00Z'),
        completedAt: undefined,
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-16T14:20:00Z'),
        createdBy: 2,
        tasks: [
          {
            id: 1,
            title: 'Preparar ambiente',
            description: 'Verificar espaço físico e infraestrutura elétrica',
            status: 'completed',
            assignedTo: 1,
            assignee: mockUser,
            estimatedHours: 1,
            actualHours: 1,
            completedAt: new Date('2024-01-18T10:00:00Z'),
            order: 1,
          },
          {
            id: 2,
            title: 'Instalar hardware',
            description: 'Instalação física do servidor no rack',
            status: 'completed',
            assignedTo: 1,
            assignee: mockUser,
            estimatedHours: 2,
            actualHours: 2,
            completedAt: new Date('2024-01-18T12:30:00Z'),
            order: 2,
          },
          {
            id: 3,
            title: 'Configurar sistema operacional',
            description: 'Instalação e configuração do Windows Server 2022',
            status: 'in_progress',
            assignedTo: 1,
            assignee: mockUser,
            estimatedHours: 3,
            actualHours: 2,
            order: 3,
          },
          {
            id: 4,
            title: 'Testes finais',
            description: 'Testes de funcionamento e performance',
            status: 'pending',
            estimatedHours: 2,
            order: 4,
          }
        ],
        comments: [
          {
            id: 1,
            content: 'Ordem de serviço criada. Aguardando agendamento.',
            user: adminUser,
            customer: undefined,
            createdAt: new Date('2024-01-15T10:30:00Z'),
            updatedAt: new Date('2024-01-15T10:30:00Z'),
            isInternal: false,
            isEdited: false,
          },
          {
            id: 2,
            content: 'Agendado para 18/01 às 09:00. Cliente confirmou disponibilidade.',
            user: mockUser,
            customer: undefined,
            createdAt: new Date('2024-01-16T14:20:00Z'),
            updatedAt: new Date('2024-01-16T14:20:00Z'),
            isInternal: false,
            isEdited: false,
          },
          {
            id: 3,
            content: 'Iniciando trabalhos no local. Ambiente adequado.',
            user: mockUser,
            customer: undefined,
            createdAt: new Date('2024-01-18T09:15:00Z'),
            updatedAt: new Date('2024-01-18T09:15:00Z'),
            isInternal: true,
            isEdited: false,
          }
        ],
        attachments: [
          {
            id: 1,
            filename: 'especificacoes-servidor.pdf',
            originalName: 'Especificações do Servidor.pdf',
            url: '/files/especificacoes-servidor.pdf',
            size: 245760,
            mimeType: 'application/pdf',
            uploadedBy: 2,
            uploadedAt: new Date('2024-01-15T10:35:00Z'),
            isPublic: true,
            category: 'document',
          },
          {
            id: 2,
            filename: 'foto-instalacao.jpg',
            originalName: 'Foto da Instalação.jpg',
            url: '/files/foto-instalacao.jpg',
            size: 1024000,
            mimeType: 'image/jpeg',
            uploadedBy: 1,
            uploadedAt: new Date('2024-01-18T12:45:00Z'),
            isPublic: true,
            category: 'photo',
          }
        ],
        history: [
          {
            id: 1,
            action: 'created',
            description: 'Ordem de serviço criada',
            user: adminUser,
            createdAt: new Date('2024-01-15T10:30:00Z'),
          },
          {
            id: 2,
            action: 'status_changed',
            description: 'Status alterado de Pendente para Agendada',
            user: mockUser,
            createdAt: new Date('2024-01-16T14:20:00Z'),
            oldValue: 'pending',
            newValue: 'scheduled',
          },
          {
            id: 3,
            action: 'status_changed',
            description: 'Status alterado de Agendada para Em Andamento',
            user: mockUser,
            createdAt: new Date('2024-01-18T09:15:00Z'),
            oldValue: 'scheduled',
            newValue: 'in_progress',
          }
        ],
        tags: ['server', 'installation'],
      };

      setServiceOrder(mockServiceOrder);
      setNewStatus(mockServiceOrder.status);
    } catch (err) {
      setError('Erro ao carregar ordem de serviço');
      console.error('Service order loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Envia avaliação e feedback do cliente
  const handleSubmitFeedback = async () => {
    // Comentário: Função responsável por enviar a avaliação (nota) e feedback do cliente em pt-BR
    if (!customerRating) return;
    setSubmittingFeedback(true);
    try {
      // Aqui integrar com endpoint de feedback (quando disponível)
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (e) {
      // Poderíamos exibir um alerta de erro
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Aprovação da OS
  const handleApprove = async () => {
    // Comentário: Função responsável por aprovar a OS, atualizando status e registrando histórico em pt-BR
    setApproving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Exemplo: atualizar status para 'approved' quando backend suportar
    } finally {
      setApproving(false);
    }
  };

  // Rejeição da OS
  const handleReject = async () => {
    // Comentário: Função responsável por rejeitar a OS, atualizando status e registrando histórico em pt-BR
    setRejecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Exemplo: atualizar status para 'rejected' quando backend suportar
    } finally {
      setRejecting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !serviceOrder) return;
    
    setAddingComment(true);
    
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUser: User = {
        id: 1,
        name: 'Usuário Atual',
        email: 'usuario@telecom.com',
        role: UserRole.USER,
        status: 'active',
        emailVerified: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const comment: ServiceOrderComment = {
        id: Date.now(),
        content: newComment,
        isInternal,
        isEdited: false,
        user: currentUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setServiceOrder(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment]
      } : null);

      setNewComment('');
      setIsInternal(false);
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setAddingComment(false);
    }
  };

  const handleStatusChange = async () => {
    if (!serviceOrder) return;
    
    setUpdatingStatus(true);
    
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUser: User = {
        id: 1,
        name: 'Usuário Atual',
        email: 'usuario@telecom.com',
        role: UserRole.USER,
        status: 'active',
        emailVerified: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const historyEntry: ServiceOrderHistory = {
        id: Date.now(),
        action: 'status_changed',
        description: `Status alterado de ${statusLabels[serviceOrder.status]} para ${statusLabels[newStatus]}`,
        user: currentUser,
        createdAt: new Date(),
        oldValue: serviceOrder.status,
        newValue: newStatus,
      };

      setServiceOrder(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date(),
        history: [...prev.history, historyEntry]
      } : null);

      // Adicionar comentário se fornecido
      if (statusComment.trim()) {
        const comment: ServiceOrderComment = {
          id: Date.now() + 1,
          content: statusComment,
          isInternal: false,
          isEdited: false,
          user: currentUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setServiceOrder(prev => prev ? {
          ...prev,
          comments: [...prev.comments, comment]
        } : null);
      }

      setStatusComment('');
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <LogoLoader fullscreen message="Carregando ordem de serviço..." />;
  }

  if (error || !serviceOrder) {
    return (
      <div className="service-order-details-page service-order-details-page--error">
        <Alert variant="danger">
          {error || 'Ordem de serviço não encontrada'}
        </Alert>
        <Button onClick={() => navigate('/service-orders')}>
          Voltar para Ordens de Serviço
        </Button>
      </div>
    );
  }

  return (
    <div className="service-order-details-page">
      <div className="service-order-details-header">
        <div className="service-order-breadcrumb">
          <Button
            variant="ghost"
            onClick={() => navigate('/service-orders')}
          >
            ← Ordens de Serviço
          </Button>
        </div>

        <div className="service-order-title-section">
          <div className="service-order-title-row">
            <h1 className="service-order-title">{serviceOrder.title}</h1>
            <div className="service-order-badges">
              <Badge variant={getStatusVariant(serviceOrder.status)}>
                {statusLabels[serviceOrder.status]}
              </Badge>
              <Badge variant={getPriorityVariant(serviceOrder.priority)}>
                {priorityLabels[serviceOrder.priority]}
              </Badge>
            </div>
          </div>
          <p className="service-order-number">{serviceOrder.number}</p>
        </div>

        <div className="service-order-actions-header">
          <Dropdown>
            <Button variant="secondary">
              Ações
            </Button>
            <DropdownItem onClick={() => navigate(`/service-orders/${serviceOrder.id}/edit`)}>
              Editar
            </DropdownItem>
            <DropdownItem>
              Duplicar
            </DropdownItem>
            <DropdownItem>
              Imprimir
            </DropdownItem>
            <DropdownItem variant="danger">
              Cancelar
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <Tabs activeTab={activeTab} onTabChange={(val) => setActiveTab(val as TabValue)}>
        <Tab value="details">Detalhes</Tab>
        <Tab value="tasks">Tarefas ({serviceOrder.tasks.length})</Tab>
        <Tab value="comments">Comentários ({serviceOrder.comments.length})</Tab>
        <Tab value="attachments">Anexos ({serviceOrder.attachments.length})</Tab>
        <Tab value="history">Histórico ({serviceOrder.history.length})</Tab>
      </Tabs>

      <div className="service-order-details-content">
        <div className="service-order-main-content">
          {activeTab === 'details' && (
            <Card>
              <h3>Descrição</h3>
              <p className="service-order-description">{serviceOrder.description}</p>
              
              {serviceOrder.location && (
                <>
                  <h3>Localização</h3>
                  <div className="service-order-location">
                    <p>{serviceOrder.location.address}</p>
                    <p>{serviceOrder.location.city}, {serviceOrder.location.state} - {serviceOrder.location.zipCode}</p>
                  </div>
                </>
              )}
            </Card>
          )}

          {activeTab === 'tasks' && (
            <Card>
              <h3>Tarefas</h3>
              <div className="service-order-tasks">
                {serviceOrder.tasks.map((task) => (
                  <div key={task.id} className="service-order-task">
                    <div className="service-order-task-header">
                      <h4>{task.title}</h4>
                      <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'secondary'}>
                        {task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                      </Badge>
                    </div>
                    <p>{task.description}</p>
                    {task.assignee && (
                      <p><strong>Responsável:</strong> {task.assignee.name}</p>
                    )}
                    <p><strong>Horas estimadas:</strong> {task.estimatedHours}h</p>
                    {task.actualHours && (
                      <p><strong>Horas realizadas:</strong> {task.actualHours}h</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'comments' && (
            <Card>
              <h3>Comentários</h3>
              <div className="service-order-comments">
                {serviceOrder.comments.map((comment) => (
                  <div key={comment.id} className={`service-order-comment ${comment.isInternal ? 'service-order-comment--internal' : ''}`}>
                    <div className="service-order-comment-header">
                      <span className="service-order-comment-author">{comment.user?.name || comment.customer?.name || 'Usuário'}</span>
                      <span className="service-order-comment-date">
                        {new Date(comment.createdAt).toLocaleString('pt-BR')}
                      </span>
                      {comment.isInternal && <Badge variant="warning" size="sm">Interno</Badge>}
                    </div>
                    <div className="service-order-comment-content">
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="service-order-add-comment">
                <h4>Adicionar Comentário</h4>
                <TextArea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Digite seu comentário..."
                  rows={3}
                  className="service-order-comment-textarea"
                />
                <div className="service-order-comment-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                    />
                    Comentário interno
                  </label>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addingComment}
                  >
                    {addingComment ? 'Adicionando...' : 'Adicionar Comentário'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'attachments' && (
            <Card>
              <h3>Anexos</h3>
              <div className="service-order-attachments">
                {serviceOrder.attachments.length === 0 ? (
                  <div className="service-order-empty">
                    <p>Nenhum anexo encontrado.</p>
                  </div>
                ) : (
                  serviceOrder.attachments.map((attachment) => (
                    <div key={attachment.id} className="service-order-attachment">
                      <div className="service-order-attachment-icon">
                        📎
                      </div>
                      <div className="service-order-attachment-info">
                        <div className="service-order-attachment-name">
                          {attachment.originalName || attachment.filename}
                        </div>
                        <div className="service-order-attachment-meta">
                          {(attachment.size / 1024).toFixed(1)} KB • Usuário #{attachment.uploadedBy} • {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card>
              <h3>Histórico</h3>
              <div className="service-order-history">
                {serviceOrder.history.map((entry) => (
                  <div key={entry.id} className="service-order-history-entry">
                    <div className="service-order-history-icon">
                      📝
                    </div>
                    <div className="service-order-history-content">
                      <div className="service-order-history-description">
                        {entry.description}
                      </div>
                      <div className="service-order-history-meta">
                        {(entry.user?.name) || (entry.userId ? `Usuário #${entry.userId}` : 'Usuário')} • {new Date(entry.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="service-order-sidebar">
          <Card className="service-order-customer-info">
            <h3>Informações do Cliente</h3>
            <div className="service-order-info-item">
              <label>Nome:</label>
              <span>{serviceOrder.customerInfo.name}</span>
            </div>
            <div className="service-order-info-item">
              <label>Email:</label>
              <span>{serviceOrder.customerInfo.email}</span>
            </div>
            <div className="service-order-info-item">
              <label>Telefone:</label>
              <span>{serviceOrder.customerInfo.phone}</span>
            </div>
            {serviceOrder.customerInfo.company && (
              <div className="service-order-info-item">
                <label>Empresa:</label>
                <span>{serviceOrder.customerInfo.company}</span>
              </div>
            )}
          </Card>

          <Card className="service-order-info">
            <h3>Informações da OS</h3>
            <div className="service-order-info-item">
              <label>Responsável:</label>
              <span>{serviceOrder.assignee?.name || 'Não atribuído'}</span>
            </div>
            <div className="service-order-info-item">
              <label>Criado por:</label>
              <span>{serviceOrder.createdBy !== undefined ? `Usuário #${serviceOrder.createdBy}` : 'Desconhecido'}</span>
            </div>
            <div className="service-order-info-item">
              <label>Data de criação:</label>
              <span>{serviceOrder.createdAt ? new Date(serviceOrder.createdAt).toLocaleDateString('pt-BR') : '-'}</span>
            </div>
            {serviceOrder.dueDate && (
              <div className="service-order-info-item">
                <label>Prazo:</label>
                <span>{new Date(serviceOrder.dueDate).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            <div className="service-order-info-item">
              <label>Horas estimadas:</label>
              <span>{serviceOrder.estimatedHours}h</span>
            </div>
            {serviceOrder.actualHours && (
              <div className="service-order-info-item">
                <label>Horas realizadas:</label>
                <span>{serviceOrder.actualHours}h</span>
              </div>
            )}
            <div className="service-order-info-item">
              <label>Custo total:</label>
              <span>{serviceOrder.cost ? `R$ ${serviceOrder.cost.totalCost.toFixed(2)}` : 'N/A'}</span>
            </div>
            <div className="service-order-info-item">
              <label>Aprovado:</label>
              <span>{serviceOrder.cost?.approved ? 'Sim' : 'Não'}</span>
            </div>
          </Card>

          <Card className="service-order-status-form">
            <h3>Alterar Status</h3>
            <div className="service-order-form-group">
              <label htmlFor="status">Novo Status:</label>
              <Select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ServiceOrderStatus)}
                className="service-order-select"
              >
                <option value="pending">Pendente</option>
                <option value="scheduled">Agendada</option>
                <option value="in_progress">Em Andamento</option>
                <option value="waiting_parts">Aguardando Peças</option>
                <option value="waiting_customer">Aguardando Cliente</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </Select>
            </div>
            <div className="service-order-form-group">
              <label htmlFor="statusComment">Comentário (opcional):</label>
              <TextArea
                id="statusComment"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Adicione um comentário sobre a mudança de status..."
                rows={3}
              />
            </div>
            <Button
              onClick={handleStatusChange}
              disabled={newStatus === serviceOrder.status || updatingStatus}
              className="w-full"
            >
              {updatingStatus ? 'Atualizando...' : 'Atualizar Status'}
            </Button>
          </Card>

          <Card className="service-order-approval">
            <h3>Revisão e Aprovação</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Button variant="success" onClick={handleApprove} disabled={approving}>
                {approving ? 'Aprovando...' : 'Aprovar OS'}
              </Button>
              <Button variant="danger" onClick={handleReject} disabled={rejecting}>
                {rejecting ? 'Rejeitando...' : 'Rejeitar OS'}
              </Button>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Registre a decisão do cliente sobre esta OS.</p>
          </Card>

          <Card className="service-order-feedback">
            <h3>Avaliação do Cliente</h3>
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {[1,2,3,4,5].map((star) => (
                <Button
                  key={star}
                  variant={customerRating >= star ? 'warning' : 'outline'}
                  onClick={() => setCustomerRating(star)}
                  size="sm"
                >
                  {customerRating >= star ? '★' : '☆'}
                </Button>
              ))}
            </div>
            <TextArea
              value={customerFeedback}
              onChange={(e) => setCustomerFeedback(e.target.value)}
              placeholder="Descreva sua experiência com o atendimento..."
              rows={3}
            />
            <Button
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback || customerRating === 0}
              className="w-full"
              style={{ marginTop: '0.5rem' }}
            >
              {submittingFeedback ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ServiceOrderDetailsPage;