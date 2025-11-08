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
  ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PriorityCount {
  priority: string;
  _count: number;
}

interface Props {
  data: PriorityCount[];
}

const priorityColors: Record<string, string> = {
  LOW: '#3b82f6',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  URGENT: '#dc2626',
};

const PriorityBreakdownChart: React.FC<Props> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.priority),
    datasets: [
      {
        label: 'Leads by Priority',
        data: data.map((item) => item._count),
        backgroundColor: data.map((item) => priorityColors[item.priority] || '#6b7280'),
        borderColor: data.map((item) => priorityColors[item.priority] || '#6b7280'),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value} leads`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PriorityBreakdownChart;
