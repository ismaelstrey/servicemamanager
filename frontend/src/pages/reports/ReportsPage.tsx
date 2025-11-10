import React, { useEffect, useMemo, useState } from 'react';
import { useReports } from '../../hooks/useReports';
import { StatsCard } from '../../components/dashboard';
import { Card, CardHeader, CardBody, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Spinner, Alert, Input, Button } from '../../components/ui';
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
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TicketsInlineBar: React.FC<{ data: any }> = ({ data }) => {
  const options = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const }, title: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };
  return <Bar data={data} options={options} />;
};
import ServiceOrderStatusChart from '../../components/dashboard/charts/ServiceOrderStatusChart';
import { useCustomers } from '../../hooks/useCustomers';
import SearchableSelect from '../../components/SearchableSelect';
import { useAuth } from '../../hooks/useAuth';

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
  const [tickets, setTickets] = useState<Array<{ id: number; status: string; createdAt: string }>>([]);
  const [serviceOrders, setServiceOrders] = useState<Array<{ id: number; status: string; scheduledAt: string }>>([]);
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
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Falha ao carregar relatórios');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [getReportsSummary, getTicketsReport, getServiceOrdersReport, startDate, endDate, status, tag, assigneeId, customerId, priority]);

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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Relatórios</h1>
      <p className="text-sm text-gray-600 mb-4">KPIs, gráficos e exportação de dados.</p>

      {/* Filtros de período */}
      <Card className="mb-4">
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Data inicial</label>
              <Input type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data final</label>
              <Input type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} />
            </div>
            <div>
              <Button variant="primary" onClick={() => { /* os effects já disparam o carregamento */ }}>Aplicar</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Todos</option>
                <option value="open">Aberto</option>
                <option value="assigned">Atribuído</option>
                <option value="in_progress">Em andamento</option>
                <option value="pending">Pendente</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tag</label>
              <Input type="text" value={tag} onChange={(e: any) => setTag(e.target.value)} placeholder="Ex: urgência, cliente VIP" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Técnico (ID)</label>
              <Input type="number" value={assigneeId} onChange={(e: any) => setAssigneeId(e.target.value)} placeholder="Ex: 12" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <SearchableSelect
                placeholder="Digite para buscar clientes"
                value={customerId || undefined}
                onChange={(val) => setCustomerId(val ? String(val) : '')}
                fetchOptions={async (q) => {
                  const res = await searchCustomers(q, 1, 10);
                  return res.items.map((c) => ({ value: c.id, label: `${c.name} · ${c.email ?? ''}`.trim() }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prioridade</label>
              <select className="w-full border rounded px-3 py-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">Todas</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Ações de exportação */}
      <div className="flex gap-3 mb-6">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleExportCsv}>
          Exportar CSV (tickets)
        </button>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={handleExportTicketsPdf}>
          Exportar PDF (tickets)
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={handleExportTicketsXlsx}>
          Exportar XLSX (tickets)
        </button>
        <button className="px-4 py-2 bg-indigo-700 text-white rounded" onClick={handleExportServiceOrdersPdf}>
          Exportar PDF (OS)
        </button>
        <button className="px-4 py-2 bg-purple-700 text-white rounded" onClick={handleExportServiceOrdersXlsx}>
          Exportar XLSX (OS)
        </button>
      </div>

      {/* Estado de carregamento/erro */}
      {loading && (
        <div className="mb-4">
          <Spinner size="md" label="Carregando dados de relatórios..." />
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert variant="danger" title="Erro ao carregar relatórios">{error}</Alert>
        </div>
      )}

      {/* KPIs */}
      {summary && summary.kpis && summary.kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summary.kpis.map((kpi) => (
            <StatsCard key={kpi.label} title={kpi.label} value={kpi.value} />
          ))}
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartContainer title="Status dos Tickets">
          <TicketsStatusChart stats={ticketsStats} />
        </ChartContainer>

        <ChartContainer title="Status de Ordens de Serviço">
          <ServiceOrderStatusChart stats={serviceOrderStats} />
        </ChartContainer>
      </div>

      {/* Gráficos adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartContainer title="Tickets por Prioridade">
          {/* Placeholder de componente; renderização inline por simplicidade */}
          {(() => {
            const counts: Record<string, number> = {};
            for (const t of tickets) {
              const p = (t as any).priority ?? 'não informado';
              counts[p] = (counts[p] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data = {
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
              const tech = (t as any).assigneeId != null ? `#${(t as any).assigneeId}` : 'não informado';
              counts[tech] = (counts[tech] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data = {
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
              const cust = (t as any).customerId != null ? `#${(t as any).customerId}` : 'não informado';
              counts[cust] = (counts[cust] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data = {
              labels,
              datasets: [{ label: 'Tickets', data: values, backgroundColor: '#f59e0b' }],
            };
            return <TicketsInlineBar data={data} />;
          })()}
        </ChartContainer>
      </div>

      {/* Gráficos OS adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartContainer title="OS por Prioridade">
          {(() => {
            const counts: Record<string, number> = {};
            for (const so of serviceOrders) {
              const p = (so as any).priority ?? 'não informado';
              counts[p] = (counts[p] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data = {
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
              const tech = (so as any).assigneeId != null ? `#${(so as any).assigneeId}` : 'não informado';
              counts[tech] = (counts[tech] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data = {
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
              const cust = (so as any).customerId != null ? `#${(so as any).customerId}` : 'não informado';
              counts[cust] = (counts[cust] ?? 0) + 1;
            }
            const labels = Object.keys(counts);
            const values = labels.map((l) => counts[l]);
            const data = {
              labels,
              datasets: [{ label: 'OS', data: values, backgroundColor: '#f97316' }],
            };
            return <TicketsInlineBar data={data} />;
          })()}
        </ChartContainer>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Tickets</h3>
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
            <h3 className="text-lg font-semibold">Ordens de Serviço</h3>
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
      </div>
    </div>
  );
}

export default ReportsPage;