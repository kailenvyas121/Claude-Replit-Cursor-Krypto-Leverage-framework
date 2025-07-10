import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TokenDetailModal from "./TokenDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Star, 
  BarChart3,
  DollarSign,
  Volume2,
  Target,
  Crown,
  Zap,
  Shield,
  AlertTriangle,
  Gem,
  ChevronRight,
  Eye,
  Users,
  Rocket
} from "lucide-react";

interface CryptoDiscoveryProps {
  marketData: any;
}

interface TokenInfo {
  id: number;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  tier: string;
  logoUrl?: string;
  rank: number;
  description?: string;
  features?: string[];
  riskLevel?: 'low' | 'medium' | 'high';
  popularityScore?: number;
}

const tierInfo = {
  mega: { 
    name: "Mega Cap", 
    description: "Market leaders with $100B+ market cap", 
    icon: Crown, 
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20",
    borderColor: "border-yellow-400/30"
  },
  large: { 
    name: "Large Cap", 
    description: "Established projects $10B-$100B", 
    icon: Shield, 
    color: "text-blue-400",
    bgColor: "bg-blue-900/20",
    borderColor: "border-blue-400/30"
  },
  largeMedium: { 
    name: "Large Medium", 
    description: "Growing projects $5B-$10B", 
    icon: BarChart3, 
    color: "text-green-400",
    bgColor: "bg-green-900/20",
    borderColor: "border-green-400/30"
  },
  smallMedium: { 
    name: "Small Medium", 
    description: "Emerging projects $1B-$5B", 
    icon: Target, 
    color: "text-purple-400",
    bgColor: "bg-purple-900/20",
    borderColor: "border-purple-400/30"
  },
  small: { 
    name: "Small Cap", 
    description: "Smaller projects $100M-$1B", 
    icon: Zap, 
    color: "text-orange-400",
    bgColor: "bg-orange-900/20",
    borderColor: "border-orange-400/30"
  },
  micro: { 
    name: "Micro Cap", 
    description: "High-risk speculative $10M-$100M", 
    icon: AlertTriangle, 
    color: "text-red-400",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-400/30"
  }
};

const popularTokens = {
  mega: ['BTC', 'ETH'],
  large: ['BNB', 'SOL', 'XRP', 'USDC', 'ADA', 'AVAX'],
  largeMedium: ['DOT', 'LINK', 'MATIC', 'UNI', 'ATOM', 'ICP'],
  smallMedium: ['ALGO', 'VET', 'THETA', 'FTM', 'HBAR', 'XTZ'],
  small: ['ROSE', 'KAVA', 'CELO', 'SKL', 'BAND', 'REN'],
  micro: ['PEPE', 'FLOKI', 'SHIB', 'WOJAK', 'DOGE2', 'MEME']
};

