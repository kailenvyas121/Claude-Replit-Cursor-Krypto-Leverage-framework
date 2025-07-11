import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, TrendingUp, AlertTriangle, Target, Activity } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  analysis?: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
    recommendations?: string[];
  };
}

interface TradingExpertChatProps {
  marketData: any;
}

export default function TradingExpertChat({ marketData }: TradingExpertChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMarketQuestion = (question: string) => {
    const lowerQ = question.toLowerCase();
    
    // Analyze sentiment and risk based on keywords
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    let confidence = 70;
    
    if (lowerQ.includes('buy') || lowerQ.includes('long') || lowerQ.includes('bull')) {
      sentiment = 'bullish';
    } else if (lowerQ.includes('sell') || lowerQ.includes('short') || lowerQ.includes('bear')) {
      sentiment = 'bearish';
    }
    
    if (lowerQ.includes('leverage') || lowerQ.includes('margin') || lowerQ.includes('risk')) {
      riskLevel = 'high';
      confidence = 85;
    }
    
    return { sentiment, riskLevel, confidence };
  };

  const generateTradingResponse = (question: string): string => {
    const lowerQ = question.toLowerCase();
    const cryptos = marketData?.cryptocurrencies || [];
    const opportunities = marketData?.opportunities || [];
    
    // Analyze question type and provide relevant response
    if (lowerQ.includes('bitcoin') || lowerQ.includes('btc')) {
      const btc = cryptos.find((c: any) => c.symbol === 'BTC');
      if (btc) {
        return `Bitcoin Analysis:\n\nCurrent Price: $${parseFloat(btc.currentPrice).toLocaleString()}\n24h Change: ${parseFloat(btc.priceChangePercentage24h).toFixed(2)}%\nMarket Cap: $${(parseFloat(btc.marketCap) / 1e9).toFixed(1)}B\n\nTechnical Outlook:\n• BTC is in the ${parseFloat(btc.priceChangePercentage24h) > 0 ? 'bullish' : 'bearish'} territory\n• Volume suggests ${parseFloat(btc.volume24h || '0') > 1e9 ? 'strong' : 'moderate'} institutional interest\n• Consider ${parseFloat(btc.priceChangePercentage24h) > 2 ? 'taking profits' : 'DCA strategy'}\n\nRisk Management:\n• Max 2-3x leverage for BTC\n• Stop loss at -5% from entry\n• Take profits at +8-12%`;
      }
    }
    
    if (lowerQ.includes('leverage') || lowerQ.includes('margin')) {
      return `Leverage Trading Strategy:\n\n🎯 Risk Management Rules:\n• Never risk more than 2-3% of portfolio per trade\n• Use stop losses religiously\n• Start with 2x leverage, max 5x for experienced traders\n\n📊 Current High-Probability Setups:\n${opportunities.slice(0, 3).map((op: any, i: number) => 
        `${i + 1}. ${cryptos.find((c: any) => c.id === op.cryptocurrencyId)?.symbol || 'Unknown'} - ${op.opportunityType.toUpperCase()}\n   Risk: ${op.riskLevel} | Confidence: ${op.confidence}%`
      ).join('\n')}\n\n⚠️ Market Conditions:\n• Current market sentiment: ${calculateMarketSentiment(cryptos)}\n• Volatility: ${calculateVolatility(cryptos)}\n• Recommended position size: ${getPositionSizeRec(cryptos)}`;
    }
    
    if (lowerQ.includes('risk') || lowerQ.includes('position size')) {
      return `Risk Assessment & Position Sizing:\n\n📈 Portfolio Analysis:\n• Total tracked assets: ${cryptos.length}\n• Active opportunities: ${opportunities.length}\n• Market cap distribution: Diversified across all tiers\n\n🎯 Position Sizing Formula:\n• Conservative: 1-2% risk per trade\n• Moderate: 2-3% risk per trade\n• Aggressive: 3-5% risk per trade\n\n⚡ Current Risk Factors:\n• Market volatility: ${calculateVolatility(cryptos)}\n• Correlation risk: ${calculateCorrelationRisk(cryptos)}\n• Liquidity risk: Low (focusing on top-tier assets)\n\n💡 Recommendation:\nBased on current market conditions, use ${getPositionSizeRec(cryptos)} position sizing with tight stop losses.`;
    }
    
    if (lowerQ.includes('opportunity') || lowerQ.includes('trade')) {
      const topOps = opportunities.slice(0, 5);
      return `Current Trading Opportunities:\n\n${topOps.map((op: any, i: number) => {
        const crypto = cryptos.find((c: any) => c.id === op.cryptocurrencyId);
        return `${i + 1}. ${crypto?.symbol || 'Unknown'} (${crypto?.name})\n   📊 ${op.opportunityType.toUpperCase()} Setup\n   🎯 Risk: ${op.riskLevel} | Confidence: ${op.confidence}%\n   💰 Expected Return: ${op.expectedReturn}%\n   📈 Leverage: ${op.leverageRecommendation}\n   ⏰ Entry: ${op.analysis?.entryPoint || 'Current levels'}\n`;
      }).join('\n')}\n\n🔍 Analysis Summary:\n• Market showing ${opportunities.length} active opportunities\n• Risk distribution: ${calculateRiskDistribution(opportunities)}\n• Best risk/reward ratio in ${getBestTier(opportunities, cryptos)} tier`;
    }
    
    // Default comprehensive market analysis
    return `Market Analysis Summary:\n\n📊 Current Market State:\n• Total tracked assets: ${cryptos.length}\n• Active opportunities: ${opportunities.length}\n• Market trend: ${calculateMarketSentiment(cryptos)}\n• Volatility index: ${calculateVolatility(cryptos)}\n\n🎯 Top Insights:\n• ${getBestPerformer(cryptos)} is leading with ${getBestPerformance(cryptos)}% gains\n• ${getWorstPerformer(cryptos)} showing weakness at ${getWorstPerformance(cryptos)}%\n• Volume leaders: ${getVolumeLeaders(cryptos)}\n\n💡 Trading Recommendations:\n• Focus on ${getBestTier(opportunities, cryptos)} tier for best risk/reward\n• Consider ${opportunities.length > 5 ? 'selective' : 'opportunistic'} approach\n• Recommended leverage: 2-3x maximum\n\nWhat specific analysis would you like me to dive deeper into?`;
  };

  // Helper functions for market analysis
  const calculateMarketSentiment = (cryptos: any[]): string => {
    const avgChange = cryptos.reduce((sum, c) => sum + parseFloat(c.priceChangePercentage24h || '0'), 0) / cryptos.length;
    if (avgChange > 3) return 'Strongly Bullish';
    if (avgChange > 1) return 'Bullish';
    if (avgChange > -1) return 'Neutral';
    if (avgChange > -3) return 'Bearish';
    return 'Strongly Bearish';
  };

  const calculateVolatility = (cryptos: any[]): string => {
    const changes = cryptos.map(c => Math.abs(parseFloat(c.priceChangePercentage24h || '0')));
    const avgVol = changes.reduce((sum, c) => sum + c, 0) / changes.length;
    if (avgVol > 8) return 'High';
    if (avgVol > 4) return 'Moderate';
    return 'Low';
  };

  const calculateCorrelationRisk = (cryptos: any[]): string => {
    const positiveCount = cryptos.filter(c => parseFloat(c.priceChangePercentage24h || '0') > 0).length;
    const correlation = positiveCount / cryptos.length;
    if (correlation > 0.8 || correlation < 0.2) return 'High';
    if (correlation > 0.6 || correlation < 0.4) return 'Moderate';
    return 'Low';
  };

  const getPositionSizeRec = (cryptos: any[]): string => {
    const volatility = calculateVolatility(cryptos);
    if (volatility === 'High') return 'Conservative (1-2%)';
    if (volatility === 'Moderate') return 'Moderate (2-3%)';
    return 'Standard (3-5%)';
  };

  const getBestPerformer = (cryptos: any[]): string => {
    const best = cryptos.reduce((max, c) => 
      parseFloat(c.priceChangePercentage24h || '0') > parseFloat(max.priceChangePercentage24h || '0') ? c : max
    );
    return best.symbol;
  };

  const getBestPerformance = (cryptos: any[]): string => {
    const best = cryptos.reduce((max, c) => 
      parseFloat(c.priceChangePercentage24h || '0') > parseFloat(max.priceChangePercentage24h || '0') ? c : max
    );
    return parseFloat(best.priceChangePercentage24h || '0').toFixed(2);
  };

  const getWorstPerformer = (cryptos: any[]): string => {
    const worst = cryptos.reduce((min, c) => 
      parseFloat(c.priceChangePercentage24h || '0') < parseFloat(min.priceChangePercentage24h || '0') ? c : min
    );
    return worst.symbol;
  };

  const getWorstPerformance = (cryptos: any[]): string => {
    const worst = cryptos.reduce((min, c) => 
      parseFloat(c.priceChangePercentage24h || '0') < parseFloat(min.priceChangePercentage24h || '0') ? c : min
    );
    return parseFloat(worst.priceChangePercentage24h || '0').toFixed(2);
  };

  const getVolumeLeaders = (cryptos: any[]): string => {
    const top3 = cryptos
      .sort((a, b) => parseFloat(b.volume24h || '0') - parseFloat(a.volume24h || '0'))
      .slice(0, 3)
      .map(c => c.symbol)
      .join(', ');
    return top3;
  };

  const getBestTier = (opportunities: any[], cryptos: any[]): string => {
    const tierCounts = opportunities.reduce((acc, op) => {
      const crypto = cryptos.find(c => c.id === op.cryptocurrencyId);
      if (crypto) {
        acc[crypto.tier] = (acc[crypto.tier] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const bestTier = Object.entries(tierCounts).reduce((max, [tier, count]) => 
      count > max.count ? { tier, count } : max, { tier: 'large', count: 0 }
    );
    
    return bestTier.tier;
  };

  const calculateRiskDistribution = (opportunities: any[]): string => {
    const risks = opportunities.reduce((acc, op) => {
      acc[op.riskLevel] = (acc[op.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = opportunities.length;
    const distribution = Object.entries(risks)
      .map(([risk, count]) => `${risk}: ${Math.round(count/total * 100)}%`)
      .join(', ');
    
    return distribution;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call the AI trading expert API
      const response = await fetch('/api/trading-expert/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      const analysis = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: analysis.response || 'I apologize, but I was unable to process your request.',
        timestamp: new Date(),
        analysis: {
          sentiment: analysis.sentiment || 'neutral',
          riskLevel: analysis.riskLevel || 'medium',
          confidence: analysis.confidence || 70,
          recommendations: analysis.recommendations || ['Review market conditions']
        }
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback to rule-based response
      const analysis = analyzeMarketQuestion(currentMessage);
      const response = generateTradingResponse(currentMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        analysis: {
          ...analysis,
          recommendations: [
            'Consider current market volatility',
            'Use appropriate position sizing',
            'Set stop losses before entering'
          ]
        }
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[700px] bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden">
      {/* Modern Header */}
      <div className="border-b border-slate-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-6 w-6 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-semibold text-white">Chips AI</h3>
              <p className="text-xs text-slate-400">Your Crypto Trading Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-400/30">
              <Activity className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
            <Badge variant="outline" className="text-slate-300 border-slate-600">
              {marketData?.cryptocurrencies?.length || 0} Tokens
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100%-80px)]">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-blue-400 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-medium text-white mb-2">Welcome to Chips AI</h4>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Your advanced cryptocurrency trading assistant. Ask me about market analysis, trading strategies, or specific tokens.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <Badge variant="outline" className="text-xs">Market Analysis</Badge>
                  <Badge variant="outline" className="text-xs">Trading Strategies</Badge>
                  <Badge variant="outline" className="text-xs">Risk Management</Badge>
                  <Badge variant="outline" className="text-xs">Token Research</Badge>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}>
                {message.type === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[75%] ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' 
                    : 'bg-slate-800/80 text-white border border-slate-700/50'
                } rounded-2xl px-4 py-3 shadow-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium opacity-70">
                      {message.type === 'user' ? 'You' : 'Chips'}
                    </span>
                    <span className="text-xs opacity-50">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  
                  {message.analysis && (
                    <div className="mt-4 pt-3 border-t border-slate-600/30">
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant={message.analysis.sentiment === 'bullish' ? 'default' : 
                                 message.analysis.sentiment === 'bearish' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {message.analysis.sentiment}
                        </Badge>
                        <Badge 
                          variant={message.analysis.riskLevel === 'high' ? 'destructive' : 
                                 message.analysis.riskLevel === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {message.analysis.riskLevel} risk
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {message.analysis.confidence}% confidence
                        </Badge>
                      </div>
                      
                      {message.analysis.recommendations && message.analysis.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-400 mb-1">Recommendations:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.analysis.recommendations.slice(0, 3).map((rec, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs opacity-70">
                                {rec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium opacity-70">Chips</span>
                    <span className="text-xs opacity-50">thinking...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-slate-400">Analyzing market data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        {/* Modern Input Area */}
        <div className="border-t border-slate-700/50 bg-slate-800/30 p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                placeholder="Ask Chips about trading strategies, market analysis, or specific cryptocurrencies..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-slate-900/50 border-slate-600 focus:border-blue-500 text-white placeholder-slate-400 rounded-xl h-12 px-4"
                disabled={isTyping}
              />
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 px-6 rounded-xl shadow-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-slate-500">
              Press Enter to send • Powered by Google Gemini AI
            </div>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">Technical Analysis</Badge>
              <Badge variant="outline" className="text-xs">Risk Management</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}