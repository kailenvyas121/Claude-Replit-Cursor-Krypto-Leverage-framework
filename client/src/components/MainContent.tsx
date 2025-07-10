import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Target, BarChart3, RefreshCw } from "lucide-react";
import DistributionChart from "./charts/DistributionChart";
import PerformanceChart from "./charts/PerformanceChart";
import CorrelationChart from "./charts/CorrelationChart";
import TierAnalysisChart from "./charts/TierAnalysisChart";
import OpportunityCard from "./OpportunityCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MainContentProps {
  activeTab: 'overview' | 'comparison' | 'analysis' | 'opportunities';
  onTabChange: (tab: 'overview' | 'comparison' | 'analysis' | 'opportunities') => void;
  marketData: any;
  isConnected: boolean;
}

export default function MainContent({ activeTab, onTabChange, marketData, isConnected }: MainContentProps) {
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [sortBy, setSortBy] = useState<string>('performance');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshOpportunities = useMutation({
    mutationFn: () => apiRequest('POST', '/api/opportunities/analyze'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({
        title: "Analysis Complete",
        description: "Trading opportunities have been refreshed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refresh opportunities analysis",
        variant: "destructive",
      });
    },
  });

  const calculateMarketStats = () => {
    if (!marketData?.cryptocurrencies) {
      return {
        totalMarketCap: 0,
        btcDominance: 0,
        activeOpportunities: 0,
        marketTrend: 'neutral',
      };
    }

    const totalMarketCap = marketData.cryptocurrencies.reduce((sum: number, coin: any) => 
      sum + parseFloat(coin.marketCap || '0'), 0
    );

    const btc = marketData.cryptocurrencies.find((coin: any) => coin.symbol === 'BTC');
    const btcDominance = btc ? (parseFloat(btc.marketCap || '0') / totalMarketCap) * 100 : 0;

    const avgChange = marketData.cryptocurrencies.reduce((sum: number, coin: any) => 
      sum + parseFloat(coin.priceChangePercentage24h || '0'), 0
    ) / marketData.cryptocurrencies.length;

    const marketTrend = avgChange > 2 ? 'bullish' : avgChange < -2 ? 'bearish' : 'neutral';

    return {
      totalMarketCap,
      btcDominance,
      activeOpportunities: marketData.opportunities?.length || 0,
      marketTrend,
    };
  };

  const stats = calculateMarketStats();

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <main className="flex-1 p-6">
      <Tabs value={activeTab} onValueChange={onTabChange as any}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-900/80 backdrop-blur-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Market Comparison</TabsTrigger>
          <TabsTrigger value="analysis">Tier Analysis</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Market Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Market Cap</CardTitle>
                <BarChart3 className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-400">
                  {formatMarketCap(stats.totalMarketCap)}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-400/20">
                    +2.4% 24h
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">BTC Dominance</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  {stats.btcDominance.toFixed(1)}%
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-red-900/20 text-red-400 border-red-400/20">
                    -0.8% 24h
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Active Opportunities</CardTitle>
                <Target className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {stats.activeOpportunities}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-400/20">
                    8 new
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Market Trend</CardTitle>
                {stats.marketTrend === 'bullish' ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  stats.marketTrend === 'bullish' ? 'text-green-400' : 
                  stats.marketTrend === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {stats.marketTrend === 'bullish' ? 'Bullish' : 
                   stats.marketTrend === 'bearish' ? 'Bearish' : 'Neutral'}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-400/20">
                    Strong Signal
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Market Cap Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionChart data={marketData?.cryptocurrencies || []} />
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">24h Performance by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart data={marketData?.cryptocurrencies || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Filtering Options */}
          <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced Filtering Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Market Cap Tiers</label>
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="mega">Mega Cap Only</SelectItem>
                      <SelectItem value="large">Large Cap Only</SelectItem>
                      <SelectItem value="compare">Compare Large vs Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time Range</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="volatility">Volatility</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="correlation">Correlation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tier Correlation Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <CorrelationChart data={marketData?.correlations || []} />
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Volatility Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-400">
                  Volatility Chart Coming Soon
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Individual Tier Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <TierAnalysisChart data={marketData?.cryptocurrencies || []} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Tier Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-slate-800 rounded border border-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Mega Cap Avg</span>
                      <span className="text-green-400 font-mono">+2.1%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded border border-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Large Cap Avg</span>
                      <span className="text-red-400 font-mono">-0.8%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded border border-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Medium Cap Avg</span>
                      <span className="text-green-400 font-mono">+1.4%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Live Trading Opportunities
                <Button
                  onClick={() => refreshOpportunities.mutate()}
                  disabled={refreshOpportunities.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  RefreshCw Analysis
                </Button>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Statistical analysis of tier correlation breakdowns and leverage opportunities
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {marketData?.opportunities?.map((opportunity: any) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            )) || (
              <div className="col-span-2 flex items-center justify-center p-8 text-slate-400">
                {isConnected ? "No opportunities available" : "Connect to see live opportunities"}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
