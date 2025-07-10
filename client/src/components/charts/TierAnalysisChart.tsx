import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface TierAnalysisChartProps {
  data: any[];
}

export default function TierAnalysisChart({ data }: TierAnalysisChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Mock time series data for demonstration
    const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    
    const datasets = [
      {
        label: 'Mega Cap',
        data: [100, 102.1, 101.8, 103.2, 102.9, 103.5, 102.1],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Large Cap',
        data: [100, 101.2, 100.5, 99.8, 99.2, 100.1, 99.2],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Medium Cap',
        data: [100, 100.8, 101.4, 102.1, 101.6, 102.3, 101.4],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ];

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#A0A9C0'
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: '#A0A9C0'
            },
            grid: {
              color: '#374151'
            }
          },
          x: {
            ticks: {
              color: '#A0A9C0'
            },
            grid: {
              color: '#374151'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="relative h-64">
      <canvas ref={chartRef} />
    </div>
  );
}
