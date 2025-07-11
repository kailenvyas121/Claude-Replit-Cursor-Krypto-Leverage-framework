import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Shield, Zap, TrendingUp, Calculator } from "lucide-react";

interface Exchange {
  id: string;
  name: string;
  logo: string;
  maxLeverage: number;
  feeStructure: 'maker-taker' | 'flat' | 'profit-sharing';
  makerFee: number;
  takerFee: number;
  profitFee?: number;
  features: string[];
  cryptoSupport: number;
  reputation: number;
  founded: number;
  jurisdiction: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  website: string;
}

const exchanges: Exchange[] = [
  {
    id: 'bybit',
    name: 'Bybit',
    logo: '🟡',
    maxLeverage: 100,
    feeStructure: 'maker-taker',
    makerFee: -0.025,
    takerFee: 0.075,
    features: ['Perpetual Contracts', 'Options', 'Copy Trading', 'Grid Trading'],
    cryptoSupport: 300,
    reputation: 95,
    founded: 2018,
    jurisdiction: 'Dubai',
    description: 'Leading derivatives exchange with excellent execution and low latency',
    pros: ['Negative maker fees', 'High liquidity', 'Advanced order types', 'Mobile app'],
    cons: ['KYC required', 'Geographic restrictions'],
    bestFor: 'High-frequency traders and scalpers',
    website: 'https://bybit.com'
  },
  {
    id: 'binance',
    name: 'Binance Futures',
    logo: '🟨',
    maxLeverage: 125,
    feeStructure: 'maker-taker',
    makerFee: 0.02,
    takerFee: 0.04,
    features: ['Perpetual & Quarterly', 'Auto-Deleveraging', 'Portfolio Margin'],
    cryptoSupport: 200,
    reputation: 98,
    founded: 2017,
    jurisdiction: 'Multiple',
    description: 'World\'s largest crypto exchange with deep liquidity',
    pros: ['Highest liquidity', 'Most trading pairs', 'Advanced features'],
    cons: ['Higher fees', 'Complex interface'],
    bestFor: 'Large volume traders seeking maximum liquidity',
    website: 'https://binance.com'
  },
  {
    id: 'okx',
    name: 'OKX',
    logo: '⚫',
    maxLeverage: 100,
    feeStructure: 'maker-taker',
    makerFee: 0.02,
    takerFee: 0.05,
    features: ['Spot Margin', 'Perpetual Swaps', 'Options', 'Structured Products'],
    cryptoSupport: 350,
    reputation: 92,
    founded: 2017,
    jurisdiction: 'Seychelles',
    description: 'Comprehensive trading platform with innovative products',
    pros: ['Wide product range', 'Good mobile app', 'Competitive fees'],
    cons: ['Lower liquidity than Binance', 'Less US-friendly'],
    bestFor: 'Diversified traders wanting multiple instruments',
    website: 'https://okx.com'
  },
  {
    id: 'dydx',
    name: 'dYdX',
    logo: '🔵',
    maxLeverage: 20,
    feeStructure: 'maker-taker',
    makerFee: 0.02,
    takerFee: 0.05,
    features: ['Decentralized', 'No KYC', 'Self-custody', 'Ethereum-based'],
    cryptoSupport: 50,
    reputation: 88,
    founded: 2017,
    jurisdiction: 'Decentralized',
    description: 'Leading decentralized perpetuals exchange on Ethereum',
    pros: ['Decentralized', 'No KYC', 'Self-custody', 'Open source'],
    cons: ['Lower leverage', 'Gas fees', 'Limited pairs'],
    bestFor: 'DeFi enthusiasts prioritizing decentralization',
    website: 'https://dydx.exchange'
  },
  {
    id: 'gmx',
    name: 'GMX',
    logo: '🔴',
    maxLeverage: 50,
    feeStructure: 'flat',
    makerFee: 0.1,
    takerFee: 0.1,
    features: ['Zero Price Impact', 'Multi-Asset Pool', 'Real Yield', 'Arbitrum/Avalanche'],
    cryptoSupport: 25,
    reputation: 85,
    founded: 2021,
    jurisdiction: 'Decentralized',
    description: 'Innovative DEX with zero price impact trading',
    pros: ['Zero price impact', 'Real yield', 'Multi-chain', 'Novel mechanism'],
    cons: ['Higher fees', 'Limited pairs', 'Complex tokenomics'],
    bestFor: 'Large trades without slippage on DeFi',
    website: 'https://gmx.io'
  },
  {
    id: 'apex',
    name: 'ApeX Protocol',
    logo: '🟣',
    maxLeverage: 20,
    feeStructure: 'profit-sharing',
    makerFee: 0.02,
    takerFee: 0.05,
    profitFee: 10,
    features: ['Cross-chain', 'DAO Governed', 'Profit Sharing', 'StarkEx'],
    cryptoSupport: 40,
    reputation: 82,
    founded: 2021,
    jurisdiction: 'Decentralized',
    description: 'Cross-chain decentralized derivatives protocol',
    pros: ['Profit sharing model', 'Cross-chain', 'DAO governance'],
    cons: ['Newer protocol', 'Lower liquidity', 'StarkEx dependency'],
    bestFor: 'DeFi natives wanting profit-sharing rewards',
    website: 'https://apex.exchange'
  }
];

