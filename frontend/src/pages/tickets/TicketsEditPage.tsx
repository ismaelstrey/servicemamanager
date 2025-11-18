import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Heading, Button, Alert, LogoLoader, Modal, ModalBody, ModalFooter, SearchBox, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Pagination, Input, TextArea, Select } from '../../components/ui';
import { ApiService } from '../../services/api';
import { useCustomers } from '../../hooks/useCustomers';
import type { TicketStatus } from '../../types/ticket';
import type { Priority } from '../../types/common';
import { useTicket, useUpdateTicket } from '../../hooks/useTicket';
import type { CustomerListItem } from '../../services/customerService';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionsRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const TicketsEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { searchCustomers } = useCustomers();

  interface EditTicket {
    id: number;
    number: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: Priority;
    source: string;
    providerId: number;
    createdAt: string | Date;
    updatedAt: string | Date;
    customerInfo?: { name?: string; email?: string };
    customerId?: number | null;
  }

  const [ticket, setTicket] = useState<EditTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string }>({});

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const ticketQuery = useTicket(id || '')
  const updateMutation = useUpdateTicket()

  useEffect(() => {
    if (!id) return
    setLoading(ticketQuery.isLoading)
    if (ticketQuery.isError) {
      setError('Falha ao carregar ticket')
    } else if (ticketQuery.data) {
      setError(null)
      setTicket(ticketQuery.data)
    }
  }, [id, ticketQuery.isLoading, ticketQuery.isError, ticketQuery.data])

  const loadCustomers = useCallback(async () => {
    try {
      const res = await searchCustomers(search, page, limit);
      setCustomers(res.items);
      setTotal(res.total);
    } catch {
      setError('Falha ao carregar clientes');
    }
  }, [searchCustomers, search, page, limit]);

  useEffect(() => {
    if (modalOpen) {
      loadCustomers();
    }
  }, [modalOpen, loadCustomers]);

  if (loading) {
    return <LogoLoader fullscreen message="Carregando ticket..." />;
  }

  if (error || !ticket) {
    return (
      <PageWrapper>
        <Alert variant="danger" title="Erro">{error || 'Ticket não encontrado'}</Alert>
        <Button onClick={() => navigate('/tickets')}>Voltar</Button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <HeaderRow>
        <Heading level={2}>Editar Ticket</Heading>
        <ActionsRow>
          <Button variant="secondary" onClick={() => navigate(`/tickets/${ticket.id}`)}>Ver detalhes</Button>
          <Button onClick={() => navigate('/tickets')}>Voltar para lista</Button>
        </ActionsRow>
      </HeaderRow>

      <Section>
        <FieldRow>
          <label>Número</label>
          <span>{ticket.number}</span>
        </FieldRow>
        <FieldRow>
          <label>Título</label>
          <Input
            value={ticket.title}
            onChange={(e) => {
              const value = e.target.value
              setTicket({ ...ticket, title: value })
              setFormErrors((prev) => ({ ...prev, title: undefined }))
            }}
            fullWidth
            error={formErrors.title}
            helperText={`${ticket.title.length}/120`}
            maxLength={120}
            required
          />
        </FieldRow>
        <FieldRow>
          <label>Descrição</label>
          <TextArea
            value={ticket.description}
            onChange={(e) => {
              const value = e.target.value
              setTicket({ ...ticket, description: value })
              setFormErrors((prev) => ({ ...prev, description: undefined }))
            }}
            fullWidth
            rows={4}
            resize="vertical"
            error={formErrors.description}
            helperText={`${ticket.description.length}/2000`}
            maxLength={2000}
            required
          />
        </FieldRow>
        <FieldRow>
          <label>Status</label>
          <Select value={ticket.status} onChange={(e) => setTicket({ ...ticket, status: e.target.value as TicketStatus })} fullWidth>
            <option value="open">open</option>
            <option value="assigned">assigned</option>
            <option value="in_progress">in_progress</option>
            <option value="pending">pending</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
            <option value="cancelled">cancelled</option>
          </Select>
        </FieldRow>
        <FieldRow>
          <label>Prioridade</label>
          <Select value={ticket.priority} onChange={(e) => setTicket({ ...ticket, priority: e.target.value as Priority })} fullWidth>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </Select>
        </FieldRow>
        <FieldRow>
          <label>Origem</label>
          <span>{ticket.source}</span>
        </FieldRow>
        <FieldRow>
          <label>Criado em</label>
          <span>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</span>
        </FieldRow>
        <FieldRow>
          <label>Atualizado em</label>
          <span>{new Date(ticket.updatedAt).toLocaleString('pt-BR')}</span>
        </FieldRow>
        {saveError && <Alert variant="danger">{saveError}</Alert>}
        {saveSuccess && <Alert variant="success">{saveSuccess}</Alert>}
        <ActionsRow>
          <Button
            variant="primary"
            disabled={saving}
            loading={saving}
            type="button"
            onClick={async () => {
              if (!ticket) return
              const errors: { title?: string; description?: string } = {}
              const titleTrim = ticket.title.trim()
              const descTrim = ticket.description.trim()
              if (titleTrim.length < 3) errors.title = 'Título deve ter ao menos 3 caracteres'
              if (titleTrim.length > 120) errors.title = 'Título excede 120 caracteres'
              if (descTrim.length < 5) errors.description = 'Descrição deve ter ao menos 5 caracteres'
              if (descTrim.length > 2000) errors.description = 'Descrição excede 2000 caracteres'
              if (errors.title || errors.description) {
                setFormErrors(errors)
                setSaveError('Corrija os campos obrigatórios antes de salvar')
                setSaveSuccess(null)
                return
              }
              try {
                setSaving(true)
                setSaveError(null)
                setSaveSuccess(null)
                const updated = await updateMutation.mutateAsync({ id: ticket.id, payload: { title: ticket.title, description: ticket.description, status: ticket.status, priority: ticket.priority } })
                setTicket(updated)
                setSaveSuccess('Alterações salvas com sucesso')
              } catch {
                setSaveError('Falha ao salvar alterações')
              } finally {
                setSaving(false)
              }
            }}
          >
            Salvar alterações
          </Button>
        </ActionsRow>
      </Section>

      <Section>
        <Heading level={3}>Cliente Vinculado</Heading>
        <FieldRow>
          <label>Nome</label>
          <span>{ticket.customerInfo?.name || '—'}</span>
        </FieldRow>
        <FieldRow>
          <label>Email</label>
          <span>{ticket.customerInfo?.email || '—'}</span>
        </FieldRow>
        <ActionsRow>
          <Button variant="primary" onClick={() => { setSelectedCustomerId(null); setModalOpen(true); }}>Alterar cliente</Button>
        </ActionsRow>
      </Section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Selecionar Cliente">
        <ModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SearchBox
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              onSearch={() => { setPage(1); loadCustomers(); }}
              onClear={() => { setSearch(''); setPage(1); loadCustomers(); }}
              placeholder="Buscar por nome, email ou documento"
            />
            {error && <Alert variant="danger">{error}</Alert>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Nome</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Documento</TableHeaderCell>
                  <TableHeaderCell>Ação</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(customers || []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email || '—'}</TableCell>
                    <TableCell>{c.document || '—'}</TableCell>
                    <TableCell>
                      <Button variant={selectedCustomerId === c.id ? 'accent' : 'secondary'} size="sm" onClick={() => setSelectedCustomerId(c.id)}>
                        {selectedCustomerId === c.id ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(customers?.length || 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>Sem resultados</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p: number) => setPage(p)} />
          </div>
        </ModalBody>
        <ModalFooter>
          <ActionsRow>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              disabled={!selectedCustomerId}
              onClick={async () => {
                if (!selectedCustomerId || !id) return;
                try {
                  setError(null);
                  await ApiService.patch(`/providers/tickets/${id}`, { customerId: selectedCustomerId });
                  const chosen = customers.find((c) => c.id === selectedCustomerId);
                  setTicket((prev) => prev ? { ...prev, customerId: selectedCustomerId, customerInfo: { name: chosen?.name || prev.customerInfo?.name || '', email: chosen?.email || prev.customerInfo?.email || '' } } : prev);
                  setModalOpen(false);
                } catch {
                  setError('Falha ao vincular cliente');
                }
              }}
            >
              Vincular
            </Button>
          </ActionsRow>
        </ModalFooter>
      </Modal>
    </PageWrapper>
  );
};

export default TicketsEditPage;