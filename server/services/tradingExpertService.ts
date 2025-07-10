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
      const systemPrompt = `You are Chips, a world-class cryptocurrency trading expert and AI assistant. You have deep expertise in advanced trading strategies, technical analysis, and market psychology.

PERSONALITY:
- Professional but friendly and approachable
- Extremely knowledgeable about crypto markets and trading
- Always provide specific, actionable advice
- Explain complex concepts in simple terms
- Adapt your tone to match the user's question

CURRENT MARKET DATA:
- Total tracked cryptocurrencies: ${context.cryptocurrencies.length}
- Active trading opportunities: ${context.opportunities.length}
- Market trend: ${context.marketStats.marketTrend}
- BTC dominance: ${context.marketStats.btcDominance.toFixed(2)}%
- Total market cap: $${(context.marketStats.totalMarketCap / 1e12).toFixed(2)}T

TOP PERFORMERS (24h):
${this.getTopPerformers(context.cryptocurrencies, 5)}

CURRENT OPPORTUNITIES:
${this.getTopOpportunities(context.opportunities, context.cryptocurrencies, 5)}

EXPERTISE AREAS:
- Advanced technical analysis and chart patterns
- Leveraged trading strategies and risk management
- Market microstructure and order flow analysis
- DeFi protocols and yield farming strategies
- Options and derivatives trading
- Portfolio optimization and position sizing
- Market psychology and sentiment analysis

GUIDELINES:
- If greeted, introduce yourself as Chips, their personal crypto leveraging assistant
- For specific strategies, provide detailed step-by-step advice
- Always include risk management recommendations
- Reference current market data and opportunities when relevant
- Suggest specific entry/exit points with reasoning
- Consider leverage implications and position sizing
- Factor in market correlation and volatility
- Be conversational but professional`;

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
      response = `Hello! I'm Chips, your personal crypto leveraging assistant! 🚀

I'm here to help you navigate the complex world of cryptocurrency trading with expert analysis and real-time market insights.

**What I can help you with:**
• Advanced technical analysis and trading strategies
• Risk management and position sizing
• Leveraged trading opportunities and recommendations  
• Market correlation analysis across ${context.cryptocurrencies.length} tokens
• Real-time market data interpretation

**Current Market Snapshot:**
• Market Trend: ${context.marketStats.marketTrend.toUpperCase()}
• BTC Dominance: ${context.marketStats.btcDominance.toFixed(1)}%
• Active Opportunities: ${context.opportunities.length} high-confidence setups
• Total Market Cap: $${(context.marketStats.totalMarketCap / 1e12).toFixed(2)}T

Feel free to ask me about specific cryptocurrencies, trading strategies, risk management, or current market conditions. I'm here to help you make smarter trading decisions!`;
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
      response = `**Advanced Leveraged Trading Strategy:**

**Market Conditions Assessment:**
• Volatility Index: ${volatility}/100 ${volatility > 60 ? '(HIGH RISK)' : volatility > 40 ? '(MODERATE)' : '(LOW RISK)'}
• Recommended Max Leverage: ${volatility > 60 ? '2-3x' : volatility > 40 ? '3-5x' : '5-10x'}
• Market Regime: ${context.marketStats.marketTrend.toUpperCase()}

**Position Management Framework:**
• **Position Size:** 1-2% of portfolio per trade (never exceed 5%)
• **Risk/Reward:** Minimum 1:2, target 1:3 on high-confidence setups
• **Stop Loss:** Always set BEFORE entering position
• **Take Profit:** Scale out in 3 tranches (33%, 33%, 34%)

**Current High-Confidence Opportunities:**
${this.getTopOpportunities(context.opportunities, context.cryptocurrencies, 3)}

**Advanced Risk Management:**
• Use position sizing calculator based on volatility
• Monitor correlation breakdowns for opportunity
• Set alerts on key support/resistance levels
• Never risk more than 10% of account on single trade

**Leverage Specific Rules:**
• Start small - test with 2x before scaling up
• Monitor funding rates hourly
• Have exit plan before entry
• Use isolated margin to limit exposure`;
      riskLevel = 'high';
      sentiment = context.marketStats.marketTrend === 'bullish' ? 'bullish' : 'neutral';
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
}