import { useState, useEffect } from 'react';
import styled from 'styled-components';
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
import { Heading } from '../../components/ui';
import { UserRole } from '../../types/auth';
import type { ServiceOrder, ServiceOrderStatus, ServiceOrderPriority, ServiceOrderComment, ServiceOrderHistory } from '../../types/serviceOrder';
import type { User } from '../../types/user';

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
      <ErrorWrap>
        <Alert variant="error">{error || 'Ordem de serviço não encontrada'}</Alert>
        <Button onClick={() => navigate('/service-orders')}>Voltar para Ordens de Serviço</Button>
      </ErrorWrap>
    );
  }

  return (
    <PageWrap>
      <HeaderRow>
        <BreadcrumbRow>
          <Button variant="ghost" onClick={() => navigate('/service-orders')}>← Ordens de Serviço</Button>
        </BreadcrumbRow>

        <TitleSection>
          <TitleRow>
            <Heading level={1}>{serviceOrder.title}</Heading>
            <BadgesRow>
              <Badge variant={getStatusVariant(serviceOrder.status)}>{statusLabels[serviceOrder.status]}</Badge>
              <Badge variant={getPriorityVariant(serviceOrder.priority)}>{priorityLabels[serviceOrder.priority]}</Badge>
            </BadgesRow>
          </TitleRow>
          <NumberText>{serviceOrder.number}</NumberText>
        </TitleSection>

        <ActionsHeader>
          <Dropdown>
            <Button variant="secondary">Ações</Button>
            <DropdownItem onClick={() => navigate(`/service-orders/${serviceOrder.id}/edit`)}>Editar</DropdownItem>
            <DropdownItem>Duplicar</DropdownItem>
            <DropdownItem>Imprimir</DropdownItem>
            <DropdownItem variant="danger">Cancelar</DropdownItem>
          </Dropdown>
        </ActionsHeader>
      </HeaderRow>

      <Tabs activeTab={activeTab} onTabChange={(val) => setActiveTab(val as TabValue)}>
        <Tab value="details">Detalhes</Tab>
        <Tab value="tasks">Tarefas ({serviceOrder.tasks.length})</Tab>
        <Tab value="comments">Comentários ({serviceOrder.comments.length})</Tab>
        <Tab value="attachments">Anexos ({serviceOrder.attachments.length})</Tab>
        <Tab value="history">Histórico ({serviceOrder.history.length})</Tab>
      </Tabs>

      <ContentGrid>
        <MainContent>
          {activeTab === 'details' && (
            <Card>
              <Heading level={3}>Descrição</Heading>
              <Description>{serviceOrder.description}</Description>
              
              {serviceOrder.location && (
                <Section>
                  <Heading level={3}>Localização</Heading>
                  <Location>
                    <p>{serviceOrder.location.address}</p>
                    <p>{serviceOrder.location.city}, {serviceOrder.location.state} - {serviceOrder.location.zipCode}</p>
                  </Location>
                </Section>
              )}
            </Card>
          )}

          {activeTab === 'tasks' && (
            <Card>
              <Heading level={3}>Tarefas</Heading>
              <TaskList>
                {serviceOrder.tasks.map((task) => (
                  <TaskItem key={task.id}>
                    <TaskHeader>
                      <Heading level={4}>{task.title}</Heading>
                      <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'secondary'}>
                        {task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                      </Badge>
                    </TaskHeader>
                    <p>{task.description}</p>
                    {task.assignee && (
                      <p><strong>Responsável:</strong> {task.assignee.name}</p>
                    )}
                    <p><strong>Horas estimadas:</strong> {task.estimatedHours}h</p>
                    {task.actualHours && (
                      <p><strong>Horas realizadas:</strong> {task.actualHours}h</p>
                    )}
                  </TaskItem>
                ))}
              </TaskList>
            </Card>
          )}

          {activeTab === 'comments' && (
            <Card>
              <Heading level={3}>Comentários</Heading>
              <CommentsList>
                {serviceOrder.comments.map((comment) => (
                  <CommentItem key={comment.id} $internal={comment.isInternal}>
                    <CommentHeader>
                      <CommentAuthor>{comment.user?.name || comment.customer?.name || 'Usuário'}</CommentAuthor>
                      <CommentDate>{new Date(comment.createdAt).toLocaleString('pt-BR')}</CommentDate>
                      {comment.isInternal && <Badge variant="warning" size="sm">Interno</Badge>}
                    </CommentHeader>
                    <CommentContent>{comment.content}</CommentContent>
                  </CommentItem>
                ))}
              </CommentsList>

              <AddCommentSection>
                <Heading level={4}>Adicionar Comentário</Heading>
                <TextArea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Digite seu comentário..."
                  rows={3}
                />
                <CommentOptions>
                  <label>
                    <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                    Comentário interno
                  </label>
                  <Button onClick={handleAddComment} disabled={!newComment.trim() || addingComment}>
                    {addingComment ? 'Adicionando...' : 'Adicionar Comentário'}
                  </Button>
                </CommentOptions>
              </AddCommentSection>
            </Card>
          )}

          {activeTab === 'attachments' && (
            <Card>
              <Heading level={3}>Anexos</Heading>
              <AttachmentsList>
                {serviceOrder.attachments.length === 0 ? (
                  <EmptyState>
                    <p>Nenhum anexo encontrado.</p>
                  </EmptyState>
                ) : (
                  serviceOrder.attachments.map((attachment) => (
                    <AttachmentItem key={attachment.id}>
                      <AttachmentIcon>📎</AttachmentIcon>
                      <AttachmentInfo>
                        <AttachmentName>{attachment.originalName || attachment.filename}</AttachmentName>
                        <AttachmentMeta>{(attachment.size / 1024).toFixed(1)} KB • Usuário #{attachment.uploadedBy} • {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}</AttachmentMeta>
                      </AttachmentInfo>
                    </AttachmentItem>
                  ))
                )}
              </AttachmentsList>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card>
              <Heading level={3}>Histórico</Heading>
              <HistoryList>
                {serviceOrder.history.map((entry) => (
                  <HistoryEntry key={entry.id}>
                    <HistoryIcon>📝</HistoryIcon>
                    <HistoryContent>
                      <HistoryDescription>{entry.description}</HistoryDescription>
                      <HistoryMeta>{(entry.user?.name) || (entry.userId ? `Usuário #${entry.userId}` : 'Usuário')} • {new Date(entry.createdAt).toLocaleString('pt-BR')}</HistoryMeta>
                    </HistoryContent>
                  </HistoryEntry>
                ))}
              </HistoryList>
            </Card>
          )}
        </MainContent>

        <Sidebar>
          <Card>
            <Heading level={3}>Informações do Cliente</Heading>
            <InfoItem>
              <label>Nome:</label>
              <span>{serviceOrder.customerInfo.name}</span>
            </InfoItem>
            <InfoItem>
              <label>Email:</label>
              <span>{serviceOrder.customerInfo.email}</span>
            </InfoItem>
            <InfoItem>
              <label>Telefone:</label>
              <span>{serviceOrder.customerInfo.phone}</span>
            </InfoItem>
            {serviceOrder.customerInfo.company && (
              <InfoItem>
                <label>Empresa:</label>
                <span>{serviceOrder.customerInfo.company}</span>
              </InfoItem>
            )}
          </Card>

          <Card>
            <Heading level={3}>Informações da OS</Heading>
            <InfoItem>
              <label>Responsável:</label>
              <span>{serviceOrder.assignee?.name || 'Não atribuído'}</span>
            </InfoItem>
            <InfoItem>
              <label>Criado por:</label>
              <span>{serviceOrder.createdBy !== undefined ? `Usuário #${serviceOrder.createdBy}` : 'Desconhecido'}</span>
            </InfoItem>
            <InfoItem>
              <label>Data de criação:</label>
              <span>{serviceOrder.createdAt ? new Date(serviceOrder.createdAt).toLocaleDateString('pt-BR') : '-'}</span>
            </InfoItem>
            {serviceOrder.dueDate && (
              <InfoItem>
                <label>Prazo:</label>
                <span>{new Date(serviceOrder.dueDate).toLocaleDateString('pt-BR')}</span>
              </InfoItem>
            )}
            <InfoItem>
              <label>Horas estimadas:</label>
              <span>{serviceOrder.estimatedHours}h</span>
            </InfoItem>
            {serviceOrder.actualHours && (
              <InfoItem>
                <label>Horas realizadas:</label>
                <span>{serviceOrder.actualHours}h</span>
              </InfoItem>
            )}
            <InfoItem>
              <label>Custo total:</label>
              <span>{serviceOrder.cost ? `R$ ${serviceOrder.cost.totalCost.toFixed(2)}` : 'N/A'}</span>
            </InfoItem>
            <InfoItem>
              <label>Aprovado:</label>
              <span>{serviceOrder.cost?.approved ? 'Sim' : 'Não'}</span>
            </InfoItem>
          </Card>

          <Card>
            <Heading level={3}>Alterar Status</Heading>
            <FormGroup>
              <label htmlFor="status">Novo Status:</label>
              <Select id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as ServiceOrderStatus)}>
                <option value="pending">Pendente</option>
                <option value="scheduled">Agendada</option>
                <option value="in_progress">Em Andamento</option>
                <option value="waiting_parts">Aguardando Peças</option>
                <option value="waiting_customer">Aguardando Cliente</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <label htmlFor="statusComment">Comentário (opcional):</label>
              <TextArea id="statusComment" value={statusComment} onChange={(e) => setStatusComment(e.target.value)} placeholder="Adicione um comentário sobre a mudança de status..." rows={3} />
            </FormGroup>
            <Button onClick={handleStatusChange} disabled={newStatus === serviceOrder.status || updatingStatus}>
              {updatingStatus ? 'Atualizando...' : 'Atualizar Status'}
            </Button>
          </Card>

          <Card>
            <Heading level={3}>Revisão e Aprovação</Heading>
            <ButtonsRow>
              <Button variant="success" onClick={handleApprove} disabled={approving}>{approving ? 'Aprovando...' : 'Aprovar OS'}</Button>
              <Button variant="danger" onClick={handleReject} disabled={rejecting}>{rejecting ? 'Rejeitando...' : 'Rejeitar OS'}</Button>
            </ButtonsRow>
            <MutedText>Registre a decisão do cliente sobre esta OS.</MutedText>
          </Card>

          <Card>
            <Heading level={3}>Avaliação do Cliente</Heading>
            <StarsRow>
              {[1,2,3,4,5].map((star) => (
                <Button key={star} variant={customerRating >= star ? 'warning' : 'outline'} onClick={() => setCustomerRating(star)} size="sm">
                  {customerRating >= star ? '★' : '☆'}
                </Button>
              ))}
            </StarsRow>
            <TextArea value={customerFeedback} onChange={(e) => setCustomerFeedback(e.target.value)} placeholder="Descreva sua experiência com o atendimento..." rows={3} />
            <Button onClick={handleSubmitFeedback} disabled={submittingFeedback || customerRating === 0}>
              {submittingFeedback ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </Card>
        </Sidebar>
      </ContentGrid>
    </PageWrap>
  );
}

export default ServiceOrderDetailsPage;

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
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const BreadcrumbRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const BadgesRow = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const NumberText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActionsHeader = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-shrink: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Description = styled.p`
  margin: 0;
`;

const Location = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TaskItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TaskHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CommentItem = styled.div<{ $internal?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  background: ${({ theme, $internal }) => $internal ? theme.colors.background.secondary : theme.colors.background.primary};
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  justify-content: space-between;
`;

const CommentAuthor = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const CommentDate = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const CommentContent = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AddCommentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CommentOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AttachmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  background: ${({ theme }) => theme.colors.background.primary};
`;

const AttachmentIcon = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AttachmentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const AttachmentName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const AttachmentMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const HistoryEntry = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-left: 3px solid ${({ theme }) => theme.colors.border.primary};
  background: ${({ theme }) => theme.colors.background.primary};
`;

const HistoryIcon = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const HistoryContent = styled.div`
  flex: 1;
`;

const HistoryDescription = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
`;

const HistoryMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ButtonsRow = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MutedText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const StarsRow = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ErrorWrap = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;