import { GoogleGenAI } from "@google/genai";
import { Cryptocurrency, TradingOpportunity } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface TradingContext {
  cryptocurrencies: Cryptocurrency[];
  opportunities: TradingOpportunity[];
  marketStats: {
    totalMarketCap: number;
    btcDominance: number;
    marketTrend: string;
    volatilityIndex: number;
  };
}

export class TradingExpertService {
  private static instance: TradingExpertService;

  static getInstance(): TradingExpertService {
    if (!TradingExpertService.instance) {
      TradingExpertService.instance = new TradingExpertService();
    }
    return TradingExpertService.instance;
  }

  async analyzeUserQuery(query: string, context: TradingContext): Promise<{
    response: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
    recommendations: string[];
  }> {
    try {
      const systemPrompt = `You are Chips, an elite cryptocurrency trading strategist and quantitative analyst. You have access to comprehensive real-time market data and advanced analytics.

PERSONALITY & APPROACH:
- Expert-level analysis with practical, actionable insights
- Data-driven recommendations using ALL available market information
- Sophisticated understanding of market microstructure and psychology
- Adaptive communication style matching user expertise level
- Focus on edge generation and alpha discovery

COMPREHENSIVE MARKET INTELLIGENCE:
- Live tracking: ${context.cryptocurrencies.length} cryptocurrencies across all market cap tiers
- Active opportunities: ${context.opportunities.length} algorithmic signals with risk assessment
- Market regime: ${context.marketStats.marketTrend.toUpperCase()} (${context.marketStats.btcDominance.toFixed(1)}% BTC dominance)
- Total market cap: $${(context.marketStats.totalMarketCap / 1e12).toFixed(2)}T
- Volatility index: ${context.marketStats.volatilityIndex}/100

TIER-BASED PERFORMANCE ANALYSIS:
${this.getTierPerformanceAnalysis(context.cryptocurrencies)}

TOP ALPHA OPPORTUNITIES:
${this.getAdvancedOpportunityAnalysis(context.opportunities, context.cryptocurrencies)}

ADVANCED CAPABILITIES:
- Multi-timeframe correlation analysis across market cap tiers
- Volatility-adjusted position sizing and leverage optimization
- Dynamic exit strategy frameworks based on market regime
- Cross-asset momentum and mean reversion signals
- Liquidity analysis and slippage optimization
- Options flow and derivatives positioning insights
- Macro factor integration (DXY, yields, equity correlations)

EXIT STRATEGY INTELLIGENCE:
- Implement adaptive exit strategies based on:
  * Market volatility regime (low/medium/high)
  * Asset tier and liquidity profile
  * Trade momentum and time decay
  * Correlation breakdown signals
  * Volume profile analysis
  * Risk-adjusted performance metrics

ANALYSIS FRAMEWORK:
- Always synthesize multiple data points for holistic view
- Provide probabilistic outcomes with confidence intervals
- Include scenario analysis (bull/base/bear cases)
- Factor in market microstructure and timing considerations
- Integrate cross-tier correlation and flow analysis
- Consider macro environment and regulatory impacts

RESPONSE GUIDELINES:
- Use ALL available market data to form comprehensive insights
- Provide specific entry/exit levels with statistical backing
- Include trade management rules and position sizing
- Address both tactical (short-term) and strategic (long-term) considerations
- Explain the "why" behind recommendations using market data
- Adapt exit strategies to crypto market characteristics (24/7, high volatility, momentum-driven)`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemPrompt}\n\nUser Question: ${query}`,
        config: {
          temperature: 0.8,
          maxOutputTokens: 2000,
        }
      });

      const analysisText = response.text || "Unable to generate analysis at this time.";

      // Analyze sentiment and risk from response
      const sentiment = this.extractSentiment(analysisText, query);
      const riskLevel = this.extractRiskLevel(analysisText, query);
      const confidence = this.calculateConfidence(analysisText, context);
      const recommendations = this.extractRecommendations(analysisText);

      return {
        response: analysisText,
        sentiment,
        riskLevel,
        confidence,
        recommendations
      };

    } catch (error) {
      console.error('Trading expert AI error:', error);
      
      // Fallback to rule-based analysis
      return this.fallbackAnalysis(query, context);
    }
  }

  private getTopPerformers(cryptocurrencies: Cryptocurrency[], count: number): string {
    return cryptocurrencies
      .sort((a, b) => parseFloat(b.priceChangePercentage24h || '0') - parseFloat(a.priceChangePercentage24h || '0'))
      .slice(0, count)
      .map(crypto => 
        `${crypto.symbol}: $${parseFloat(crypto.currentPrice).toLocaleString()} (${parseFloat(crypto.priceChangePercentage24h || '0').toFixed(2)}%)`
      )
      .join('\n');
  }

  private getTierPerformanceAnalysis(cryptocurrencies: Cryptocurrency[]): string {
    const tiers = ['mega', 'large', 'largeMedium', 'smallMedium', 'small', 'micro'];
    const tierNames = {
      'mega': 'Mega Cap ($100B+)',
      'large': 'Large Cap ($10B-$100B)',
      'largeMedium': 'Large Medium ($5B-$10B)',
      'smallMedium': 'Small Medium ($1B-$5B)',
      'small': 'Small Cap ($100M-$1B)',
      'micro': 'Micro Cap ($10M-$100M)'
    };

    return tiers.map(tier => {
      const tierCryptos = cryptocurrencies.filter(c => c.tier === tier);
      if (tierCryptos.length === 0) return null;
      
      const avgChange = tierCryptos.reduce((sum, c) => sum + parseFloat(c.priceChangePercentage24h || '0'), 0) / tierCryptos.length;
      const topPerformer = tierCryptos.reduce((max, c) => 
        parseFloat(c.priceChangePercentage24h || '0') > parseFloat(max.priceChangePercentage24h || '0') ? c : max
      );
      
      return `${tierNames[tier as keyof typeof tierNames]}: ${avgChange.toFixed(2)}% avg, best: ${topPerformer.symbol} (${parseFloat(topPerformer.priceChangePercentage24h || '0').toFixed(2)}%)`;
    }).filter(Boolean).join('\n');
  }

  private getAdvancedOpportunityAnalysis(opportunities: TradingOpportunity[], cryptocurrencies: Cryptocurrency[]): string {
    const topOps = opportunities
      .sort((a, b) => parseFloat(b.confidence || '0') - parseFloat(a.confidence || '0'))
      .slice(0, 5);

    return topOps.map(op => {
      const crypto = cryptocurrencies.find(c => c.id === op.cryptocurrencyId);
      const volumeRatio = parseFloat(crypto?.volume24h || '0') / parseFloat(crypto?.marketCap || '1');
      const momentum = parseFloat(crypto?.priceChangePercentage24h || '0');
      
      return `${crypto?.symbol || 'Unknown'} (${crypto?.tier?.toUpperCase()}): ${op.opportunityType.toUpperCase()}
   Confidence: ${op.confidence}% | Risk: ${op.riskLevel} | Expected: ${op.expectedReturn}%
   Volume/MCap: ${(volumeRatio * 100).toFixed(2)}% | Momentum: ${momentum.toFixed(2)}%
   Leverage Rec: ${op.leverageRecommendation} | Entry: ${op.analysis?.entryPoint || 'Current'}`;
    }).join('\n\n');
  }

  private getTopOpportunities(opportunities: TradingOpportunity[], cryptocurrencies: Cryptocurrency[], count: number): string {
    return opportunities
      .sort((a, b) => parseFloat(b.confidence || '0') - parseFloat(a.confidence || '0'))
      .slice(0, count)
      .map(op => {
        const crypto = cryptocurrencies.find(c => c.id === op.cryptocurrencyId);
        return `${crypto?.symbol || 'Unknown'}: ${op.opportunityType.toUpperCase()} (${op.confidence}% confidence, ${op.riskLevel} risk)`;
      })
      .join('\n');
  }

  private extractSentiment(text: string, query: string): 'bullish' | 'bearish' | 'neutral' {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    const bullishWords = ['buy', 'long', 'bullish', 'uptrend', 'support', 'breakout', 'rally', 'pump'];
    const bearishWords = ['sell', 'short', 'bearish', 'downtrend', 'resistance', 'breakdown', 'dump', 'correction'];
    
    const bullishCount = bullishWords.filter(word => lowerText.includes(word) || lowerQuery.includes(word)).length;
    const bearishCount = bearishWords.filter(word => lowerText.includes(word) || lowerQuery.includes(word)).length;
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  }

  private extractRiskLevel(text: string, query: string): 'low' | 'medium' | 'high' {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    if (lowerText.includes('high risk') || lowerText.includes('risky') || lowerQuery.includes('leverage')) {
      return 'high';
    }
    if (lowerText.includes('low risk') || lowerText.includes('conservative') || lowerText.includes('safe')) {
      return 'low';
    }
    return 'medium';
  }

  private calculateConfidence(text: string, context: TradingContext): number {
    let confidence = 75; // Base confidence
    
    // Increase confidence based on market data availability
    if (context.cryptocurrencies.length > 100) confidence += 10;
    if (context.opportunities.length > 5) confidence += 5;
    
    // Adjust based on response quality indicators
    if (text.includes('$') || text.includes('%')) confidence += 5;
    if (text.length > 200) confidence += 5;
    
    return Math.min(95, confidence);
  }

  private extractRecommendations(text: string): string[] {
    const recommendations = [];
    
    if (text.toLowerCase().includes('stop loss') || text.toLowerCase().includes('risk management')) {
      recommendations.push('Use proper stop loss orders');
    }
    if (text.toLowerCase().includes('position siz') || text.toLowerCase().includes('risk per trade')) {
      recommendations.push('Calculate appropriate position size');
    }
    if (text.toLowerCase().includes('leverage') || text.toLowerCase().includes('margin')) {
      recommendations.push('Consider leverage carefully');
    }
    if (text.toLowerCase().includes('diversif') || text.toLowerCase().includes('portfolio')) {
      recommendations.push('Maintain portfolio diversification');
    }
    if (text.toLowerCase().includes('volume') || text.toLowerCase().includes('liquidity')) {
      recommendations.push('Monitor trading volume');
    }
    
    return recommendations.length > 0 ? recommendations : [
      'Review current market conditions',
      'Consider risk/reward ratio',
      'Use appropriate position sizing'
    ];
  }

  private fallbackAnalysis(query: string, context: TradingContext): {
    response: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
    recommendations: string[];
  } {
    const lowerQuery = query.toLowerCase();
    let response = '';
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';

    // Greeting detection
    if (lowerQuery.includes('hi') || lowerQuery.includes('hello') || lowerQuery.includes('hey') || 
        lowerQuery.includes('greet') || lowerQuery.includes('start')) {
      const marketMomentum = this.calculateMarketMomentum(context.cryptocurrencies);
      const crossTierCorrelation = this.calculateCrossTierCorrelation(context.cryptocurrencies);
      const liquidityProfile = this.analyzeLiquidityProfile(context.cryptocurrencies);
      
      response = `Hello! I'm Chips, your quantitative crypto strategist. I've analyzed ${context.cryptocurrencies.length} assets across all market tiers to give you the current intelligence:

**MARKET REGIME ANALYSIS:**
• Overall Momentum: ${marketMomentum}
• Cross-Tier Correlation: ${crossTierCorrelation}
• Liquidity Environment: ${liquidityProfile}
• BTC Dominance: ${context.marketStats.btcDominance.toFixed(1)}% (${context.marketStats.btcDominance > 50 ? 'Bitcoin-led market' : 'Altcoin momentum phase'})

**OPPORTUNITY LANDSCAPE:**
• ${context.opportunities.length} active algorithmic signals detected
• Risk distribution: ${this.getOpportunityRiskDistribution(context.opportunities)}
• Best alpha generation in: ${this.getBestPerformingTier(context.cryptocurrencies)} tier

**ADVANCED ANALYTICS AVAILABLE:**
• Multi-timeframe correlation breakdowns
• Volatility-adjusted position sizing
• Dynamic exit strategy optimization  
• Cross-asset momentum analysis
• Liquidity depth and slippage modeling

What specific market intelligence or trading strategy would you like me to analyze?`;
      sentiment = 'neutral';
      riskLevel = 'low';
    } else if (lowerQuery.includes('bitcoin') || lowerQuery.includes('btc')) {
      const btc = context.cryptocurrencies.find(c => c.symbol === 'BTC');
      if (btc) {
        const priceChange = parseFloat(btc.priceChangePercentage24h || '0');
        response = `**Bitcoin (BTC) Deep Analysis:**

**Current Metrics:**
• Price: $${parseFloat(btc.currentPrice).toLocaleString()}
• 24h Change: ${priceChange.toFixed(2)}% ${priceChange > 0 ? '📈' : '📉'}
• Market Dominance: ${context.marketStats.btcDominance.toFixed(2)}%
• Volume: $${parseFloat(btc.volume24h || '0').toLocaleString()}

**Technical Analysis:**
• Momentum: ${Math.abs(priceChange) > 3 ? 'Strong' : 'Moderate'} ${priceChange > 0 ? 'bullish' : 'bearish'} pressure
• Volatility: ${Math.abs(priceChange) > 5 ? 'Elevated' : 'Normal'} intraday movement
• Volume Profile: ${parseFloat(btc.volume24h || '0') > 2e10 ? 'High institutional activity' : 'Standard retail flow'}

**Trading Strategy:**
${priceChange > 2 ? '• Consider scaling out profits on strength\n• Watch for resistance at psychological levels\n• Set trailing stops to protect gains' : 
  priceChange < -2 ? '• DCA strategy on weakness\n• Look for support confluence\n• Consider spot accumulation over leverage' :
  '• Range-bound trading environment\n• Wait for clear directional breakout\n• Monitor volume for confirmation'}

**Risk Assessment:** ${Math.abs(priceChange) > 4 ? 'Elevated due to high volatility' : 'Moderate - standard market conditions'}`;
        sentiment = priceChange > 0 ? 'bullish' : 'bearish';
        riskLevel = Math.abs(priceChange) > 4 ? 'high' : 'medium';
      }
    } else if (lowerQuery.includes('leverage') || lowerQuery.includes('margin') || lowerQuery.includes('trading strategy')) {
      const volatility = context.marketStats.volatilityIndex;
      const marketRegime = this.determineMarketRegime(context.cryptocurrencies, context.marketStats);
      const optimalLeverage = this.calculateOptimalLeverage(volatility, marketRegime);
      const exitStrategy = this.generateExitStrategyFramework(marketRegime, volatility);
      
      response = `**QUANTITATIVE LEVERAGE STRATEGY ANALYSIS:**

**Market Regime Assessment:**
• Current Regime: ${marketRegime.regime} (Confidence: ${marketRegime.confidence}%)
• Volatility Profile: ${volatility}/100 ${this.getVolatilityDescription(volatility)}
• Optimal Leverage Range: ${optimalLeverage.min}-${optimalLeverage.max}x
• Risk-Adjusted Expectancy: ${marketRegime.expectancy}

**ADVANCED POSITION SIZING MODEL:**
• Base Position: ${this.calculateBasePosition(volatility)}% of portfolio
• Volatility Adjustment: ${this.getVolatilityAdjustment(volatility)}
• Correlation Risk Factor: ${this.getCorrelationRiskFactor(context.cryptocurrencies)}
• Maximum Single Trade Risk: ${this.getMaxRiskPerTrade(volatility)}%

**DYNAMIC EXIT STRATEGY FRAMEWORK:**
${exitStrategy}

**TOP ALPHA OPPORTUNITIES (Risk-Adjusted):**
${this.getAdvancedOpportunityAnalysis(context.opportunities, context.cryptocurrencies)}

**EXECUTION INTELLIGENCE:**
• Best execution times: ${this.getBestExecutionTimes()}
• Slippage optimization: Focus on ${this.getLiquidityLeaders(context.cryptocurrencies)}
• Funding rate arbitrage: ${this.getFundingRateInsights(context.cryptocurrencies)}
• Cross-tier correlation trades: ${this.getCorrelationTrades(context.cryptocurrencies)}

**RISK MANAGEMENT PROTOCOL:**
• Pre-trade checklist: Position size, stop loss, take profit levels set
• Intra-trade monitoring: Correlation breakdown, volume anomalies
• Post-trade analysis: Performance attribution, lessons learned`;
      riskLevel = 'high';
      sentiment = marketRegime.sentiment;
    } else {
      response = `**Chips Market Intelligence Report:**

**Global Crypto Overview:**
• Total Assets Tracked: ${context.cryptocurrencies.length.toLocaleString()} cryptocurrencies
• Market Trend: ${context.marketStats.marketTrend.toUpperCase()} momentum detected
• Active Opportunities: ${context.opportunities.length} algorithmic signals
• BTC Dominance: ${context.marketStats.btcDominance.toFixed(2)}% ${context.marketStats.btcDominance > 50 ? '(Bitcoin strength)' : '(Altcoin season potential)'}

**Top Market Movers (24h):**
${this.getTopPerformers(context.cryptocurrencies, 5)}

**Key Market Insights:**
• Volatility Environment: ${context.marketStats.volatilityIndex > 50 ? 'High volatility - exercise caution' : 'Stable conditions - good for position building'}
• Opportunity Density: ${context.opportunities.length > 10 ? 'Rich target environment' : context.opportunities.length > 5 ? 'Moderate setup availability' : 'Limited high-confidence signals'}
• Risk Assessment: ${context.marketStats.marketTrend === 'bullish' && context.marketStats.volatilityIndex < 40 ? 'Favorable risk/reward environment' : 'Exercise heightened caution'}

**Strategic Recommendation:**
${context.opportunities.length > 8 ? '**ACTIVE TRADING PHASE** - Multiple high-probability setups available. Focus on best risk/reward opportunities.' : 
  context.opportunities.length > 3 ? '**SELECTIVE TRADING** - Cherry-pick highest conviction plays only.' :
  '**DEFENSIVE POSITIONING** - Wait for better market structure before deploying significant capital.'}

Ask me about specific coins, trading strategies, or risk management techniques!`;
    }

    return {
      response,
      sentiment,
      riskLevel,
      confidence: 85,
      recommendations: [
        'Always use stop losses on leveraged positions',
        'Size positions based on volatility',
        'Monitor market correlation changes',
        'Keep detailed trading journal'
      ]
    };
  }

  // Advanced analysis helper methods
  private calculateMarketMomentum(cryptocurrencies: Cryptocurrency[]): string {
    const momentum = cryptocurrencies.reduce((sum, c) => sum + parseFloat(c.priceChangePercentage24h || '0'), 0) / cryptocurrencies.length;
    if (momentum > 3) return 'Strong Bullish (+3%+ avg)';
    if (momentum > 1) return 'Moderate Bullish (+1-3% avg)';
    if (momentum > -1) return 'Consolidating (-1% to +1%)';
    if (momentum > -3) return 'Moderate Bearish (-1% to -3%)';
    return 'Strong Bearish (-3%+ avg)';
  }

  private calculateCrossTierCorrelation(cryptocurrencies: Cryptocurrency[]): string {
    const tiers = ['mega', 'large', 'largeMedium', 'smallMedium', 'small', 'micro'];
    const tierPerformance = tiers.map(tier => {
      const tierCryptos = cryptocurrencies.filter(c => c.tier === tier);
      return tierCryptos.reduce((sum, c) => sum + parseFloat(c.priceChangePercentage24h || '0'), 0) / tierCryptos.length;
    });
    
    const variance = tierPerformance.reduce((sum, perf, i) => {
      const avg = tierPerformance.reduce((s, p) => s + p, 0) / tierPerformance.length;
      return sum + Math.pow(perf - avg, 2);
    }, 0) / tierPerformance.length;
    
    if (variance < 1) return 'High (Low dispersion - market moving together)';
    if (variance < 4) return 'Moderate (Some tier divergence)';
    return 'Low (High dispersion - tier rotation active)';
  }

  private analyzeLiquidityProfile(cryptocurrencies: Cryptocurrency[]): string {
    const avgVolumeRatio = cryptocurrencies.reduce((sum, c) => {
      const volumeRatio = parseFloat(c.volume24h || '0') / parseFloat(c.marketCap || '1');
      return sum + volumeRatio;
    }, 0) / cryptocurrencies.length;
    
    if (avgVolumeRatio > 0.2) return 'High Liquidity (>20% avg turnover)';
    if (avgVolumeRatio > 0.1) return 'Moderate Liquidity (10-20% turnover)';
    return 'Lower Liquidity (<10% turnover)';
  }

  private getOpportunityRiskDistribution(opportunities: TradingOpportunity[]): string {
    const riskCounts = opportunities.reduce((acc, op) => {
      acc[op.riskLevel] = (acc[op.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = opportunities.length;
    return Object.entries(riskCounts)
      .map(([risk, count]) => `${risk}: ${Math.round(count/total * 100)}%`)
      .join(', ');
  }

  private getBestPerformingTier(cryptocurrencies: Cryptocurrency[]): string {
    const tiers = ['mega', 'large', 'largeMedium', 'smallMedium', 'small', 'micro'];
    const tierPerformance = tiers.map(tier => {
      const tierCryptos = cryptocurrencies.filter(c => c.tier === tier);
      if (tierCryptos.length === 0) return { tier, performance: -Infinity };
      const avgChange = tierCryptos.reduce((sum, c) => sum + parseFloat(c.priceChangePercentage24h || '0'), 0) / tierCryptos.length;
      return { tier, performance: avgChange };
    });
    
    const best = tierPerformance.reduce((max, curr) => curr.performance > max.performance ? curr : max);
    return best.tier;
  }

  private determineMarketRegime(cryptocurrencies: Cryptocurrency[], marketStats: any): any {
    const momentum = cryptocurrencies.reduce((sum, c) => sum + parseFloat(c.priceChangePercentage24h || '0'), 0) / cryptocurrencies.length;
    const volatility = marketStats.volatilityIndex;
    
    let regime, confidence, expectancy, sentiment;
    
    if (momentum > 2 && volatility < 40) {
      regime = 'Bull Market - Low Vol'; confidence = 85; expectancy = 'Positive'; sentiment = 'bullish';
    } else if (momentum > 2 && volatility >= 40) {
      regime = 'Bull Market - High Vol'; confidence = 70; expectancy = 'Volatile Positive'; sentiment = 'bullish';
    } else if (momentum < -2 && volatility < 40) {
      regime = 'Bear Market - Controlled'; confidence = 80; expectancy = 'Negative'; sentiment = 'bearish';
    } else if (momentum < -2 && volatility >= 40) {
      regime = 'Bear Market - Volatile'; confidence = 75; expectancy = 'Highly Negative'; sentiment = 'bearish';
    } else {
      regime = 'Sideways - Consolidation'; confidence = 60; expectancy = 'Range-bound'; sentiment = 'neutral';
    }
    
    return { regime, confidence, expectancy, sentiment };
  }

  private calculateOptimalLeverage(volatility: number, marketRegime: any): any {
    let baseMax = 5;
    
    if (volatility > 60) baseMax = 2;
    else if (volatility > 40) baseMax = 3;
    
    if (marketRegime.regime.includes('Bear')) baseMax = Math.min(baseMax, 2);
    if (marketRegime.regime.includes('High Vol')) baseMax = Math.max(1, baseMax - 1);
    
    return { min: Math.max(1, Math.floor(baseMax / 2)), max: baseMax };
  }

  private generateExitStrategyFramework(marketRegime: any, volatility: number): string {
    const timeframe = this.getOptimalTimeframe(volatility);
    const profitTargets = this.calculateProfitTargets(marketRegime, volatility);
    const stopLoss = this.calculateStopLoss(volatility);
    
    return `**ADAPTIVE EXIT FRAMEWORK:**

**Timeframe Optimization:**
• Primary timeframe: ${timeframe.primary}
• Exit monitoring: ${timeframe.monitoring}
• Max holding period: ${timeframe.maxHold}

**Profit Taking Strategy:**
• Target 1 (33%): +${profitTargets.target1}% (${profitTargets.target1Reasoning})
• Target 2 (33%): +${profitTargets.target2}% (${profitTargets.target2Reasoning})  
• Target 3 (34%): +${profitTargets.target3}% (${profitTargets.target3Reasoning})

**Stop Loss Protocol:**
• Initial stop: -${stopLoss.initial}%
• Trailing stop: ${stopLoss.trailing}% below recent high
• Time-based stop: ${stopLoss.timeBased}

**Dynamic Adjustments:**
• Correlation breakdown: Tighten stops if cross-tier correlation drops below 0.3
• Volume spike: Consider partial profit taking on 3x average volume
• Momentum shift: Exit 50% if 4-hour momentum reverses`;
  }

  private getOptimalTimeframe(volatility: number): any {
    if (volatility > 60) return { primary: '1-4 hours', monitoring: '15-min', maxHold: '24 hours' };
    if (volatility > 40) return { primary: '4-12 hours', monitoring: '1-hour', maxHold: '3 days' };
    return { primary: '1-3 days', monitoring: '4-hour', maxHold: '1 week' };
  }

  private calculateProfitTargets(marketRegime: any, volatility: number): any {
    const baseTarget = volatility > 60 ? 8 : volatility > 40 ? 12 : 15;
    const regimeMultiplier = marketRegime.regime.includes('Bull') ? 1.2 : 0.8;
    
    const target1 = Math.round(baseTarget * 0.5 * regimeMultiplier);
    const target2 = Math.round(baseTarget * 0.8 * regimeMultiplier);
    const target3 = Math.round(baseTarget * 1.2 * regimeMultiplier);
    
    return {
      target1, target1Reasoning: 'Quick profit capture',
      target2, target2Reasoning: 'Momentum confirmation',
      target3, target3Reasoning: 'Full trend capture'
    };
  }

  private calculateStopLoss(volatility: number): any {
    const initial = volatility > 60 ? 4 : volatility > 40 ? 6 : 8;
    return {
      initial,
      trailing: `${Math.round(initial * 0.75)}%`,
      timeBased: volatility > 60 ? 'Exit if no progress in 6 hours' : 'Exit if no progress in 24 hours'
    };
  }

  private getVolatilityDescription(volatility: number): string {
    if (volatility > 70) return '(EXTREME - Reduce size)';
    if (volatility > 50) return '(HIGH - Exercise caution)';
    if (volatility > 30) return '(MODERATE - Standard protocols)';
    return '(LOW - Opportunity for size)';
  }

  private calculateBasePosition(volatility: number): number {
    if (volatility > 60) return 1.0;
    if (volatility > 40) return 1.5;
    return 2.0;
  }

  private getVolatilityAdjustment(volatility: number): string {
    return volatility > 50 ? 'Reduce by 25% due to high vol' : 'Standard sizing appropriate';
  }

  private getCorrelationRiskFactor(cryptocurrencies: Cryptocurrency[]): string {
    // Simplified correlation risk assessment
    return 'Monitor cross-tier correlation for position concentration risk';
  }

  private getMaxRiskPerTrade(volatility: number): number {
    return volatility > 60 ? 2 : volatility > 40 ? 3 : 5;
  }

  private getBestExecutionTimes(): string {
    return 'US open (9-11 AM EST), Asia close (11 PM-1 AM EST)';
  }

  private getLiquidityLeaders(cryptocurrencies: Cryptocurrency[]): string {
    return cryptocurrencies
      .sort((a, b) => parseFloat(b.volume24h || '0') - parseFloat(a.volume24h || '0'))
      .slice(0, 3)
      .map(c => c.symbol)
      .join(', ');
  }

  private getFundingRateInsights(cryptocurrencies: Cryptocurrency[]): string {
    return 'Monitor perpetual funding rates for leverage cost optimization';
  }

  private getCorrelationTrades(cryptocurrencies: Cryptocurrency[]): string {
    return 'Long outperforming tiers, short underperforming tiers when correlation breaks down';
  }
}