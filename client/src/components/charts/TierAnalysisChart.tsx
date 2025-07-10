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
        label: 'Mega Cap ($100B+)',
        data: [100, 102.1, 101.8, 103.2, 102.9, 103.5, 102.1],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: 'Large Cap ($10B-$100B)',
        data: [100, 101.2, 100.5, 99.8, 99.2, 100.1, 99.2],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: 'Large Medium ($5B-$10B)',
        data: [100, 100.8, 101.4, 102.1, 101.6, 102.3, 101.4],
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: 'Small Medium ($1B-$5B)',
        data: [100, 99.5, 98.2, 96.8, 98.1, 99.4, 97.9],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: 'Small Cap ($100M-$1B)',
        data: [100, 103.2, 105.1, 104.8, 106.2, 107.1, 105.8],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: 'Micro/Shit Coins ($10M-$100M)',
        data: [100, 108.5, 95.2, 112.3, 89.7, 115.4, 92.8],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        borderWidth: 3,
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