export default function CryptoDiscovery({ marketData }: CryptoDiscoveryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'marketCap' | 'volume' | 'change' | 'name'>('marketCap');
  const [activeTab, setActiveTab] = useState<'overview' | 'popular' | 'tiers'>('overview');
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // For demo purposes, using userId = 1
  const userId = 1;

  // Fetch user's favorite cryptocurrencies
  const { data: favoritesList = [] } = useQuery({
    queryKey: ['/api/favorites', userId],
    queryFn: () => apiRequest('GET', `/api/favorites/${userId}`)
  });

  // Create a set of favorite IDs for quick lookup
  const favoriteIds = new Set(favoritesList.map((fav: any) => fav.id));

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: (cryptocurrencyId: number) => 
      apiRequest('POST', '/api/favorites', { userId, cryptocurrencyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', userId] });
      toast({
        title: "Added to favorites",
        description: "Token added to your personal watchlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    },
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

  const toggleFavorite = (token: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    if (favoriteIds.has(token.id)) {
      removeFavoriteMutation.mutate(token.id);
    } else {
      addFavoriteMutation.mutate(token.id);
    }
  };

  const processedTokens = useMemo(() => {
    if (!marketData?.cryptocurrencies) return [];
    
    return marketData.cryptocurrencies.map((crypto: any) => ({
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      price: parseFloat(crypto.currentPrice || '0'),
      marketCap: parseFloat(crypto.marketCap || '0'),
      volume24h: parseFloat(crypto.volume24h || '0'),
      change24h: parseFloat(crypto.priceChangePercentage24h || '0'),
      tier: crypto.tier,
      logoUrl: crypto.logoUrl,
      rank: crypto.marketCapRank || 0,
      riskLevel: crypto.tier === 'micro' ? 'high' : crypto.tier === 'small' ? 'medium' : 'low',
      popularityScore: popularTokens[crypto.tier as keyof typeof popularTokens]?.includes(crypto.symbol) ? 100 : 
                      Math.max(0, 100 - (crypto.marketCapRank || 0) / 10)
    }));
  }, [marketData]);

  const filteredTokens = useMemo(() => {
    let filtered = processedTokens;

    if (searchTerm) {
      filtered = filtered.filter(token => 
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(token => token.tier === selectedTier);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'marketCap':
          return b.marketCap - a.marketCap;
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'change':
          return b.change24h - a.change24h;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [processedTokens, searchTerm, selectedTier, sortBy]);

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
  };

  const getTierStats = () => {
    const stats = Object.keys(tierInfo).map(tier => {
      const tokens = processedTokens.filter(token => token.tier === tier);
      const totalMarketCap = tokens.reduce((sum, token) => sum + token.marketCap, 0);
      const avgChange = tokens.length > 0 ? tokens.reduce((sum, token) => sum + token.change24h, 0) / tokens.length : 0;
      
      return {
        tier,
        count: tokens.length,
        totalMarketCap,
        avgChange,
        topPerformers: tokens.sort((a, b) => b.change24h - a.change24h).slice(0, 3)
      };
    });
    
    return stats.filter(stat => stat.count > 0);
  };

  const getPopularInTier = (tier: string) => {
    return processedTokens
      .filter(token => token.tier === tier)
      .filter(token => popularTokens[tier as keyof typeof popularTokens]?.includes(token.symbol))
      .sort((a, b) => b.popularityScore - a.popularityScore);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Gem className="h-6 w-6 text-blue-400" />
                Cryptocurrency Discovery
              </CardTitle>
              <p className="text-slate-400 mt-1">
                Explore and analyze {processedTokens.length} cryptocurrencies across all market cap tiers
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-400/30">
              <Eye className="h-3 w-3 mr-1" />
              {processedTokens.length} Tokens
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {Object.entries(tierInfo).map(([tier, info]) => (
                  <SelectItem key={tier} value={tier}>
                    {info.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy as any}>
              <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketCap">Market Cap</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="change">24h Change</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-900/80">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="tiers">By Tier</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-3">
              {filteredTokens.map((token) => {
                const tierConfig = tierInfo[token.tier as keyof typeof tierInfo];
                const IconComponent = tierConfig.icon;
                
                return (
                  <Card 
                    key={token.id} 
                    className="bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedToken(token)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${tierConfig.bgColor} ${tierConfig.borderColor} border flex items-center justify-center`}>
                            <IconComponent className={`h-5 w-5 ${tierConfig.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{token.symbol}</span>
                              <Badge variant="outline" className="text-xs">
                                #{token.rank}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400">{token.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-semibold">{formatPrice(token.price)}</div>
                          <div className={`text-sm flex items-center gap-1 ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-medium">{formatNumber(token.marketCap)}</div>
                          <div className="text-sm text-slate-400">Market Cap</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-medium">{formatNumber(token.volume24h)}</div>
                          <div className="text-sm text-slate-400">Volume 24h</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={tierConfig.bgColor + ' ' + tierConfig.color + ' border-0'}>
                            {tierConfig.name}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => toggleFavorite(token, e)}
                            className={`${favoriteIds.has(token.id) ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'}`}
                          >
                            <Star className={`h-4 w-4 ${favoriteIds.has(token.id) ? 'fill-current' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(tierInfo).map(([tier, config]) => {
              const popularInTier = getPopularInTier(tier);
              if (popularInTier.length === 0) return null;
              
              const IconComponent = config.icon;
              
              return (
                <Card key={tier} className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <IconComponent className={`h-5 w-5 ${config.color}`} />
                      {config.name} - Popular Tokens
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {popularInTier.map((token) => (
                        <div key={token.id} className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white">{token.symbol}</span>
                            <span className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mb-1">{token.name}</p>
                          <p className="text-white font-medium">{formatPrice(token.price)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4">
            {getTierStats().map((stat) => {
              const tierConfig = tierInfo[stat.tier as keyof typeof tierInfo];
              const IconComponent = tierConfig.icon;
              
              return (
                <Card key={stat.tier} className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <IconComponent className={`h-5 w-5 ${tierConfig.color}`} />
                        {tierConfig.name}
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-slate-300">
                          {stat.count} tokens
                        </Badge>
                        <Badge className={`${stat.avgChange >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                          Avg: {stat.avgChange >= 0 ? '+' : ''}{stat.avgChange.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-400">{tierConfig.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Total Market Cap</p>
                        <p className="text-xl font-bold text-white">{formatNumber(stat.totalMarketCap)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Top Performers</p>
                        <div className="space-y-1">
                          {stat.topPerformers.map((token) => (
                            <div key={token.id} className="flex items-center justify-between text-sm">
                              <span className="text-white">{token.symbol}</span>
                              <span className={`${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

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