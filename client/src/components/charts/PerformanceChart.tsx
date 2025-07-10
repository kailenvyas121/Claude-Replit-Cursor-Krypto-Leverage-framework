import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface PerformanceChartProps {
  data: any[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Calculate average performance by tier
    const tierPerformance = data.reduce((acc, coin) => {
      if (!acc[coin.tier]) {
        acc[coin.tier] = { sum: 0, count: 0 };
      }
      acc[coin.tier].sum += parseFloat(coin.priceChangePercentage24h || '0');
      acc[coin.tier].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const tierLabels = {
      mega: 'Mega',
      large: 'Large',
      largeMedium: 'L-Med',
      smallMedium: 'S-Med',
      small: 'Small',
      micro: 'Micro',
    };

    const labels = Object.keys(tierPerformance).map(tier => 
      tierLabels[tier as keyof typeof tierLabels] || tier
    );
    
    const values = Object.values(tierPerformance).map(tier => tier.sum / tier.count);

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '24h Performance (%)',
          data: values,
          backgroundColor: values.map(value => value >= 0 ? '#10B981' : '#EF4444'),
          borderColor: '#1E293B',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
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
