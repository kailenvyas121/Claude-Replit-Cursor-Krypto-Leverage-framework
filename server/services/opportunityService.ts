import { Cryptocurrency, TradingOpportunity, InsertTradingOpportunity } from '@shared/schema';
import { CryptoService } from './cryptoService';

export interface OpportunityAnalysis {
  volatilityRisk: number;
  correlationRisk: number;
  volumeRisk: number;
  trendRisk: number;
  statisticalSignificance: number;
  historicalSuccessRate: number;
  explanation: string;
  strategy: string;
  entryPoint: string;
  exitPoint: string;
  stopLoss: string;
}

export class OpportunityService {
  private static instance: OpportunityService;
  private cryptoService = CryptoService.getInstance();

  static getInstance(): OpportunityService {
    if (!OpportunityService.instance) {
      OpportunityService.instance = new OpportunityService();
    }
    return OpportunityService.instance;
  }

  async analyzeOpportunities(cryptocurrencies: Cryptocurrency[]): Promise<InsertTradingOpportunity[]> {
    const opportunities: InsertTradingOpportunity[] = [];
    
    // Group by tier for analysis
    const tierGroups = this.groupByTier(cryptocurrencies);
    
    for (const [tier, coins] of Object.entries(tierGroups)) {
      const tierOpportunities = await this.analyzeTierOpportunities(tier, coins, cryptocurrencies);
      opportunities.push(...tierOpportunities);
    }
    
    return opportunities.sort((a, b) => parseFloat(b.confidence.toString()) - parseFloat(a.confidence.toString()));
  }

  private groupByTier(cryptocurrencies: Cryptocurrency[]): Record<string, Cryptocurrency[]> {
    return cryptocurrencies.reduce((groups, coin) => {
      if (!groups[coin.tier]) {
        groups[coin.tier] = [];
      }
      groups[coin.tier].push(coin);
      return groups;
    }, {} as Record<string, Cryptocurrency[]>);
  }

  private async analyzeTierOpportunities(
    tier: string,
    tierCoins: Cryptocurrency[],
    allCoins: Cryptocurrency[]
  ): Promise<InsertTradingOpportunity[]> {
    const opportunities: InsertTradingOpportunity[] = [];
    
    // Calculate tier average performance
    const tierAvgChange = this.calculateTierAverage(tierCoins);
    
    for (const coin of tierCoins) {
      const coinChange = parseFloat(coin.priceChangePercentage24h?.toString() || '0');
      const deviation = Math.abs(coinChange - tierAvgChange);
      
      // Only consider significant deviations
      if (deviation > 2) {
        const analysis = await this.analyzeIndividualOpportunity(coin, tierCoins, allCoins);
        
        if (analysis.confidence > 60) { // Only high confidence opportunities
          const opportunity: InsertTradingOpportunity = {
            cryptocurrencyId: coin.id,
            opportunityType: coinChange < tierAvgChange ? 'long' : 'short',
            riskLevel: this.determineRiskLevel(analysis.riskPercentage),
            riskPercentage: analysis.riskPercentage.toString(),
            leverageRecommendation: this.recommendLeverage(analysis.riskPercentage),
            expectedReturn: this.calculateExpectedReturn(deviation, analysis.riskPercentage).toString(),
            confidence: analysis.confidence.toString(),
            analysis: analysis.analysis,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          };
          
          opportunities.push(opportunity);
        }
      }
    }
    
    return opportunities;
  }

  private calculateTierAverage(coins: Cryptocurrency[]): number {
    if (coins.length === 0) return 0;
    
    const sum = coins.reduce((total, coin) => {
      return total + parseFloat(coin.priceChangePercentage24h?.toString() || '0');
    }, 0);
    
    return sum / coins.length;
  }

  private async analyzeIndividualOpportunity(
    coin: Cryptocurrency,
    tierCoins: Cryptocurrency[],
    allCoins: Cryptocurrency[]
  ): Promise<{ confidence: number; riskPercentage: number; analysis: OpportunityAnalysis }> {
    const coinChange = parseFloat(coin.priceChangePercentage24h?.toString() || '0');
    const coinVolume = parseFloat(coin.volume24h?.toString() || '0');
    const coinMarketCap = parseFloat(coin.marketCap?.toString() || '0');
    
    // Calculate risk factors
    const volatilityRisk = this.calculateVolatilityRisk(coin, tierCoins);
    const correlationRisk = this.calculateCorrelationRisk(coin, tierCoins);
    const volumeRisk = this.calculateVolumeRisk(coinVolume, coinMarketCap);
    const trendRisk = this.calculateTrendRisk(coin, allCoins);
    
    // Overall risk percentage
    const riskPercentage = (volatilityRisk + correlationRisk + volumeRisk + trendRisk) / 4;
    
    // Calculate confidence based on statistical significance
    const tierAvg = this.calculateTierAverage(tierCoins);
    const deviation = Math.abs(coinChange - tierAvg);
    const statisticalSignificance = this.calculateStatisticalSignificance(deviation, tierCoins);
    
    // Base confidence on deviation and adjust for risk
    let confidence = Math.min(95, (deviation * 10) + (statisticalSignificance * 20));
    confidence = Math.max(0, confidence - (riskPercentage * 0.5));
    
    const analysis: OpportunityAnalysis = {
      volatilityRisk,
      correlationRisk,
      volumeRisk,
      trendRisk,
      statisticalSignificance,
      historicalSuccessRate: this.estimateHistoricalSuccessRate(riskPercentage),
      explanation: this.generateExplanation(coin, tierCoins, deviation, riskPercentage),
      strategy: this.generateStrategy(coin, coinChange, tierAvg, riskPercentage),
      entryPoint: this.generateEntryPoint(coin, coinChange < tierAvg),
      exitPoint: this.generateExitPoint(deviation, riskPercentage),
      stopLoss: this.generateStopLoss(riskPercentage),
    };
    
    return {
      confidence,
      riskPercentage,
      analysis,
    };
  }

