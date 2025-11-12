import React, { useEffect, useMemo, useState } from 'react';
import { useReports } from '../../hooks/useReports';
import { StatsCard } from '../../components/dashboard';
import { Card, CardHeader, CardBody, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Alert, Button, LogoLoader } from '../../components/ui';
import ChartContainer from '../../components/ui/ChartContainer';
import TicketsStatusChart from '../../components/reports/TicketsStatusChart';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TicketsInlineBar: React.FC<{ data: ChartData<'bar'> }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const }, title: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };
  return <Bar data={data} options={options} />;
};
import ServiceOrderStatusChart from '../../components/dashboard/charts/ServiceOrderStatusChart';
import { useCustomers } from '../../hooks/useCustomers';
import ReportsFilters from '../../components/reports/ReportsFilters';
import { useAuth } from '../../hooks/useAuth';
import styled from 'styled-components';

// Página de Relatórios (/reports)
// Exibe KPIs, gráficos e opções de exportação.
// Comentários em pt-BR explicam o propósito e o fluxo.
export function ReportsPage(): React.ReactElement {
  const { getReportsSummary, getTicketsReport, getServiceOrdersReport, exportReport } = useReports();
  const { searchCustomers } = useCustomers();
  const { user } = useAuth();
  const providerId = user?.providerId;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ kpis: Array<{ label: string; value: number }> } | null>(null);
  type TicketItem = {
    id: number;
    status: string;
    createdAt: string;
    priority?: string | null;
    assigneeId?: number | null;
    customerId?: number | null;
  };
  type ServiceOrderItem = {
    id: number;
    status: string;
    scheduledAt: string;
    priority?: string | null;
    assigneeId?: number | null;
    customerId?: number | null;
  };
  const [tickets, setTickets] = useState<Array<TicketItem>>([]);
  const [serviceOrders, setServiceOrders] = useState<Array<ServiceOrderItem>>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [priority, setPriority] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Comentário: Monta filtros e inclui providerId do contexto do usuário quando disponível
        const filter = {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: status || undefined,
          tag: tag || undefined,
          assigneeId: assigneeId ? Number(assigneeId) : undefined,
          customerId: customerId ? Number(customerId) : undefined,
          priority: priority || undefined,
          // providerId é aceito via query pelo backend como fallback ao token
          providerId: providerId || undefined,
        };
        const [s, t, so] = await Promise.all([
          getReportsSummary(filter),
          getTicketsReport(filter),
          getServiceOrdersReport(filter),
        ]);
        if (!cancelled) {
          setSummary(s);
          setTickets(t);
          setServiceOrders(so);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar relatórios');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [getReportsSummary, getTicketsReport, getServiceOrdersReport, startDate, endDate, status, tag, assigneeId, customerId, priority, providerId]);

  // Nota: manter simples para scaffolding; implementar carregamento real depois.
  const handleExportCsv = async () => {
    try {
      await exportReport('tickets', 'csv', { startDate: startDate || undefined, endDate: endDate || undefined, status: status || undefined, tag: tag || undefined, assigneeId: assigneeId ? Number(assigneeId) : undefined, customerId: customerId ? Number(customerId) : undefined, priority: priority || undefined });
      // Feedback simples; trocar por toast global depois
      console.log('Exportação solicitada');
    } catch (err) {
      console.error('Falha na exportação', err);
    }
  };

  const handleExportTicketsPdf = async () => {
    try {
      await exportReport('tickets', 'pdf', { startDate: startDate || undefined, endDate: endDate || undefined, status: status || undefined, tag: tag || undefined, assigneeId: assigneeId ? Number(assigneeId) : undefined, customerId: customerId ? Number(customerId) : undefined, priority: priority || undefined });
      console.log('Exportação PDF (tickets) solicitada');
    } catch (err) {
      console.error('Falha na exportação PDF (tickets)', err);
    }
  };

  const handleExportTicketsXlsx = async () => {
    try {
      await exportReport('tickets', 'xlsx', { startDate: startDate || undefined, endDate: endDate || undefined, status: status || undefined, tag: tag || undefined, assigneeId: assigneeId ? Number(assigneeId) : undefined, customerId: customerId ? Number(customerId) : undefined, priority: priority || undefined });
      console.log('Exportação XLSX (tickets) solicitada');
    } catch (err) {
      console.error('Falha na exportação XLSX (tickets)', err);
    }
  };

  const handleExportServiceOrdersPdf = async () => {
    try {
      await exportReport('serviceOrders', 'pdf', { startDate: startDate || undefined, endDate: endDate || undefined, status: status || undefined, tag: tag || undefined, assigneeId: assigneeId ? Number(assigneeId) : undefined, customerId: customerId ? Number(customerId) : undefined, priority: priority || undefined });
      console.log('Exportação PDF (OS) solicitada');
    } catch (err) {
      console.error('Falha na exportação PDF (OS)', err);
    }
  };

  const handleExportServiceOrdersXlsx = async () => {
    try {
      await exportReport('serviceOrders', 'xlsx', { startDate: startDate || undefined, endDate: endDate || undefined, status: status || undefined, tag: tag || undefined, assigneeId: assigneeId ? Number(assigneeId) : undefined, customerId: customerId ? Number(customerId) : undefined, priority: priority || undefined });
      console.log('Exportação XLSX (OS) solicitada');
    } catch (err) {
      console.error('Falha na exportação XLSX (OS)', err);
    }
  };

  const ticketsStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tickets) counts[t.status] = (counts[t.status] ?? 0) + 1;
    return {
      open: counts['open'] ?? 0,
      assigned: counts['assigned'] ?? 0,
      inProgress: counts['in_progress'] ?? 0,
      pending: counts['pending'] ?? 0,
      resolved: counts['resolved'] ?? 0,
      closed: counts['closed'] ?? 0,
      cancelled: counts['cancelled'] ?? 0,
    };
  }, [tickets]);

  const serviceOrderStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const so of serviceOrders) counts[so.status] = (counts[so.status] ?? 0) + 1;
    return {
      pending: counts['pending'] ?? 0,
      inProgress: counts['in_progress'] ?? 0,
      completed: counts['completed'] ?? 0,
      cancelled: counts['cancelled'] ?? 0,
    };
  }, [serviceOrders]);

  return (
    <PageContainer>
      <PageTitle>Relatórios</PageTitle>
      <Subtitle>KPIs, gráficos e exportação de dados.</Subtitle>

      {/* Ações de exportação */}
      <Block>
        <Card padding='small' variant='outlined'>
          <CardBody>
            <ActionsRow>
              <Button variant="secondary" onClick={handleExportCsv}>Exportar CSV (tickets)</Button>
              <Button variant="secondary" onClick={handleExportTicketsPdf}>Exportar PDF (tickets)</Button>
              <Button variant="secondary" onClick={handleExportTicketsXlsx}>Exportar XLSX (tickets)</Button>
              <Button variant="secondary" onClick={handleExportServiceOrdersPdf}>Exportar PDF (OS)</Button>
              <Button variant="secondary" onClick={handleExportServiceOrdersXlsx}>Exportar XLSX (OS)</Button>
            </ActionsRow>
          </CardBody>
        </Card>
      </Block>

      {/* Filtros de período */}
      <Block>
        <Card padding='small' >
          <CardBody>
            <ReportsFilters
              startDate={startDate}
              endDate={endDate}
              status={status}
              tag={tag}
              assigneeId={assigneeId}
              customerId={customerId}
              priority={priority}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setStatus={setStatus}
              setTag={setTag}
              setAssigneeId={setAssigneeId}
              setCustomerId={setCustomerId}
              setPriority={setPriority}
              searchCustomers={searchCustomers}
              onApply={() => {/* efeito já cuida do load ao mudar filtros */ }}
              onClear={() => {
                setStartDate('');
                setEndDate('');
                setStatus('');
                setTag('');
                setAssigneeId('');
                setCustomerId('');
                setPriority('');
              }}
            />
          </CardBody>
        </Card>
      </Block>



      {/* Estado de carregamento/erro */}
      {loading && (

        <LogoLoader message="Carregando dados de relatórios..." />

      )}
      {error && (
        <Block>
          <Alert variant="danger" title="Erro ao carregar relatórios">{error}</Alert>
        </Block>
      )}

      {/* KPIs */}
      {summary && summary.kpis && summary.kpis.length > 0 && (
        <KpisGrid>
          {summary.kpis.map((kpi) => (
            <StatsCard key={kpi.label} title={kpi.label} value={kpi.value} />
          ))}
        </KpisGrid>
      )}

      {/* Gráficos */}
      <ChartsGrid2>
        <ChartContainer title="Status dos Tickets">
          <TicketsStatusChart stats={ticketsStats} />
        </ChartContainer>

        <ChartContainer title="Status de Ordens de Serviço">
          <ServiceOrderStatusChart stats={serviceOrderStats} />
        </ChartContainer>
      </ChartsGrid2>

      {/* Gráficos adicionais */}
      <ChartsGrid3>
        <ChartContainer title="Tickets por Prioridade">
          {/* Placeholder de componente; renderização inline por simplicidade */}
          {(() => {
            const counts: Record<string, number> = {};
            for (const t of tickets) {
              const p = t.priority ?? 'não informado';
              counts[p] = (counts[p] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data: ChartData<'bar'> = {
              labels,
              datasets: [{ label: 'Tickets', data: values, backgroundColor: '#3b82f6' }],
            };
            return <TicketsInlineBar data={data} />;
          })()}
        </ChartContainer>

        <ChartContainer title="Tickets por Técnico">
          {(() => {
            const counts: Record<string, number> = {};
            for (const t of tickets) {
              const tech = t.assigneeId != null ? `#${t.assigneeId}` : 'não informado';
              counts[tech] = (counts[tech] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data: ChartData<'bar'> = {
              labels,
              datasets: [{ label: 'Tickets', data: values, backgroundColor: '#10b981' }],
            };
            return <TicketsInlineBar data={data} />;
          })()}
        </ChartContainer>

        <ChartContainer title="Tickets por Cliente">
          {(() => {
            const counts: Record<string, number> = {};
            for (const t of tickets) {
              const cust = t.customerId != null ? `#${t.customerId}` : 'não informado';
              counts[cust] = (counts[cust] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data: ChartData<'bar'> = {
              labels,
              datasets: [{ label: 'Tickets', data: values, backgroundColor: '#f59e0b' }],
            };
            return <TicketsInlineBar data={data} />;
          })()}
        </ChartContainer>
      </ChartsGrid3>

      {/* Gráficos OS adicionais */}
      <ChartsGrid3>
        <ChartContainer title="OS por Prioridade">
          {(() => {
            const counts: Record<string, number> = {};
            for (const so of serviceOrders) {
              const p = so.priority ?? 'não informado';
              counts[p] = (counts[p] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data: ChartData<'bar'> = {
              labels,
              datasets: [{ label: 'OS', data: values, backgroundColor: '#6366f1' }],
            };
            return <TicketsInlineBar data={data} />;
          })()}
        </ChartContainer>

        <ChartContainer title="OS por Técnico">
          {(() => {
            const counts: Record<string, number> = {};
            for (const so of serviceOrders) {
              const tech = so.assigneeId != null ? `#${so.assigneeId}` : 'não informado';
              counts[tech] = (counts[tech] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data: ChartData<'bar'> = {
              labels,
              datasets: [{ label: 'OS', data: values, backgroundColor: '#22c55e' }],
            };
            return <TicketsInlineBar data={data} />;
          })()}
        </ChartContainer>

        <ChartContainer title="OS por Cliente">
          {(() => {
            const counts: Record<string, number> = {};
            for (const so of serviceOrders) {
              const cust = so.customerId != null ? `#${so.customerId}` : 'não informado';
              counts[cust] = (counts[cust] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data: ChartData<'bar'> = {
              labels,
              datasets: [{ label: 'OS', data: values, backgroundColor: '#f97316' }],
            };
            return <TicketsInlineBar data={data} />;
          })()}
        </ChartContainer>
      </ChartsGrid3>

      {/* Tabelas */}
      <TablesGrid>
        <Card>
          <CardHeader>
            <SectionTitle>Tickets</SectionTitle>
          </CardHeader>
          <CardBody>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Criado em</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.slice(0, 10).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.status}</TableCell>
                    <TableCell>{new Date(t.createdAt).toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle>Ordens de Serviço</SectionTitle>
          </CardHeader>
          <CardBody>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Agendada em</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceOrders.slice(0, 10).map((so) => (
                  <TableRow key={so.id}>
                    <TableCell>{so.id}</TableCell>
                    <TableCell>{so.status}</TableCell>
                    <TableCell>{new Date(so.scheduledAt).toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </TablesGrid>
    </PageContainer>
  );
}

export default ReportsPage;

// Styled components reutilizáveis para layout
const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors?.text?.primary || '#111'};
  margin: 0 0 ${({ theme }) => theme.spacing?.md || '1rem'} 0;
  font-size: ${({ theme }) => theme.typography?.fontSize?.xl || '1.5rem'};
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 0 0 ${({ theme }) => theme.spacing?.md || '1rem'} 0;
  font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
`;

// (wrappers de filtros foram movidos para ReportsFilters)

const ActionsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin: 0 0 ${({ theme }) => theme.spacing?.lg || '1.5rem'} 0;
  flex-wrap: wrap;
`;

const Block = styled.div`
  margin: 0 0 ${({ theme }) => theme.spacing?.md || '1rem'} 0;
`;

const KpisGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin: 0 0 ${({ theme }) => theme.spacing?.lg || '1.5rem'} 0;

  @media (min-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) and (min-width: ${({ theme }) => theme.breakpoints?.sm || '640px'}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartsGrid2 = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin: 0 0 ${({ theme }) => theme.spacing?.lg || '1.5rem'} 0;

  @media (min-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ChartsGrid3 = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin: 0 0 ${({ theme }) => theme.spacing?.lg || '1.5rem'} 0;

  @media (min-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const TablesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};

  @media (min-width: ${({ theme }) => theme.breakpoints?.lg || '1024px'}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography?.fontSize?.lg || '1.125rem'};
  font-weight: 600;
  margin: 0;
`;
