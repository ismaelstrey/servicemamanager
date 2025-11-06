import React from 'react';
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

export interface TicketsStatusChartProps {
  stats: {
    open: number;
    assigned: number;
    inProgress: number;
    pending: number;
    resolved: number;
    closed: number;
    cancelled: number;
  };
}

const TicketsStatusChart: React.FC<TicketsStatusChartProps> = ({ stats }) => {
  const data = {
    labels: ['Abertos', 'Atribuídos', 'Em progresso', 'Pendentes', 'Resolvidos', 'Fechados', 'Cancelados'],
    datasets: [
      {
        label: 'Tickets',
        data: [
          stats.open,
          stats.assigned,
          stats.inProgress,
          stats.pending,
          stats.resolved,
          stats.closed,
          stats.cancelled,
        ],
        backgroundColor: ['#3b82f6', '#6366f1', '#f59e0b', '#06b6d4', '#10b981', '#6b7280', '#ef4444'],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
        text: 'Status dos Tickets',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default TicketsStatusChart;