import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LeverageOpportunityChartProps {
  data: any[];
  type: 'risk-reward' | 'volume-divergence' | 'momentum-shift' | 'correlation-breakdown';
}

export default function LeverageOpportunityChart({ data, type }: LeverageOpportunityChartProps) {
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

    switch (type) {
      case 'risk-reward':
        return {
          labels: data.map(item => item.symbol),
          datasets: [
            {
              label: 'Expected Return (%)',
              data: data.map(item => parseFloat(item.priceChangePercentage24h || '0')),
              backgroundColor: data.map(item => getTierColor(item.tier) + '80'),
              borderColor: data.map(item => getTierColor(item.tier)),
              borderWidth: 2,
              yAxisID: 'y',
            },
            {
              label: 'Risk Score',
              data: data.map(item => {
                const volatility = Math.abs(parseFloat(item.priceChangePercentage24h || '0'));
                const volume = parseFloat(item.volume24h || '0');
                const marketCap = parseFloat(item.marketCap || '0');
                return Math.min(100, (volatility * 2) + (volume < marketCap * 0.1 ? 30 : 0));
              }),
              backgroundColor: 'rgba(239, 68, 68, 0.3)',
              borderColor: 'rgba(239, 68, 68, 0.8)',
              borderWidth: 1,
              type: 'line' as const,
              yAxisID: 'y1',
            }
          ]
        };

      case 'volume-divergence':
        return {
          labels: data.map(item => item.symbol),
          datasets: [
            {
              label: 'Volume/Market Cap Ratio',
              data: data.map(item => {
                const volume = parseFloat(item.volume24h || '0');
                const marketCap = parseFloat(item.marketCap || '0');
                return marketCap > 0 ? (volume / marketCap) * 100 : 0;
              }),
              backgroundColor: data.map(item => getTierColor(item.tier) + '60'),
              borderColor: data.map(item => getTierColor(item.tier)),
              borderWidth: 2,
            }
          ]
        };

      case 'momentum-shift':
        return {
          labels: data.map(item => item.symbol),
          datasets: [
            {
              label: 'Price Change (%)',
              data: data.map(item => parseFloat(item.priceChangePercentage24h || '0')),
              backgroundColor: data.map(item => 
                parseFloat(item.priceChangePercentage24h || '0') > 0 ? 
                'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'
              ),
              borderColor: data.map(item => 
                parseFloat(item.priceChangePercentage24h || '0') > 0 ? 
                'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
              ),
              borderWidth: 2,
            }
          ]
        };

      case 'correlation-breakdown':
        // Group by tier and calculate tier averages
        const tierGroups = data.reduce((acc, item) => {
          if (!acc[item.tier]) acc[item.tier] = [];
          acc[item.tier].push(parseFloat(item.priceChangePercentage24h || '0'));
          return acc;
        }, {} as Record<string, number[]>);

        const tierAverages = Object.entries(tierGroups).map(([tier, values]) => ({
          tier,
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          color: getTierColor(tier)
        }));

        return {
          labels: tierAverages.map(item => item.tier.charAt(0).toUpperCase() + item.tier.slice(1)),
          datasets: [
            {
              label: 'Tier Average Performance (%)',
              data: tierAverages.map(item => item.average),
              backgroundColor: tierAverages.map(item => item.color + '80'),
              borderColor: tierAverages.map(item => item.color),
              borderWidth: 2,
            }
          ]
        };

      default:
        return null;
    }
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
          }
        }
      },
      title: {
        display: true,
        text: type === 'risk-reward' ? 'Risk vs Reward Analysis' :
              type === 'volume-divergence' ? 'Volume Divergence Scanner' :
              type === 'momentum-shift' ? 'Momentum Shift Detection' :
              'Tier Correlation Breakdown',
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
            if (type === 'risk-reward') {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}${context.datasetIndex === 0 ? '%' : ''}`;
            } else if (type === 'volume-divergence') {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(3)}%`;
            } else {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
            }
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
          }
        }
      },
      ...(type === 'risk-reward' && {
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 10
            }
          }
        }
      })
    }
  };

  return (
    <div className="h-80">
      {type === 'risk-reward' ? (
        <Bar data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}