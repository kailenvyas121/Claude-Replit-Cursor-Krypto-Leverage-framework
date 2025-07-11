import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface CorrelationChartProps {
  data: any[];
}

export default function CorrelationChart({ data }: CorrelationChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Mock correlation data for demonstration
    const mockData = [
      { tier1: 'Mega', tier2: 'Large', correlation: 0.94 },
      { tier1: 'Large', tier2: 'L-Med', correlation: 0.87 },
      { tier1: 'L-Med', tier2: 'S-Med', correlation: 0.72 },
      { tier1: 'S-Med', tier2: 'Small', correlation: 0.58 },
      { tier1: 'Small', tier2: 'Micro', correlation: 0.23 },
    ];

    const labels = mockData.map(item => `${item.tier1}-${item.tier2}`);
    const values = mockData.map(item => item.correlation);

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Correlation Strength',
          data: values,
          borderColor: '#06B6D4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.4,
        }]
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
            beginAtZero: true,
            max: 1,
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
