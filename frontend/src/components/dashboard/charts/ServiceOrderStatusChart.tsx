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

export interface ServiceOrderStatusChartProps {
  stats: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

const ServiceOrderStatusChart: React.FC<ServiceOrderStatusChartProps> = ({ stats }) => {
  const data = {
    labels: ['Pendentes', 'Em progresso', 'Concluídas', 'Canceladas'],
    datasets: [
      {
        label: 'Ordens de Serviço',
        data: [stats.pending, stats.inProgress, stats.completed, stats.cancelled],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
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
        text: 'Status das Ordens de Serviço',
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

export default ServiceOrderStatusChart;