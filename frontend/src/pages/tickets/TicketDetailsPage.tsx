import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import type { Ticket, TicketStatus, TicketPriority, TicketComment, TicketHistoryEntry } from '../../types/ticket';

const statusLabels: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  waiting_customer: 'Aguardando Cliente',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

const getStatusVariant = (status: TicketStatus): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (status) {
    case 'open': return 'danger';
    case 'in_progress': return 'warning';
    case 'waiting_customer': return 'info';
    case 'resolved': return 'success';
    case 'closed': return 'secondary';
    default: return 'secondary';
  }
};

const getPriorityVariant = (priority: TicketPriority): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (priority) {
    case 'low': return 'success';
    case 'medium': return 'info';
    case 'high': return 'warning';
    case 'urgent': return 'danger';
    default: return 'secondary';
  }
};

export function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  
  // Comment form state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  
  // Status update state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>('open');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTicket(id);
    }
  }, [id]);

  const loadTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data - replace with actual API response
      const mockTicket: Ticket = {
        id: ticketId,
        number: 'TK-2024-001',
        title: 'Problema na conexão de internet',
        description: 'Cliente relatando instabilidade na conexão de internet. A conexão fica intermitente durante o dia, principalmente no período da manhã. Cliente já reiniciou o modem várias vezes mas o problema persiste.',
        status: 'in_progress',
        priority: 'high',
        category: 'technical',
        source: 'phone',
        customerInfo: {
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          company: 'Empresa ABC',
          address: 'Rua das Flores, 123 - São Paulo, SP',
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo: {
          id: '1',
          name: 'Maria Santos',
          email: 'maria@telecom.com',
        },
        comments: [
          {
            id: '1',
            content: 'Ticket recebido. Iniciando análise do problema.',
            author: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria@telecom.com',
            },
            createdAt: new Date(Date.now() - 82800000).toISOString(),
            isInternal: false,
          },
          {
            id: '2',
            content: 'Verificado histórico de conexão. Identificados picos de latência no período da manhã.',
            author: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria@telecom.com',
            },
            createdAt: new Date(Date.now() - 79200000).toISOString(),
            isInternal: true,
          },
          {
            id: '3',
            content: 'Agendada visita técnica para verificação da instalação.',
            author: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria@telecom.com',
            },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            isInternal: false,
          },
        ],
        attachments: [
          {
            id: '1',
            name: 'teste-velocidade.pdf',
            url: '/attachments/teste-velocidade.pdf',
            size: 245760,
            type: 'application/pdf',
            uploadedAt: new Date(Date.now() - 79200000).toISOString(),
            uploadedBy: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria@telecom.com',
            },
          },
        ],
        history: [
          {
            id: '1',
            action: 'created',
            description: 'Ticket criado',
            performedBy: {
              id: 'system',
              name: 'Sistema',
              email: 'system@telecom.com',
            },
            performedAt: new Date(Date.now() - 86400000).toISOString(),
            oldValue: null,
            newValue: 'open',
          },
          {
            id: '2',
            action: 'assigned',
            description: 'Ticket atribuído para Maria Santos',
            performedBy: {
              id: '2',
              name: 'Admin',
              email: 'admin@telecom.com',
            },
            performedAt: new Date(Date.now() - 82800000).toISOString(),
            oldValue: null,
            newValue: 'Maria Santos',
          },
          {
            id: '3',
            action: 'status_changed',
            description: 'Status alterado de Aberto para Em Andamento',
            performedBy: {
              id: '1',
              name: 'Maria Santos',
              email: 'maria@telecom.com',
            },
            performedAt: new Date(Date.now() - 79200000).toISOString(),
            oldValue: 'open',
            newValue: 'in_progress',
          },
        ],
      };

      setTicket(mockTicket);
    } catch (err) {
      setError('Erro ao carregar ticket');
      console.error('Ticket loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !ticket) return;

    try {
      setCommentLoading(true);

      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const comment: TicketComment = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          id: '1',
          name: 'Maria Santos',
          email: 'maria@telecom.com',
        },
        createdAt: new Date().toISOString(),
        isInternal: false,
      };

      setTicket(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment],
        updatedAt: new Date().toISOString(),
      } : null);

      setNewComment('');
      setShowCommentModal(false);
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!ticket) return;

    try {
      setStatusLoading(true);

      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const historyEntry: TicketHistoryEntry = {
        id: Date.now().toString(),
        action: 'status_changed',
        description: `Status alterado de ${statusLabels[ticket.status]} para ${statusLabels[newStatus]}`,
        performedBy: {
          id: '1',
          name: 'Maria Santos',
          email: 'maria@telecom.com',
        },
        performedAt: new Date().toISOString(),
        oldValue: ticket.status,
        newValue: newStatus,
      };

      setTicket(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        history: [...prev.history, historyEntry],
      } : null);

      // Add comment if note provided
      if (statusUpdateNote.trim()) {
        const comment: TicketComment = {
          id: (Date.now() + 1).toString(),
          content: statusUpdateNote,
          author: {
            id: '1',
            name: 'Maria Santos',
            email: 'maria@telecom.com',
          },
          createdAt: new Date().toISOString(),
          isInternal: false,
        };

        setTicket(prev => prev ? {
          ...prev,
          comments: [...prev.comments, comment],
        } : null);
      }

      setStatusUpdateNote('');
      setShowStatusModal(false);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="ticket-details ticket-details--loading">
        <Spinner size="lg" centered label="Carregando ticket..." />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-details ticket-details--error">
        <Alert variant="danger" title="Erro">
          {error || 'Ticket não encontrado'}
        </Alert>
        <Button onClick={() => navigate('/tickets')}>
          Voltar para Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="ticket-details">
      <div className="ticket-details__header">
        <div className="ticket-details__breadcrumb">
          <Button
            variant="ghost"
            onClick={() => navigate('/tickets')}
            leftIcon="←"
          >
            Voltar
          </Button>
        </div>
        
        <div className="ticket-details__title-section">
          <div className="ticket-details__title-row">
            <h1 className="ticket-details__title">{ticket.title}</h1>
            <div className="ticket-details__badges">
              <Badge variant={getStatusVariant(ticket.status)}>
                {statusLabels[ticket.status]}
              </Badge>
              <Badge variant={getPriorityVariant(ticket.priority)}>
                {priorityLabels[ticket.priority]}
              </Badge>
            </div>
          </div>
          <p className="ticket-details__number">{ticket.number}</p>
        </div>
        
        <div className="ticket-details__actions">
          <Button
            variant="outline"
            onClick={() => setShowStatusModal(true)}
          >
            Alterar Status
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCommentModal(true)}
          >
            Adicionar Comentário
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
          >
            Editar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabList>
          <Tab value="details">Detalhes</Tab>
          <Tab value="comments">Comentários ({ticket.comments.length})</Tab>
          <Tab value="attachments">Anexos ({ticket.attachments.length})</Tab>
          <Tab value="history">Histórico ({ticket.history.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="details">
            <div className="ticket-details__content">
              <div className="ticket-details__main">
                <Card>
                  <CardHeader>
                    <h3>Descrição</h3>
                  </CardHeader>
                  <CardBody>
                    <p className="ticket-details__description">{ticket.description}</p>
                  </CardBody>
                </Card>
              </div>

              <div className="ticket-details__sidebar">
                <Card>
                  <CardHeader>
                    <h3>Informações do Cliente</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="ticket-details__customer-info">
                      <div className="ticket-details__info-item">
                        <label>Nome:</label>
                        <span>{ticket.customerInfo.name}</span>
                      </div>
                      <div className="ticket-details__info-item">
                        <label>Email:</label>
                        <span>{ticket.customerInfo.email}</span>
                      </div>
                      <div className="ticket-details__info-item">
                        <label>Telefone:</label>
                        <span>{ticket.customerInfo.phone}</span>
                      </div>
                      {ticket.customerInfo.company && (
                        <div className="ticket-details__info-item">
                          <label>Empresa:</label>
                          <span>{ticket.customerInfo.company}</span>
                        </div>
                      )}
                      {ticket.customerInfo.address && (
                        <div className="ticket-details__info-item">
                          <label>Endereço:</label>
                          <span>{ticket.customerInfo.address}</span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3>Detalhes do Ticket</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="ticket-details__ticket-info">
                      <div className="ticket-details__info-item">
                        <label>Categoria:</label>
                        <span>{ticket.category}</span>
                      </div>
                      <div className="ticket-details__info-item">
                        <label>Origem:</label>
                        <span>{ticket.source}</span>
                      </div>
                      <div className="ticket-details__info-item">
                        <label>Responsável:</label>
                        <span>{ticket.assignedTo?.name || 'Não atribuído'}</span>
                      </div>
                      <div className="ticket-details__info-item">
                        <label>Criado em:</label>
                        <span>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="ticket-details__info-item">
                        <label>Atualizado em:</label>
                        <span>{new Date(ticket.updatedAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="comments">
            <Card>
              <CardBody>
                <div className="ticket-details__comments">
                  {ticket.comments.length === 0 ? (
                    <div className="ticket-details__empty">
                      <p>Nenhum comentário ainda.</p>
                    </div>
                  ) : (
                    ticket.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`ticket-details__comment ${comment.isInternal ? 'ticket-details__comment--internal' : ''}`}
                      >
                        <div className="ticket-details__comment-header">
                          <div className="ticket-details__comment-author">
                            <strong>{comment.author.name}</strong>
                            {comment.isInternal && (
                              <Badge variant="info" size="sm">Interno</Badge>
                            )}
                          </div>
                          <span className="ticket-details__comment-date">
                            {new Date(comment.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="ticket-details__comment-content">
                          {comment.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel value="attachments">
            <Card>
              <CardBody>
                <div className="ticket-details__attachments">
                  {ticket.attachments.length === 0 ? (
                    <div className="ticket-details__empty">
                      <p>Nenhum anexo ainda.</p>
                    </div>
                  ) : (
                    ticket.attachments.map((attachment) => (
                      <div key={attachment.id} className="ticket-details__attachment">
                        <div className="ticket-details__attachment-info">
                          <div className="ticket-details__attachment-name">
                            📎 {attachment.name}
                          </div>
                          <div className="ticket-details__attachment-meta">
                            {formatFileSize(attachment.size)} • 
                            Enviado por {attachment.uploadedBy.name} em {' '}
                            {new Date(attachment.uploadedAt).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          Download
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel value="history">
            <Card>
              <CardBody>
                <div className="ticket-details__history">
                  {ticket.history.map((entry) => (
                    <div key={entry.id} className="ticket-details__history-entry">
                      <div className="ticket-details__history-icon">
                        {entry.action === 'created' && '🆕'}
                        {entry.action === 'assigned' && '👤'}
                        {entry.action === 'status_changed' && '🔄'}
                        {entry.action === 'priority_changed' && '⚡'}
                        {entry.action === 'comment_added' && '💬'}
                      </div>
                      <div className="ticket-details__history-content">
                        <div className="ticket-details__history-description">
                          {entry.description}
                        </div>
                        <div className="ticket-details__history-meta">
                          Por {entry.performedBy.name} em {' '}
                          {new Date(entry.performedAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Comment Modal */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        size="md"
      >
        <ModalHeader>
          <h3>Adicionar Comentário</h3>
        </ModalHeader>
        <ModalBody>
          <textarea
            className="ticket-details__comment-textarea"
            placeholder="Digite seu comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowCommentModal(false)}
            disabled={commentLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddComment}
            disabled={!newComment.trim() || commentLoading}
            loading={commentLoading}
          >
            Adicionar Comentário
          </Button>
        </ModalFooter>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        size="md"
      >
        <ModalHeader>
          <h3>Alterar Status</h3>
        </ModalHeader>
        <ModalBody>
          <div className="ticket-details__status-form">
            <div className="ticket-details__form-group">
              <label>Novo Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                className="ticket-details__select"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="ticket-details__form-group">
              <label>Comentário (opcional):</label>
              <textarea
                className="ticket-details__comment-textarea"
                placeholder="Adicione um comentário sobre a mudança de status..."
                value={statusUpdateNote}
                onChange={(e) => setStatusUpdateNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowStatusModal(false)}
            disabled={statusLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleStatusUpdate}
            disabled={statusLoading}
            loading={statusLoading}
          >
            Alterar Status
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}