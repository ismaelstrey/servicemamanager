import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Heading, Badge, Button, Alert, LogoLoader, Modal, ModalBody, ModalFooter, SearchBox, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Pagination } from '../../components/ui';
import { ApiService } from '../../services/api';
import { useCustomers } from '../../hooks/useCustomers';
import type { Ticket } from '../../types/ticket';
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

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await ApiService.get<Ticket>(`/tickets/${id}`);
        setTicket(res.data as any);
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Falha ao carregar ticket';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [id]);

  const loadCustomers = async () => {
    try {
      const res = await searchCustomers(search, page, limit);
      setCustomers(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError('Falha ao carregar clientes');
    }
  };

  useEffect(() => {
    if (modalOpen) {
      loadCustomers();
    }
  }, [modalOpen, page]);

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
          <span>{ticket.title}</span>
        </FieldRow>
        <FieldRow>
          <label>Status</label>
          <Badge variant="secondary">{ticket.status}</Badge>
        </FieldRow>
        <FieldRow>
          <label>Prioridade</label>
          <Badge variant={ticket.priority === 'low' ? 'success' : ticket.priority === 'medium' ? 'info' : ticket.priority === 'high' ? 'warning' : 'danger'}>
            {ticket.priority}
          </Badge>
        </FieldRow>
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
              onChange={(e: any) => setSearch(e.target.value)}
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
                    <TableCell>{(c as any).document || '—'}</TableCell>
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
                  await ApiService.patch(`/tickets/${id}`, { customerId: selectedCustomerId });
                  const chosen = customers.find((c) => c.id === selectedCustomerId);
                  setTicket((prev) => prev ? { ...prev, customerId: selectedCustomerId, customerInfo: { name: chosen?.name || prev.customerInfo.name, email: chosen?.email || prev.customerInfo.email } } : prev);
                  setModalOpen(false);
                } catch (err: any) {
                  const msg = err?.response?.data?.message || err?.message || 'Falha ao vincular cliente';
                  setError(msg);
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