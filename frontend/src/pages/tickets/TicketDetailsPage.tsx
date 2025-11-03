import  { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardBody,
  Button, Badge,
  Tabs, Tab, TabList, TabPanels, TabPanel,
  Spinner, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Toast
} from '../../components/ui';
import { ApiService } from '../../services/api';
import TicketService from '../../services/ticketService';
import type { Ticket, TicketStatus, TicketComment, TicketHistory } from '../../types/ticket';
import type { Priority } from '../../types/common';

const statusLabels: Record<TicketStatus, string> = {
  open: 'Aberto',
  assigned: 'Atribuído',
  in_progress: 'Em Andamento',
  pending: 'Pendente',
  resolved: 'Resolvido',
  closed: 'Fechado',
  cancelled: 'Cancelado',
};

const priorityLabels: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

const getStatusVariant = (status: TicketStatus): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (status) {
    case 'open': return 'danger';
    case 'assigned': return 'info';
    case 'in_progress': return 'warning';
    case 'pending': return 'info';
    case 'resolved': return 'success';
    case 'closed': return 'secondary';
    case 'cancelled': return 'secondary';
    default: return 'secondary';
  }
};

const getPriorityVariant = (priority: Priority): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  switch (priority) {
    case 'low': return 'success';
    case 'medium': return 'info';
    case 'high': return 'warning';
    case 'urgent': return 'danger';
    default: return 'secondary';
  }
};