interface LeverageExchangesProps {
  marketData: any;
}

export default function LeverageExchanges({ marketData }: LeverageExchangesProps) {
  const sortedExchanges = [...exchanges].sort((a, b) => b.maxLeverage - a.maxLeverage);

  const getFeeColor = (fee: number) => {
    if (fee < 0) return 'text-green-400';
    if (fee <= 0.02) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 95) return 'bg-green-500';
    if (reputation >= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatFee = (fee: number) => {
    return fee < 0 ? `${Math.abs(fee)}% rebate` : `${fee}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Best Leverage Trading Exchanges</h2>
        <p className="text-slate-400">
          Comprehensive analysis of top exchanges for high-leverage cryptocurrency trading
        </p>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">125x</div>
                <div className="text-xs text-slate-400">Max Leverage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">-0.025%</div>
                <div className="text-xs text-slate-400">Best Maker Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-xs text-slate-400">Top Exchanges</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">350+</div>
                <div className="text-xs text-slate-400">Trading Pairs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Cards */}
      <div className="grid gap-6">
        {sortedExchanges.map((exchange) => (
          <Card key={exchange.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{exchange.logo}</div>
                  <div>
                    <CardTitle className="text-xl text-white">{exchange.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-purple-600/20 text-purple-400 border-purple-400/20">
                        {exchange.maxLeverage}x Leverage
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${getReputationColor(exchange.reputation)}`} />
                      <span className="text-xs text-slate-400">{exchange.reputation}% Trust Score</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-slate-600 hover:border-slate-500"
                  onClick={() => window.open(exchange.website, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-slate-300">{exchange.description}</p>
              
              {/* Key Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <div className="text-xs text-slate-400">Maker Fee</div>
                  <div className={`font-bold ${getFeeColor(exchange.makerFee)}`}>
                    {formatFee(exchange.makerFee)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Taker Fee</div>
                  <div className={`font-bold ${getFeeColor(exchange.takerFee)}`}>
                    {formatFee(exchange.takerFee)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Trading Pairs</div>
                  <div className="font-bold text-white">{exchange.cryptoSupport}+</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Founded</div>
                  <div className="font-bold text-white">{exchange.founded}</div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Key Features</h4>
                <div className="flex flex-wrap gap-2">
                  {exchange.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-slate-700/50 text-slate-300">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-2">Advantages</h4>
                  <ul className="space-y-1">
                    {exchange.pros.map((pro, index) => (
                      <li key={index} className="text-xs text-slate-300 flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-400 rounded-full" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-2">Considerations</h4>
                  <ul className="space-y-1">
                    {exchange.cons.map((con, index) => (
                      <li key={index} className="text-xs text-slate-300 flex items-center gap-1">
                        <div className="w-1 h-1 bg-red-400 rounded-full" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best For */}
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">Best For:</span>
                </div>
                <p className="text-sm text-slate-300 mt-1">{exchange.bestFor}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Warning */}
      <Card className="bg-red-900/20 border-red-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400">Risk Warning</h3>
              <p className="text-sm text-slate-300 mt-1">
                Leverage trading involves substantial risk of loss and is not suitable for all investors. 
                You should carefully consider whether trading with leverage is appropriate for you in light of your experience, 
                objectives, financial resources, and other relevant circumstances. Never trade with funds you cannot afford to lose.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}