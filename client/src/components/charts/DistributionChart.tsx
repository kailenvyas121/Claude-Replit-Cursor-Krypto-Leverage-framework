import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DistributionChartProps {
  data: any[];
}

export default function DistributionChart({ data }: DistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Group data by tier
    const tierCounts = data.reduce((acc, coin) => {
      acc[coin.tier] = (acc[coin.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tierLabels = {
      mega: 'Mega Cap',
      large: 'Large Cap',
      largeMedium: 'Large Medium',
      smallMedium: 'Small Medium',
      small: 'Small Cap',
      micro: 'Micro Cap',
    };

    const labels = Object.keys(tierCounts).map(tier => 
      tierLabels[tier as keyof typeof tierLabels] || tier
    );
    
    const values = Object.values(tierCounts);
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: 'rgba(30, 41, 59, 0.8)',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#A0A9C0',
              font: {
                size: 12
              }
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
