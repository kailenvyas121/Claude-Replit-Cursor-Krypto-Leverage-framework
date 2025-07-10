import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3, Target, X } from "lucide-react";
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

interface TokenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: any;
}

type TimeFrame = 'max' | '5y' | '1y' | '1m' | '1d';

export default function TokenDetailModal({ isOpen, onClose, token }: TokenDetailModalProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('1d');
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const timeframes = [
    { key: '1d' as TimeFrame, label: '1D', description: '24 Hours' },
    { key: '1m' as TimeFrame, label: '1M', description: '1 Month' },
    { key: '1y' as TimeFrame, label: '1Y', description: '1 Year' },
    { key: '5y' as TimeFrame, label: '5Y', description: '5 Years' },
    { key: 'max' as TimeFrame, label: 'MAX', description: 'All Time' },
  ];

  // Generate realistic price data based on timeframe
  const generatePriceData = (timeframe: TimeFrame, currentPrice: number) => {
    const now = new Date();
    let dataPoints: { time: Date; price: number; volume: number }[] = [];
    let basePrice = currentPrice;
    let volatility = 0.02; // 2% base volatility
    
    // Adjust parameters based on timeframe
    const configs = {
      '1d': { points: 288, interval: 5 * 60 * 1000, volatility: 0.015, trend: 0.0001 }, // 5 min intervals
      '1m': { points: 120, interval: 6 * 60 * 60 * 1000, volatility: 0.025, trend: 0.001 }, // 6 hour intervals
      '1y': { points: 365, interval: 24 * 60 * 60 * 1000, volatility: 0.04, trend: 0.002 }, // daily
      '5y': { points: 260, interval: 7 * 24 * 60 * 60 * 1000, volatility: 0.06, trend: 0.005 }, // weekly
      'max': { points: 200, interval: 30 * 24 * 60 * 60 * 1000, volatility: 0.08, trend: 0.01 }, // monthly
    };
    
    const config = configs[timeframe];
    const startTime = new Date(now.getTime() - config.points * config.interval);
    
    // Generate historical trend (generally upward for established tokens)
    const isEstablished = token.tier === 'mega' || token.tier === 'large';
    const trendMultiplier = isEstablished ? 1 : (Math.random() > 0.3 ? 1 : -0.5);
    
    for (let i = 0; i < config.points; i++) {
      const time = new Date(startTime.getTime() + i * config.interval);
      
      // Add trend component
      const trendComponent = config.trend * i * trendMultiplier;
      
      // Add volatility (random walk)
      const volatilityComponent = (Math.random() - 0.5) * 2 * config.volatility;
      
      // Add some market correlation (simulate broader market movements)
      const marketCycle = Math.sin((i / config.points) * 4 * Math.PI) * 0.01;
      
      // Calculate price
      const priceChange = trendComponent + volatilityComponent + marketCycle;
      basePrice = Math.max(basePrice * (1 + priceChange), 0.0001);
      
      // Generate volume (higher during price movements)
      const baseVolume = parseFloat(token.volume24h || '1000000');
      const volumeMultiplier = 1 + Math.abs(volatilityComponent) * 5;
      const volume = baseVolume * volumeMultiplier * (0.5 + Math.random());
      
      dataPoints.push({
        time,
        price: basePrice,
        volume
      });
    }
    
    // Ensure the last point matches current price
    if (dataPoints.length > 0) {
      dataPoints[dataPoints.length - 1].price = currentPrice;
    }
    
    return dataPoints;
  };

  useEffect(() => {
    if (!isOpen || !token || !chartRef.current) return;

    setIsLoading(true);

    // Simulate API call delay
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentPrice = parseFloat(token.currentPrice);
      const priceData = generatePriceData(activeTimeframe, currentPrice);
      
      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Calculate price change for color
      const firstPrice = priceData[0]?.price || currentPrice;
      const lastPrice = priceData[priceData.length - 1]?.price || currentPrice;
      const isPositive = lastPrice >= firstPrice;
      const lineColor = isPositive ? '#10B981' : '#EF4444';
      const fillColor = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: priceData.map(point => point.time),
          datasets: [{
            label: `${token.symbol} Price`,
            data: priceData.map(point => point.price),
            borderColor: lineColor,
            backgroundColor: fillColor,
            borderWidth: 2,
            fill: true,
            tension: 0.2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            pointHoverBorderColor: lineColor,
            pointHoverBackgroundColor: '#1E293B',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#1E293B',
              titleColor: '#F1F5F9',
              bodyColor: '#F1F5F9',
              borderColor: '#475569',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                title: (context) => {
                  const date = new Date(context[0].parsed.x);
                  return date.toLocaleString();
                },
                label: (context) => {
                  const price = context.parsed.y;
                  return `Price: $${price.toFixed(price > 1 ? 2 : 6)}`;
                }
              }
            }
          },
          scales: {
            x: {
              type: 'time',
              display: false,
              grid: {
                display: false
              }
            },
            y: {
              display: false,
              grid: {
                display: false
              }
            }
          },
          elements: {
            point: {
              hoverRadius: 8
            }
          }
        }
      });

      setIsLoading(false);
    };

    loadData();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [isOpen, token, activeTimeframe]);

  if (!token) return null;

  const currentPrice = parseFloat(token.currentPrice);
  const priceChange24h = parseFloat(token.priceChangePercentage24h || '0');
  const isPositive = priceChange24h >= 0;

  const formatMarketCap = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getTierColor = (tier: string) => {
    const colors = {
      'mega': 'border-purple-500 bg-purple-500/10',
      'large': 'border-blue-500 bg-blue-500/10',
      'largeMedium': 'border-cyan-500 bg-cyan-500/10',
      'smallMedium': 'border-green-500 bg-green-500/10',
      'small': 'border-yellow-500 bg-yellow-500/10',
      'micro': 'border-red-500 bg-red-500/10',
    };
    return colors[tier as keyof typeof colors] || 'border-slate-500 bg-slate-500/10';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-slate-900 border-slate-700 text-white">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            {token.logoUrl && (
              <img src={token.logoUrl} alt={token.name} className="w-8 h-8 rounded-full" />
            )}
            <div>
              <DialogTitle className="text-xl font-bold">{token.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400 text-sm">{token.symbol}</span>
                <Badge className={`text-xs ${getTierColor(token.tier)}`}>
                  {token.tier.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Price Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                ${currentPrice.toFixed(currentPrice > 1 ? 2 : 6)}
              </div>
              <div className={`flex items-center gap-1 text-lg font-medium ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
              </div>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
              {timeframes.map(({ key, label }) => (
                <Button
                  key={key}
                  variant={activeTimeframe === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTimeframe(key)}
                  className={`px-3 py-1 text-xs h-8 ${
                    activeTimeframe === key 
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                      : 'hover:bg-slate-700'
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <Card className="flex-1 bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 h-full">
              <div className="relative h-full">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded">
                    <div className="text-slate-400">Loading chart data...</div>
                  </div>
                )}
                <canvas ref={chartRef} className="w-full h-full" />
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">Market Cap</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold">{formatMarketCap(token.marketCap)}</div>
                <div className="text-xs text-slate-400">Rank #{token.marketCapRank || 'N/A'}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">24h Volume</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold">{formatVolume(token.volume24h || '0')}</div>
                <div className="text-xs text-slate-400">
                  {token.volume24h && token.marketCap ? 
                    `${((parseFloat(token.volume24h) / parseFloat(token.marketCap)) * 100).toFixed(1)}% of market cap` : 
                    'Volume/MCap ratio'
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">Price Change</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}${parseFloat(token.priceChange24h || '0').toFixed(6)}
                </div>
                <div className="text-xs text-slate-400">24h absolute change</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">Tier Performance</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold text-cyan-400">
                  {token.tier.charAt(0).toUpperCase() + token.tier.slice(1)}
                </div>
                <div className="text-xs text-slate-400">Market cap category</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              <Target className="h-4 w-4 mr-2" />
              Set Price Alert
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Add to Watchlist
            </Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze Opportunity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}