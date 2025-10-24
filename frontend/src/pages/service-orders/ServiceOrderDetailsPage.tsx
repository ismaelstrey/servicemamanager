import React, { useState, useEffect } from 'react';
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
  Spinner,
  Dropdown,
  DropdownItem
} from '../../components/ui';
import { ServiceOrder, ServiceOrderStatus, ServiceOrderPriority, ServiceOrderComment, ServiceOrderHistoryEntry } from '../../types/serviceOrder';
import '../../styles/service-orders.css';

const statusLabels: Record<ServiceOrderStatus, string> = {
  pending: 'Pendente',
  scheduled: 'Agendada',
  in_progress: 'Em Andamento',
  waiting_parts: 'Aguardando Peças',
  waiting_customer: 'Aguardando Cliente',
  completed: 'Concluída',
  cancelled: 'Cancelada'
};

const priorityLabels: Record<ServiceOrderPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente'
};

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
  const [activeTab, setActiveTab] = useState('details');
  
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
        tasks: [
          {
            id: '1',
            title: 'Preparar ambiente',
            description: 'Verificar espaço físico e infraestrutura elétrica',
            status: 'completed',
            assignee: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria.santos@telecom.com'
            },
            estimatedHours: 1,
            actualHours: 1,
            completedAt: '2024-01-18T10:00:00Z'
          },
          {
            id: '2',
            title: 'Instalar hardware',
            description: 'Instalação física do servidor no rack',
            status: 'completed',
            assignee: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria.santos@telecom.com'
            },
            estimatedHours: 2,
            actualHours: 2,
            completedAt: '2024-01-18T12:30:00Z'
          },
          {
            id: '3',
            title: 'Configurar sistema operacional',
            description: 'Instalação e configuração do Windows Server 2022',
            status: 'in_progress',
            assignee: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria.santos@telecom.com'
            },
            estimatedHours: 3,
            actualHours: 2
          },
          {
            id: '4',
            title: 'Testes finais',
            description: 'Testes de funcionamento e performance',
            status: 'pending',
            estimatedHours: 2
          }
        ],
        comments: [
          {
            id: '1',
            content: 'Ordem de serviço criada. Aguardando agendamento.',
            author: {
              id: '2',
              name: 'Carlos Admin',
              email: 'carlos@telecom.com'
            },
            createdAt: '2024-01-15T10:30:00Z',
            isInternal: false
          },
          {
            id: '2',
            content: 'Agendado para 18/01 às 09:00. Cliente confirmou disponibilidade.',
            author: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria.santos@telecom.com'
            },
            createdAt: '2024-01-16T14:20:00Z',
            isInternal: false
          },
          {
            id: '3',
            content: 'Iniciando trabalhos no local. Ambiente adequado.',
            author: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria.santos@telecom.com'
            },
            createdAt: '2024-01-18T09:15:00Z',
            isInternal: true
          }
        ],
        attachments: [
          {
            id: '1',
            name: 'especificacoes-servidor.pdf',
            url: '/files/especificacoes-servidor.pdf',
            size: 245760,
            type: 'application/pdf',
            uploadedBy: {
              id: '2',
              name: 'Carlos Admin',
              email: 'carlos@telecom.com'
            },
            uploadedAt: '2024-01-15T10:35:00Z'
          },
          {
            id: '2',
            name: 'foto-instalacao.jpg',
            url: '/files/foto-instalacao.jpg',
            size: 1024000,
            type: 'image/jpeg',
            uploadedBy: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria.santos@telecom.com'
            },
            uploadedAt: '2024-01-18T12:45:00Z'
          }
        ],
        history: [
          {
            id: '1',
            action: 'created',
            description: 'Ordem de serviço criada',
            user: {
              id: '2',
              name: 'Carlos Admin',
              email: 'carlos@telecom.com'
            },
            timestamp: '2024-01-15T10:30:00Z',
            changes: {}
          },
          {
            id: '2',
            action: 'status_changed',
            description: 'Status alterado de Pendente para Agendada',
            user: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria.santos@telecom.com'
            },
            timestamp: '2024-01-16T14:20:00Z',
            changes: {
              field: 'status',
              oldValue: 'pending',
              newValue: 'scheduled'
            }
          },
          {
            id: '3',
            action: 'status_changed',
            description: 'Status alterado de Agendada para Em Andamento',
            user: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria.santos@telecom.com'
            },
            timestamp: '2024-01-18T09:15:00Z',
            changes: {
              field: 'status',
              oldValue: 'scheduled',
              newValue: 'in_progress'
            }
          }
        ]
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

  const handleAddComment = async () => {
    if (!newComment.trim() || !serviceOrder) return;
    
    setAddingComment(true);
    
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const comment: ServiceOrderComment = {
        id: String(Date.now()),
        content: newComment,
        author: {
          id: '1',
          name: 'Usuário Atual',
          email: 'usuario@telecom.com'
        },
        createdAt: new Date().toISOString(),
        isInternal
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
      
      const historyEntry: ServiceOrderHistoryEntry = {
        id: String(Date.now()),
        action: 'status_changed',
        description: `Status alterado de ${statusLabels[serviceOrder.status]} para ${statusLabels[newStatus]}`,
        user: {
          id: '1',
          name: 'Usuário Atual',
          email: 'usuario@telecom.com'
        },
        timestamp: new Date().toISOString(),
        changes: {
          field: 'status',
          oldValue: serviceOrder.status,
          newValue: newStatus
        }
      };

      setServiceOrder(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        history: [...prev.history, historyEntry]
      } : null);

      // Adicionar comentário se fornecido
      if (statusComment.trim()) {
        const comment: ServiceOrderComment = {
          id: String(Date.now() + 1),
          content: statusComment,
          author: {
            id: '1',
            name: 'Usuário Atual',
            email: 'usuario@telecom.com'
          },
          createdAt: new Date().toISOString(),
          isInternal: false
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
    return (
      <div className="service-order-details-page service-order-details-page--loading">
        <Spinner size="lg" centered label="Carregando ordem de serviço..." />
      </div>
    );
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                      <span className="service-order-comment-author">{comment.author.name}</span>
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
                          {attachment.name}
                        </div>
                        <div className="service-order-attachment-meta">
                          {(attachment.size / 1024).toFixed(1)} KB • {attachment.uploadedBy.name} • {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
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
                        {entry.user.name} • {new Date(entry.timestamp).toLocaleString('pt-BR')}
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
              <span>{serviceOrder.assignedTo?.name || 'Não atribuído'}</span>
            </div>
            <div className="service-order-info-item">
              <label>Criado por:</label>
              <span>{serviceOrder.createdBy.name}</span>
            </div>
            <div className="service-order-info-item">
              <label>Data de criação:</label>
              <span>{new Date(serviceOrder.createdAt).toLocaleDateString('pt-BR')}</span>
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
              <label>Custo estimado:</label>
              <span>R$ {serviceOrder.estimatedCost?.toFixed(2)}</span>
            </div>
            {serviceOrder.actualCost && (
              <div className="service-order-info-item">
                <label>Custo real:</label>
                <span>R$ {serviceOrder.actualCost.toFixed(2)}</span>
              </div>
            )}
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
        </div>
      </div>
    </div>
  );
}

export default ServiceOrderDetailsPage;