  private calculateVolatilityRisk(coin: Cryptocurrency, tierCoins: Cryptocurrency[]): number {
    // Estimate volatility based on tier and market cap
    const tierVolatility = {
      mega: 15,
      large: 25,
      largeMedium: 35,
      smallMedium: 45,
      small: 55,
      micro: 75,
    };
    
    return tierVolatility[coin.tier as keyof typeof tierVolatility] || 50;
  }

  private calculateCorrelationRisk(coin: Cryptocurrency, tierCoins: Cryptocurrency[]): number {
    const coinChange = parseFloat(coin.priceChangePercentage24h?.toString() || '0');
    const tierAvg = this.calculateTierAverage(tierCoins);
    const deviation = Math.abs(coinChange - tierAvg);
    
    // Higher deviation = higher correlation risk
    return Math.min(100, deviation * 5);
  }

  private calculateVolumeRisk(volume: number, marketCap: number): number {
    if (marketCap === 0) return 100;
    
    const volumeRatio = volume / marketCap;
    
    // Good volume ratio is typically 0.01-0.1 for crypto
    if (volumeRatio < 0.005) return 80; // Low volume = high risk
    if (volumeRatio > 0.5) return 70; // Too high volume = manipulation risk
    
    return Math.max(10, 50 - (volumeRatio * 200)); // Lower risk for good volume
  }

  private calculateTrendRisk(coin: Cryptocurrency, allCoins: Cryptocurrency[]): number {
    const marketAvg = this.calculateTierAverage(allCoins);
    const coinChange = parseFloat(coin.priceChangePercentage24h?.toString() || '0');
    
    // Risk increases when going against market trend
    const trendAlignment = Math.abs(coinChange - marketAvg);
    return Math.min(100, trendAlignment * 3);
  }

  private calculateStatisticalSignificance(deviation: number, tierCoins: Cryptocurrency[]): number {
    // Simplified statistical significance based on deviation and sample size
    const sampleSize = tierCoins.length;
    const significance = (deviation / 10) * Math.sqrt(sampleSize);
    
    return Math.min(5, significance); // Cap at 5 sigma
  }

  private estimateHistoricalSuccessRate(riskPercentage: number): number {
    // Inverse relationship between risk and success rate
    return Math.max(30, 95 - (riskPercentage * 0.8));
  }

  private determineRiskLevel(riskPercentage: number): string {
    if (riskPercentage <= 30) return 'low';
    if (riskPercentage <= 60) return 'medium';
    return 'high';
  }

  private recommendLeverage(riskPercentage: number): string {
    if (riskPercentage <= 20) return '8-10x';
    if (riskPercentage <= 35) return '5-7x';
    if (riskPercentage <= 50) return '3-5x';
    return '2-3x';
  }

  private calculateExpectedReturn(deviation: number, riskPercentage: number): number {
    // Expected return based on deviation, adjusted for risk
    const baseReturn = deviation * 0.6; // Expect 60% of deviation to be recovered
    const riskAdjustment = (100 - riskPercentage) / 100;
    
    return baseReturn * riskAdjustment;
  }

  private generateExplanation(
    coin: Cryptocurrency,
    tierCoins: Cryptocurrency[],
    deviation: number,
    riskPercentage: number
  ): string {
    const tierAvg = this.calculateTierAverage(tierCoins);
    const coinChange = parseFloat(coin.priceChangePercentage24h?.toString() || '0');
    const isLagging = coinChange < tierAvg;
    
    return `${coin.symbol} is ${isLagging ? 'lagging' : 'outperforming'} its ${coin.tier} tier average by ${deviation.toFixed(1)}%. ` +
           `This represents a ${deviation > 5 ? 'significant' : 'moderate'} deviation from expected correlation patterns. ` +
           `Risk assessment indicates ${riskPercentage.toFixed(1)}% overall risk based on volatility, volume, and trend analysis.`;
  }

  private generateStrategy(
    coin: Cryptocurrency,
    coinChange: number,
    tierAvg: number,
    riskPercentage: number
  ): string {
    const isLong = coinChange < tierAvg;
    const leverage = this.recommendLeverage(riskPercentage);
    
    return `${isLong ? 'Long' : 'Short'} position with ${leverage} leverage. ` +
           `Position based on mean reversion expectation within ${coin.tier} tier correlation patterns. ` +
           `Entry should be executed during current deviation period with tight risk management.`;
  }

  private generateEntryPoint(coin: Cryptocurrency, isLong: boolean): string {
    const currentPrice = parseFloat(coin.currentPrice?.toString() || '0');
    const entryAdjustment = isLong ? 0.98 : 1.02; // Slightly better than current price
    
    return `$${(currentPrice * entryAdjustment).toFixed(6)} (${isLong ? 'on dip' : 'on bounce'})`;
  }

  private generateExitPoint(deviation: number, riskPercentage: number): string {
    const expectedRecovery = deviation * 0.6 * ((100 - riskPercentage) / 100);
    return `${expectedRecovery.toFixed(1)}% ${expectedRecovery > 0 ? 'profit' : 'loss'} target`;
  }

  private generateStopLoss(riskPercentage: number): string {
    const stopLoss = Math.max(3, riskPercentage * 0.15);
    return `${stopLoss.toFixed(1)}% stop loss`;
  }
}