// Styled-components wrappers para facilitar manutenção/customização
const TicketDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const BadgesRow = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TicketNumber = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InfoItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  &:last-child { border-bottom: none; }
  label { color: ${({ theme }) => theme.colors.text.secondary}; }
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const InputRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newTag, setNewTag] = useState('');
  
  // Comment form state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  
  // Status update state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>('open');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVariant, setToastVariant] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  useEffect(() => {
    if (id) {
      loadTicket(id);
    }
  }, [id]);

  const loadTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Buscar dados reais da API
      const data = await TicketService.getTicketById(Number(ticketId));
      // Normalizar campos para evitar quebras no layout
      const normalized: Ticket = {
        ...data,
        number: (data as any).number ?? String(data.id),
        status: (((data as any).status === 'waiting_client') ? 'pending' : (data as any).status) as TicketStatus,
        customerInfo: (data as any).customerInfo ?? {
          name: (data as any).customerName ?? '',
          email: (data as any).customerEmail ?? '',
          phone: (data as any).customerPhone ?? '',
          company: (data as any).customerCompany ?? undefined,
          department: (data as any).customerDepartment ?? undefined,
        },
        comments: (data as any).comments ?? [],
        attachments: (data as any).attachments ?? [],
        history: (data as any).history ?? [],
        tags: (data as any).tags ?? [],
      } as Ticket;

      setTicket(normalized);
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

      // Simulate API call for adding comment - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const comment: TicketComment = {
        id: Date.now(),
        content: newComment,
        isInternal: false,
        isEdited: false,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTicket(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment],
        updatedAt: new Date(),
        
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

      // Make API call to update ticket status
      const res = await ApiService.put(`/tickets/${ticket.id}/status`, { 
        status: newStatus,
        note: statusUpdateNote.trim() || undefined
      });

      if (!res?.success) {
        throw new Error(res?.message || 'Falha ao atualizar status');
      }

      const historyEntry: TicketHistory = {
        id: Date.now(),
        action: 'status_changed',
        description: `Status alterado de ${statusLabels[ticket.status]} para ${statusLabels[newStatus]}`,
        createdAt: new Date(),
        oldValue: ticket.status,
        newValue: newStatus,
        userId: 1,
      };

      setTicket(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date(),
        history: [...prev.history, historyEntry],
      } : null);

      // Add comment if note provided
      if (statusUpdateNote.trim()) {
        const comment: TicketComment = {
          id: Date.now() + 1,
          content: statusUpdateNote,
          isInternal: false,
          isEdited: false,
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setTicket(prev => prev ? {
          ...prev,
          comments: [...prev.comments, comment],
        } : null);
      }

      setStatusUpdateNote('');
      setShowStatusModal(false);
      const msg = res?.message || `Status alterado para ${statusLabels[newStatus]}`;
      setSuccessMessage(msg);
      setToastMsg(msg);
      setToastVariant('success');
      setToastOpen(true);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating status:', err);
      const api = err?.response?.data;
      const finalMsg = (api && typeof api === 'object' && api.message) ? api.message : 'Erro ao atualizar status do ticket';
      setError(finalMsg);
      setToastMsg(finalMsg);
      setToastVariant('error');
      setToastOpen(true);
    } finally {
      setStatusLoading(false);
    }
  };

  const addAttachments = (files: FileList) => {
    if (!ticket) return;
    const newAttachments = Array.from(files).map((file, idx) => ({
      id: Date.now() + idx,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      url: URL.createObjectURL(file),
      size: file.size,
      uploadedBy: 1,
      uploadedAt: new Date(),
      isPublic: true,
    }));
    setTicket(prev => prev ? { ...prev, attachments: [...prev.attachments, ...newAttachments] } : null);
    setSuccessMessage(`${newAttachments.length} anexo(s) adicionados`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addAttachments(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addAttachments(e.target.files);
      e.target.value = '';
    }
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (!tag || !ticket) return;
    if (ticket.tags.includes(tag)) {
      setNewTag('');
      return;
    }
    setTicket(prev => prev ? { ...prev, tags: [...prev.tags, tag] } : null);
    setNewTag('');
    setSuccessMessage(`Tag "${tag}" adicionada`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const removeTag = (tag: string) => {
    if (!ticket) return;
    setTicket(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null);
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
      <TicketDetailsWrapper>
        <Spinner size="lg" centered label="Carregando ticket..." />
      </TicketDetailsWrapper>
    );
  }

  if (error || !ticket) {
    return (
      <TicketDetailsWrapper>
        <Alert variant="danger" title="Erro">
          {error || 'Ticket não encontrado'}
        </Alert>
        <Button onClick={() => navigate('/tickets')}>
          Voltar para Lista
        </Button>
      </TicketDetailsWrapper>
    );
  }

  return (
    <TicketDetailsWrapper>
      {successMessage && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert variant="success" title="Sucesso">
            {successMessage}
          </Alert>
        </div>
      )}
      <Header>
        <Breadcrumb>
          <Button
            variant="ghost"
            onClick={() => navigate('/tickets')}
            leftIcon="←"
          >
            Voltar
          </Button>
        </Breadcrumb>
        
        <TitleSection>
          <TitleRow>
            <h1>{ticket.title}</h1>
            <BadgesRow>
              <Badge variant={getStatusVariant(ticket.status)}>
                {statusLabels[ticket.status]}
              </Badge>
              <Badge variant={getPriorityVariant(ticket.priority)}>
                {priorityLabels[ticket.priority]}
              </Badge>
            </BadgesRow>
          </TitleRow>
          <TicketNumber>{ticket.number}</TicketNumber>
        </TitleSection>
        
        <Actions>
          <Button
            variant="primary"
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
            variant="primary"
            onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
          >
            Editar
          </Button>
        </Actions>
      </Header>

      <Tabs  activeTab={activeTab} onTabChange={setActiveTab} >
        <TabList>
          <Tab value="details">Detalhes</Tab>
          <Tab value="comments">Comentários ({ticket.comments.length})</Tab>
          <Tab value="attachments">Anexos ({ticket.attachments.length})</Tab>
          <Tab value="history">Histórico ({ticket.history.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="details">
            <Content>
              <div>
                <Card>
                  <CardHeader>
                    <h3>Descrição</h3>
                  </CardHeader>
                  <CardBody>
                    <p>{ticket.description}</p>
                  </CardBody>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <h3>Informações do Cliente</h3>
                  </CardHeader>
                  <CardBody>
                    <div>
                      <InfoItemRow>
                        <label>Nome:</label>
                        <span>{ticket.customerInfo.name || '—'}</span>
                      </InfoItemRow>
                      <InfoItemRow>
                        <label>Email:</label>
                        <span>{ticket.customerInfo.email || '—'}</span>
                      </InfoItemRow>
                      <InfoItemRow>
                        <label>Telefone:</label>
                        <span>{ticket.customerInfo.phone || '—'}</span>
                      </InfoItemRow>
                      {ticket.customerInfo.company && (
                        <InfoItemRow>
                          <label>Empresa:</label>
                          <span>{ticket.customerInfo.company}</span>
                        </InfoItemRow>
                      )}
                      {ticket.customerInfo.department && (
                        <InfoItemRow>
                          <label>Departamento:</label>
                          <span>{ticket.customerInfo.department}</span>
                        </InfoItemRow>
                      )}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3>Detalhes do Ticket</h3>
                  </CardHeader>
                  <CardBody>
                    <div>
                      <InfoItemRow>
                        <label>Categoria:</label>
                        <span>{ticket.category}</span>
                      </InfoItemRow>
                      <InfoItemRow>
                        <label>Origem:</label>
                        <span>{ticket.source}</span>
                      </InfoItemRow>
                      <InfoItemRow>
                        <label>Responsável:</label>
                        <span>{ticket.assignee?.name || 'Não atribuído'}</span>
                      </InfoItemRow>
                      <InfoItemRow>
                        <label>Criado em:</label>
                        <span>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</span>
                      </InfoItemRow>
                      <InfoItemRow>
                        <label>Atualizado em:</label>
                        <span>{new Date(ticket.updatedAt).toLocaleString('pt-BR')}</span>
                      </InfoItemRow>
                      <InfoItemRow>
                        <label>Tags:</label>
                        <TagsRow>
                          {ticket.tags.length === 0 && (
                            <span style={{ color: 'var(--color-text-secondary)' }}>Sem tags</span>
                          )}
                          {ticket.tags.map((tag) => (
                            <TagChip key={tag}>
                              <Badge variant="secondary">{tag}</Badge>
                              <Button size="lg" variant="secondary" onClick={() => removeTag(tag)}>×</Button>
                            </TagChip>
                          ))}
                        </TagsRow>
                      </InfoItemRow>
                      <InfoItemRow>
                        <label>Adicionar Tag:</label>
                        <InputRow>
                          <StyledInput
                            placeholder="Nova tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                          />
                          <Button size="sm" variant="secondary" onClick={addTag}>Adicionar</Button>
                        </InputRow>
                      </InfoItemRow>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Content>
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
                            <strong>{comment.user?.name || `Usuário #${comment.userId ?? '-'}`}</strong>
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
                  <div
                    className="ticket-details__dropzone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{
                      padding: '1rem',
                      border: '2px dashed var(--color-border)',
                      borderRadius: '12px',
                      background: 'var(--color-surface)',
                      textAlign: 'center'
                    }}
                  >
                    <p style={{ marginBottom: '0.5rem' }}>Arraste e solte arquivos aqui</p>
                    <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>Selecionar Arquivos</Button>
                    <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileInputChange} />
                  </div>
                  {ticket.attachments.length === 0 ? (
                    <div className="ticket-details__empty">
                      <p>Nenhum anexo ainda.</p>
                    </div>
                  ) : (
                    ticket.attachments.map((attachment) => (
                      <div key={attachment.id} className="ticket-details__attachment">
                        <div className="ticket-details__attachment-info">
                          <div className="ticket-details__attachment-name">
                            📎 {attachment.originalName}
                          </div>
                          <div className="ticket-details__attachment-meta">
                            {formatFileSize(attachment.size)} • 
                            Enviado em {' '}
                            {new Date(attachment.uploadedAt).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <Button
                          variant="primary"
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
                          Por {entry.user?.name || `Usuário #${entry.userId ?? '-'}`} em {' '}
                          {new Date(entry.createdAt).toLocaleString('pt-BR')}
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

      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        title={toastVariant === 'success' ? 'Sucesso' : 'Erro'}
        description={toastMsg}
        variant={toastVariant}
      />

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
            variant="primary"
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
            variant="primary"
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
    </TicketDetailsWrapper>
  );
}