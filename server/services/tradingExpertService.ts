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
      const systemPrompt = `You are a world-class cryptocurrency trading expert and financial analyst with deep expertise in:

EXPERTISE AREAS:
- Advanced technical analysis and chart patterns
- Leveraged trading strategies and risk management
- Market microstructure and order flow analysis
- DeFi protocols and yield farming strategies
- Options and derivatives trading
- Portfolio optimization and position sizing
- Market psychology and sentiment analysis
- Regulatory impacts on crypto markets

CURRENT MARKET DATA:
- Total tracked cryptocurrencies: ${context.cryptocurrencies.length}
- Active trading opportunities: ${context.opportunities.length}
- Market trend: ${context.marketStats.marketTrend}
- BTC dominance: ${context.marketStats.btcDominance.toFixed(2)}%
- Total market cap: $${(context.marketStats.totalMarketCap / 1e12).toFixed(2)}T

TOP PERFORMERS (24h):
${this.getTopPerformers(context.cryptocurrencies, 3)}

CURRENT OPPORTUNITIES:
${this.getTopOpportunities(context.opportunities, context.cryptocurrencies, 3)}

ANALYSIS GUIDELINES:
1. Provide specific, actionable trading advice
2. Include risk management recommendations
3. Reference current market data when relevant
4. Explain technical concepts clearly
5. Suggest specific entry/exit points when appropriate
6. Consider leverage implications and position sizing
7. Factor in market correlation and volatility

RESPONSE FORMAT:
- Be concise but comprehensive
- Use bullet points for key insights
- Include specific price levels and percentages
- Mention risk/reward ratios
- Reference current market conditions

Answer the user's question with expert-level analysis:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "system", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: query }] }
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
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

    if (lowerQuery.includes('bitcoin') || lowerQuery.includes('btc')) {
      const btc = context.cryptocurrencies.find(c => c.symbol === 'BTC');
      if (btc) {
        response = `Bitcoin Analysis:\n\n• Current Price: $${parseFloat(btc.currentPrice).toLocaleString()}\n• 24h Change: ${parseFloat(btc.priceChangePercentage24h || '0').toFixed(2)}%\n• Market Dominance: ${context.marketStats.btcDominance.toFixed(2)}%\n\nTechnical Outlook:\n• ${parseFloat(btc.priceChangePercentage24h || '0') > 0 ? 'Bullish momentum' : 'Bearish pressure'}\n• Volume: ${parseFloat(btc.volume24h || '0') > 1e10 ? 'High institutional activity' : 'Moderate trading volume'}\n• Recommendation: ${parseFloat(btc.priceChangePercentage24h || '0') > 2 ? 'Consider profit taking' : 'DCA strategy recommended'}`;
        sentiment = parseFloat(btc.priceChangePercentage24h || '0') > 0 ? 'bullish' : 'bearish';
      }
    } else if (lowerQuery.includes('leverage') || lowerQuery.includes('margin')) {
      response = `Leverage Trading Analysis:\n\n• Current Market Volatility: ${context.marketStats.volatilityIndex > 50 ? 'High' : 'Moderate'}\n• Recommended Max Leverage: ${context.marketStats.volatilityIndex > 50 ? '2-3x' : '3-5x'}\n• Active Opportunities: ${context.opportunities.length}\n\nRisk Management:\n• Position Size: 1-3% of portfolio per trade\n• Stop Loss: Mandatory for all leveraged positions\n• Take Profit: Set at 2:1 risk/reward minimum\n\nTop Opportunities:\n${this.getTopOpportunities(context.opportunities, context.cryptocurrencies, 3)}`;
      riskLevel = 'high';
    } else {
      response = `Market Overview:\n\n• Total Cryptocurrencies: ${context.cryptocurrencies.length}\n• Market Trend: ${context.marketStats.marketTrend}\n• Active Opportunities: ${context.opportunities.length}\n• BTC Dominance: ${context.marketStats.btcDominance.toFixed(2)}%\n\nKey Insights:\n• Market sentiment appears ${context.marketStats.marketTrend.toLowerCase()}\n• ${context.opportunities.length > 5 ? 'Multiple trading opportunities available' : 'Limited opportunities in current market'}\n• Volatility: ${context.marketStats.volatilityIndex > 50 ? 'Elevated' : 'Normal'}\n\nRecommendation: ${context.opportunities.length > 5 ? 'Selective trading approach' : 'Wait for better setups'}`;
    }

    return {
      response,
      sentiment,
      riskLevel,
      confidence: 70,
      recommendations: [
        'Monitor market conditions closely',
        'Use appropriate risk management',
        'Consider current volatility levels'
      ]
    };
  }
}