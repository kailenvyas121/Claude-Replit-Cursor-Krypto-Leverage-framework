import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CascadeAnalysisChartProps {
  data: any[];
}

export default function CascadeAnalysisChart({ data }: CascadeAnalysisChartProps) {
  const getTierColor = (tier: string) => {
    const colors = {
      'mega': '#8b5cf6',
      'large': '#3b82f6', 
      'largeMedium': '#06b6d4',
      'smallMedium': '#10b981',
      'small': '#f59e0b',
      'micro': '#ef4444'
    };
    return colors[tier as keyof typeof colors] || '#64748b';
  };

  const processData = () => {
    if (!data || data.length === 0) return null;

    // Group data by tier
    const tierGroups = data.reduce((acc, item) => {
      if (!acc[item.tier]) acc[item.tier] = [];
      acc[item.tier].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate tier averages over time (simulated time series)
    const tierOrder = ['mega', 'large', 'largeMedium', 'smallMedium', 'small', 'micro'];
    const timeLabels = ['T-30min', 'T-25min', 'T-20min', 'T-15min', 'T-10min', 'T-5min', 'Now'];
    
    const datasets = tierOrder.map(tier => {
      const tierData = tierGroups[tier] || [];
      const avgPerformance = tierData.reduce((sum, item) => 
        sum + parseFloat(item.priceChangePercentage24h || '0'), 0) / (tierData.length || 1);
      
      // Simulate cascade effect - larger tiers lead smaller tiers
      const baseData = Array(7).fill(0).map((_, i) => {
        const leadIndex = tierOrder.indexOf(tier);
        const delayFactor = leadIndex * 0.8; // Delay multiplier
        const timeDecay = Math.max(0, 1 - (i - delayFactor) * 0.15);
        return avgPerformance * timeDecay * (0.3 + Math.random() * 0.7);
      });

      return {
        label: tier.charAt(0).toUpperCase() + tier.slice(1),
        data: baseData,
        borderColor: getTierColor(tier),
        backgroundColor: getTierColor(tier) + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: getTierColor(tier),
        pointBorderColor: '#1e293b',
        pointBorderWidth: 2,
      };
    });

    return {
      labels: timeLabels,
      datasets: datasets
    };
  };

  const chartData = processData();
  if (!chartData) return <div className="text-slate-400">No data available</div>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: {
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Market Cascade Analysis - Tier Movement Correlation',
        color: '#f8fafc',
        font: {
          size: 14,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          },
          afterLabel: function(context: any) {
            const tier = context.dataset.label.toLowerCase();
            const delayTime = ['mega', 'large', 'largeMedium', 'smallMedium', 'small', 'micro'].indexOf(tier) * 2;
            return delayTime > 0 ? `Typical delay: ${delayTime}min` : 'Market leader';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)'
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 10
          },
          callback: function(value: any) {
            return value.toFixed(1) + '%';
          }
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}