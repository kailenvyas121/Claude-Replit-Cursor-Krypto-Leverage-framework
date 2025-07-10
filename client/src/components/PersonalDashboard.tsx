import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, TrendingUp, TrendingDown, Activity, Target, Trash2, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TokenDetailModal from "./TokenDetailModal";

interface PersonalDashboardProps {
  marketData: any;
}

export default function PersonalDashboard({ marketData }: PersonalDashboardProps) {
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // For demo purposes, using userId = 1
  const userId = 1;

  // Fetch user's favorite cryptocurrencies
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['/api/favorites', userId],
    queryFn: () => apiRequest('GET', `/api/favorites/${userId}`)
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (cryptocurrencyId: number) => 
      apiRequest('DELETE', `/api/favorites/${userId}/${cryptocurrencyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', userId] });
      toast({
        title: "Removed from favorites",
        description: "Token removed from your personal watchlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num < 0.01) return `$${num.toFixed(8)}`;
    if (num < 1) return `$${num.toFixed(6)}`;
    if (num < 100) return `$${num.toFixed(4)}`;
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: string) => {
    const num = parseFloat(marketCap);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const getTierInfo = (tier: string) => {
    const tiers = {
      mega: { name: 'Mega Cap', color: 'bg-purple-500', range: '$100B+' },
      large: { name: 'Large Cap', color: 'bg-blue-500', range: '$10B-$100B' },
      largeMedium: { name: 'Large Medium', color: 'bg-cyan-500', range: '$5B-$10B' },
      smallMedium: { name: 'Small Medium', color: 'bg-green-500', range: '$1B-$5B' },
      small: { name: 'Small Cap', color: 'bg-yellow-500', range: '$100M-$1B' },
      micro: { name: 'Micro/Shit Coins', color: 'bg-red-500', range: '$10M-$100M' },
    };
    return tiers[tier as keyof typeof tiers] || { name: tier, color: 'bg-gray-500', range: 'Unknown' };
  };

  const getOpportunitiesForToken = (tokenId: number) => {
    return marketData?.opportunities?.filter(
      (opp: any) => opp.cryptocurrencyId === tokenId
    ) || [];
  };

  const portfolioStats = {
    totalValue: favorites.reduce((sum: number, token: any) => 
      sum + parseFloat(token.marketCap || '0'), 0),
    avgPerformance: favorites.length > 0 ? 
      favorites.reduce((sum: number, token: any) => 
        sum + parseFloat(token.priceChangePercentage24h || '0'), 0) / favorites.length : 0,
    totalOpportunities: favorites.reduce((sum: number, token: any) => 
      sum + getOpportunitiesForToken(token.id).length, 0),
    riskDistribution: favorites.reduce((acc: any, token: any) => {
      const opportunities = getOpportunitiesForToken(token.id);
      opportunities.forEach((opp: any) => {
        acc[opp.riskLevel] = (acc[opp.riskLevel] || 0) + 1;
      });
      return acc;
    }, {})
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-slate-400">Loading your personal dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Favorites</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{favorites.length}</div>
            <p className="text-xs text-slate-400">Tokens tracked</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Performance</CardTitle>
            {portfolioStats.avgPerformance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolioStats.avgPerformance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioStats.avgPerformance >= 0 ? '+' : ''}{portfolioStats.avgPerformance.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400">24h change</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Opportunities</CardTitle>
            <Target className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">{portfolioStats.totalOpportunities}</div>
            <p className="text-xs text-slate-400">Active signals</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Portfolio Value</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {formatMarketCap(portfolioStats.totalValue.toString())}
            </div>
            <p className="text-xs text-slate-400">Combined market cap</p>
          </CardContent>
        </Card>
      </div>

      {favorites.length === 0 ? (
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Star className="h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Favorites Yet</h3>
            <p className="text-slate-400 text-center mb-6 max-w-md">
              Start building your personal watchlist by starring tokens in the Discovery tab. 
              Track your favorite cryptocurrencies and their trading opportunities in one place.
            </p>
            <Button 
              onClick={() => window.location.hash = '#discovery'} 
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Explore Tokens
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="watchlist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/80">
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {favorites.map((token: any) => {
                const tierInfo = getTierInfo(token.tier);
                const change = parseFloat(token.priceChangePercentage24h || '0');
                const opportunities = getOpportunitiesForToken(token.id);

                return (
                  <Card key={token.id} className="bg-slate-900/80 backdrop-blur-sm border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{token.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{token.symbol}</h3>
                            <p className="text-sm text-slate-400">{token.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`${tierInfo.color} text-white border-0 text-xs`}
                          >
                            {tierInfo.name}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavoriteMutation.mutate(token.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-white">
                            {formatPrice(token.currentPrice)}
                          </span>
                          <span className={`font-mono text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400">Market Cap</p>
                            <p className="text-slate-200">{formatMarketCap(token.marketCap)}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Rank</p>
                            <p className="text-slate-200">#{token.marketCapRank}</p>
                          </div>
                        </div>

                        {opportunities.length > 0 && (
                          <div className="pt-2 border-t border-slate-700">
                            <p className="text-xs text-slate-400 mb-2">Active Opportunities</p>
                            <div className="flex flex-wrap gap-1">
                              {opportunities.slice(0, 2).map((opp: any, idx: number) => (
                                <Badge 
                                  key={idx}
                                  variant="outline" 
                                  className={`text-xs ${
                                    opp.riskLevel === 'LOW' ? 'border-green-500 text-green-400' :
                                    opp.riskLevel === 'MEDIUM' ? 'border-yellow-500 text-yellow-400' :
                                    'border-red-500 text-red-400'
                                  }`}
                                >
                                  {opp.opportunityType} {opp.leverageRecommendation}
                                </Badge>
                              ))}
                              {opportunities.length > 2 && (
                                <Badge variant="outline" className="border-slate-500 text-slate-400 text-xs">
                                  +{opportunities.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => setSelectedToken(token)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                          size="sm"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your Token Opportunities</CardTitle>
                <CardDescription className="text-slate-400">
                  Trading opportunities for your favorite tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {favorites.map((token: any) => {
                    const opportunities = getOpportunitiesForToken(token.id);
                    if (opportunities.length === 0) return null;

                    return (
                      <div key={token.id} className="border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{token.symbol}</h4>
                          <Badge className="bg-cyan-600 text-white">
                            {opportunities.length} opportunity{opportunities.length > 1 ? 'ies' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {opportunities.map((opp: any, idx: number) => (
                            <div key={idx} className="bg-slate-800 rounded p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex space-x-2">
                                  <Badge 
                                    className={`${
                                      opp.riskLevel === 'LOW' ? 'bg-green-600' :
                                      opp.riskLevel === 'MEDIUM' ? 'bg-yellow-600' :
                                      'bg-red-600'
                                    } text-white`}
                                  >
                                    {opp.riskLevel}
                                  </Badge>
                                  <Badge className="bg-blue-600 text-white">
                                    {opp.opportunityType}
                                  </Badge>
                                  <Badge className="bg-purple-600 text-white">
                                    {opp.leverageRecommendation}
                                  </Badge>
                                </div>
                                <span className="text-cyan-400 font-mono">
                                  {parseFloat(opp.confidence).toFixed(0)}% confidence
                                </span>
                              </div>
                              <p className="text-slate-300 text-sm">
                                {opp.analysis?.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(portfolioStats.riskDistribution).map(([risk, count]) => (
                      <div key={risk} className="flex justify-between items-center">
                        <span className="text-slate-300 capitalize">{risk} Risk</span>
                        <Badge 
                          className={`${
                            risk === 'LOW' ? 'bg-green-600' :
                            risk === 'MEDIUM' ? 'bg-yellow-600' :
                            'bg-red-600'
                          } text-white`}
                        >
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Tier Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      favorites.reduce((acc: any, token: any) => {
                        const tierInfo = getTierInfo(token.tier);
                        acc[tierInfo.name] = (acc[tierInfo.name] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([tier, count]) => (
                      <div key={tier} className="flex justify-between items-center">
                        <span className="text-slate-300">{tier}</span>
                        <Badge className="bg-slate-600 text-white">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {selectedToken && (
        <TokenDetailModal
          isOpen={!!selectedToken}
          onClose={() => setSelectedToken(null)}
          token={selectedToken}
        />
      )}
    </div>
  );
}