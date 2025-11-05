import React from 'react';
import { useReports } from '../../hooks/useReports';

// Página de Relatórios (/reports)
// Exibe KPIs, gráficos e opções de exportação.
// Comentários em pt-BR explicam o propósito e o fluxo.
export function ReportsPage(): React.ReactElement {
  const { getReportsSummary, exportReport } = useReports();

  // Nota: manter simples para scaffolding; implementar carregamento real depois.
  const handleExportCsv = async () => {
    try {
      await exportReport('tickets', 'csv', {});
      // Feedback simples; trocar por toast global depois
      console.log('Exportação solicitada');
    } catch (err) {
      console.error('Falha na exportação', err);
    }
  };

  const handleLoadSummary = async () => {
    try {
      const summary = await getReportsSummary({});
      console.log('Resumo carregado', summary);
    } catch (err) {
      console.error('Falha ao carregar resumo', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Relatórios</h1>
      <p className="text-sm text-gray-600 mb-4">KPIs, gráficos e exportação de dados.</p>
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleLoadSummary}>
          Carregar resumo
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleExportCsv}>
          Exportar CSV (tickets)
        </button>
      </div>
    </div>
  );
}

export default ReportsPage;