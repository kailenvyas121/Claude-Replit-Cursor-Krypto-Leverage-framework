import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, TrendingUp, Target, Zap } from "lucide-react";

interface SmartAlertSystemProps {
  marketData: any;
}

export default function SmartAlertSystem({ marketData }: SmartAlertSystemProps) {
  const [alertType, setAlertType] = useState<string>('all');

  const generateSmartAlerts = () => {
    if (!marketData?.cryptocurrencies) return [];

    const alerts = [];
    
    // Tier Lag Alerts
    const tierGroups = marketData.cryptocurrencies.reduce((acc: any, coin: any) => {
      if (!acc[coin.tier]) acc[coin.tier] = [];
      acc[coin.tier].push(coin);
      return acc;
    }, {});

    Object.entries(tierGroups).forEach(([tier, coins]: [string, any[]]) => {
      const tierAvg = coins.reduce((sum, coin) => 
        sum + parseFloat(coin.priceChangePercentage24h || '0'), 0) / coins.length;
      
      coins.forEach(coin => {
        const deviation = parseFloat(coin.priceChangePercentage24h || '0') - tierAvg;
        
        // Significant lag alert
        if (deviation < -5 && tierAvg > 2) {
          alerts.push({
            id: `lag_${coin.symbol}`,
            type: 'LAG_OPPORTUNITY',
            severity: 'HIGH',
            coin: coin.symbol,
            tier,
            message: `${coin.symbol} lagging ${tier} tier by ${Math.abs(deviation).toFixed(1)}% - potential catch-up opportunity`,
            action: 'LONG',
            confidence: Math.min(95, 60 + Math.abs(deviation) * 3),
            leverage: deviation < -8 ? '5x' : '3x',
            entryZone: `Current - ${(parseFloat(coin.currentPrice) * 0.98).toFixed(coin.currentPrice.includes('.') ? 4 : 2)}`,
            timestamp: new Date().toLocaleTimeString()
          });
        }
        
        // Breakout momentum alert
        if (deviation > 8 && parseFloat(coin.volume24h || '0') > parseFloat(coin.marketCap || '0') * 0.15) {
          alerts.push({
            id: `momentum_${coin.symbol}`,
            type: 'MOMENTUM_BREAKOUT',
            severity: 'MEDIUM',
            coin: coin.symbol,
            tier,
            message: `${coin.symbol} showing strong momentum (+${deviation.toFixed(1)}%) with high volume`,
            action: 'MONITOR',
            confidence: Math.min(85, 40 + deviation * 2),
            leverage: '2x',
            entryZone: `Wait for pullback to ${(parseFloat(coin.currentPrice) * 0.95).toFixed(4)}`,
            timestamp: new Date().toLocaleTimeString()
          });
        }

        // Volume divergence alert
        const volumeRatio = parseFloat(coin.volume24h || '0') / parseFloat(coin.marketCap || '1');
        if (volumeRatio > 0.3 && Math.abs(deviation) < 2) {
          alerts.push({
            id: `volume_${coin.symbol}`,
            type: 'VOLUME_DIVERGENCE',
            severity: 'LOW',
            coin: coin.symbol,
            tier,
            message: `${coin.symbol} unusual volume (${(volumeRatio * 100).toFixed(1)}% of market cap) with low price movement`,
            action: 'WATCH',
            confidence: 45,
            leverage: '2x',
            entryZone: 'Wait for direction confirmation',
            timestamp: new Date().toLocaleTimeString()
          });
        }
      });
    });

    // Tier correlation breakdown alerts
    const tiers = ['mega', 'large', 'largeMedium', 'smallMedium', 'small', 'micro'];
    for (let i = 0; i < tiers.length - 1; i++) {
      const tier1Data = tierGroups[tiers[i]] || [];
      const tier2Data = tierGroups[tiers[i + 1]] || [];
      
      if (tier1Data.length > 0 && tier2Data.length > 0) {
        const tier1Avg = tier1Data.reduce((sum: number, coin: any) => 
          sum + parseFloat(coin.priceChangePercentage24h || '0'), 0) / tier1Data.length;
        const tier2Avg = tier2Data.reduce((sum: number, coin: any) => 
          sum + parseFloat(coin.priceChangePercentage24h || '0'), 0) / tier2Data.length;
        
        const correlation = tier1Avg - tier2Avg;
        
        if (Math.abs(correlation) > 4) {
          alerts.push({
            id: `correlation_${tiers[i]}_${tiers[i + 1]}`,
            type: 'CORRELATION_BREAKDOWN',
            severity: correlation > 0 ? 'MEDIUM' : 'HIGH',
            coin: `${tiers[i].toUpperCase()} vs ${tiers[i + 1].toUpperCase()}`,
            tier: 'cross-tier',
            message: `${correlation > 0 ? 'Positive' : 'Negative'} correlation breakdown: ${Math.abs(correlation).toFixed(1)}% spread`,
            action: correlation > 0 ? 'LONG_SMALLER' : 'LONG_LARGER',
            confidence: Math.min(90, 50 + Math.abs(correlation) * 5),
            leverage: Math.abs(correlation) > 6 ? '4x' : '3x',
            entryZone: 'Target underperforming tier leaders',
            timestamp: new Date().toLocaleTimeString()
          });
        }
      }
    }

    return alerts.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
  };

  const alerts = generateSmartAlerts();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'border-red-500 bg-red-500/10';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-500/10';
      case 'LOW': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-slate-500 bg-slate-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LAG_OPPORTUNITY': return <Target className="h-4 w-4" />;
      case 'MOMENTUM_BREAKOUT': return <TrendingUp className="h-4 w-4" />;
      case 'VOLUME_DIVERGENCE': return <Zap className="h-4 w-4" />;
      case 'CORRELATION_BREAKDOWN': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Smart Alert System
        </CardTitle>
        <CardDescription className="text-slate-400">
          AI-powered alerts for optimal entry/exit opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          {['all', 'LAG_OPPORTUNITY', 'MOMENTUM_BREAKOUT', 'VOLUME_DIVERGENCE', 'CORRELATION_BREAKDOWN'].map(type => (
            <Button
              key={type}
              variant={alertType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setAlertType(type)}
              className="text-xs"
            >
              {type === 'all' ? 'All' : type.replace('_', ' ')}
            </Button>
          ))}
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts
            .filter(alert => alertType === 'all' || alert.type === alertType)
            .map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} hover:bg-slate-800/50 transition-colors`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(alert.type)}
                  <span className="font-medium text-slate-200">{alert.coin}</span>
                  <Badge variant="outline" className="text-xs">
                    {alert.tier}
                  </Badge>
                </div>
                <div className="text-right">
                  <Badge
                    variant={alert.severity === 'HIGH' ? 'destructive' : 
                            alert.severity === 'MEDIUM' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.confidence}% confidence
                  </Badge>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm mb-3">{alert.message}</p>
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-slate-400">Action</div>
                  <div className={`font-medium ${
                    alert.action.includes('LONG') ? 'text-green-400' : 
                    alert.action.includes('SHORT') ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {alert.action}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Leverage</div>
                  <div className="text-slate-300 font-mono">{alert.leverage}</div>
                </div>
                <div>
                  <div className="text-slate-400">Entry Zone</div>
                  <div className="text-slate-300 font-mono text-xs">{alert.entryZone}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-600">
                <span className="text-slate-500 text-xs">{alert.timestamp}</span>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Set Alert
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {alerts.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No alerts at this time. Market conditions are stable.
          </div>
        )}
      </CardContent>
    </Card>
  );
}