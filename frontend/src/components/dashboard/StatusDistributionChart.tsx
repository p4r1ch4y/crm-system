import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusCount {
  status: string;
  _count: number;
}

interface Props {
  data: StatusCount[];
}

const statusColors: Record<string, string> = {
  NEW: '#3b82f6',
  CONTACTED: '#8b5cf6',
  QUALIFIED: '#06b6d4',
  PROPOSAL: '#f59e0b',
  NEGOTIATION: '#f97316',
  WON: '#10b981',
  LOST: '#ef4444',
  ARCHIVED: '#6b7280',
};

const StatusDistributionChart: React.FC<Props> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.status),
    datasets: [
      {
        label: 'Leads by Status',
        data: data.map((item) => item._count),
        backgroundColor: data.map((item) => statusColors[item.status] || '#6b7280'),
        borderColor: data.map(() => '#ffffff'),
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default StatusDistributionChart;
