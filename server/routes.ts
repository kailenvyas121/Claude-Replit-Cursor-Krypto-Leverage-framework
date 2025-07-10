import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { CryptoService } from "./services/cryptoService";
import { OpportunityService } from "./services/opportunityService";
import { TradingExpertService } from "./services/tradingExpertService";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const cryptoService = CryptoService.getInstance();
  const opportunityService = OpportunityService.getInstance();
  const tradingExpertService = TradingExpertService.getInstance();

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    // Send initial data
    sendMarketUpdate(ws);
    
    // Set up periodic updates
    const updateInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        sendMarketUpdate(ws);
      }
    }, 5000); // Update every 5 seconds
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clearInterval(updateInterval);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(updateInterval);
    });
  });

  async function sendMarketUpdate(ws: WebSocket) {
    try {
      const cryptocurrencies = await storage.getAllCryptocurrencies();
      const opportunities = await storage.getActiveOpportunities();
      const correlations = await storage.getLatestCorrelations();
      
      const marketData = {
        type: 'marketUpdate',
        timestamp: new Date().toISOString(),
        data: {
          cryptocurrencies,
          opportunities,
          correlations,
          totalMarketCap: cryptocurrencies.reduce((sum, coin) => 
            sum + parseFloat(coin.marketCap?.toString() || '0'), 0),
          btcDominance: calculateBtcDominance(cryptocurrencies),
        }
      };
      
      ws.send(JSON.stringify(marketData));
    } catch (error) {
      console.error('Error sending market update:', error);
    }
  }

  function calculateBtcDominance(cryptocurrencies: any[]): number {
    const btc = cryptocurrencies.find(coin => coin.symbol === 'BTC');
    if (!btc) return 0;
    
    const totalMarketCap = cryptocurrencies.reduce((sum, coin) => 
      sum + parseFloat(coin.marketCap?.toString() || '0'), 0);
    
    return totalMarketCap > 0 ? 
      (parseFloat(btc.marketCap?.toString() || '0') / totalMarketCap) * 100 : 0;
  }

  // API Routes
  app.get('/api/cryptocurrencies', async (req, res) => {
    try {
      const cryptocurrencies = await storage.getAllCryptocurrencies();
      res.json(cryptocurrencies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cryptocurrencies' });
    }
  });

  app.get('/api/cryptocurrencies/:tier', async (req, res) => {
    try {
      const { tier } = req.params;
      const cryptocurrencies = await storage.getCryptocurrenciesByTier(tier);
      res.json(cryptocurrencies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cryptocurrencies by tier' });
    }
  });

  app.get('/api/opportunities', async (req, res) => {
    try {
      const opportunities = await storage.getActiveOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
  });

  app.post('/api/opportunities/analyze', async (req, res) => {
    try {
      const cryptocurrencies = await storage.getAllCryptocurrencies();
      const opportunities = await opportunityService.analyzeOpportunities(cryptocurrencies);
      
      // Store new opportunities
      for (const opportunity of opportunities) {
        await storage.createTradingOpportunity(opportunity);
      }
      
      res.json({ message: 'Analysis complete', count: opportunities.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze opportunities' });
    }
  });

  app.get('/api/correlations', async (req, res) => {
    try {
      const correlations = await storage.getLatestCorrelations();
      res.json(correlations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch correlations' });
    }
  });

  // Get price history for a token
  app.get('/api/price-history/:symbol/:timeframe', async (req, res) => {
    try {
      const { symbol, timeframe } = req.params;
      
      // Get the cryptocurrency from storage first
      const crypto = await storage.getCryptocurrencyBySymbol(symbol.toUpperCase());
      if (!crypto) {
        return res.status(404).json({ error: 'Cryptocurrency not found' });
      }

      // Calculate days based on timeframe
      let days = 1;
      switch (timeframe) {
        case '1d': days = 1; break;
        case '1m': days = 30; break;
        case '1y': days = 365; break;
        case '5y': days = 1825; break;
        case 'max': days = 'max' as any; break;
        default: days = 1;
      }

      // Try to get price history from CoinGecko
      try {
        const priceHistory = await cryptoService.getPriceHistory(crypto.coinGeckoId || symbol.toLowerCase(), days);
        
        // Transform the data to match our expected format
        const formattedData = priceHistory.prices?.map(([timestamp, price]: [number, number]) => ({
          timestamp: new Date(timestamp).toISOString(),
          price: price
        })) || [];

        res.json(formattedData);
      } catch (apiError) {
        console.error('CoinGecko API error:', apiError);
        // Return error so frontend can use fallback data
        res.status(503).json({ error: 'Market data temporarily unavailable' });
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
      res.status(500).json({ error: 'Failed to fetch price history' });
    }
  });

  app.post('/api/market/refresh', async (req, res) => {
    try {
      console.log('Refreshing market data...');
      const marketData = await cryptoService.getAllMarketData();
      
      // Update database with fresh data
      for (const coinData of marketData) {
        const cryptocurrency = cryptoService.transformToInsertCryptocurrency(coinData);
        await storage.upsertCryptocurrency(cryptocurrency);
      }
      
      // Analyze new opportunities
      const cryptocurrencies = await storage.getAllCryptocurrencies();
      const opportunities = await opportunityService.analyzeOpportunities(cryptocurrencies);
      
      // Store new opportunities
      for (const opportunity of opportunities) {
        await storage.createTradingOpportunity(opportunity);
      }
      
      res.json({ 
        message: 'Market data refreshed successfully',
        cryptocurrencies: marketData.length,
        opportunities: opportunities.length 
      });
    } catch (error) {
      console.error('Error refreshing market data:', error);
      res.status(500).json({ error: 'Failed to refresh market data' });
    }
  });

  app.get('/api/market/stats', async (req, res) => {
    try {
      const cryptocurrencies = await storage.getAllCryptocurrencies();
      const opportunities = await storage.getActiveOpportunities();
      
      const stats = {
        totalMarketCap: cryptocurrencies.reduce((sum, coin) => 
          sum + parseFloat(coin.marketCap?.toString() || '0'), 0),
        btcDominance: calculateBtcDominance(cryptocurrencies),
        activeOpportunities: opportunities.length,
        marketTrend: calculateMarketTrend(cryptocurrencies),
        tierDistribution: calculateTierDistribution(cryptocurrencies),
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch market stats' });
    }
  });

  // AI Trading Expert Chat API
  app.post('/api/trading-expert/chat', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get current market context
      const cryptocurrencies = await storage.getAllCryptocurrencies();
      const opportunities = await storage.getActiveOpportunities();
      
      const marketStats = {
        totalMarketCap: cryptocurrencies.reduce((sum, coin) => 
          sum + parseFloat(coin.marketCap?.toString() || '0'), 0),
        btcDominance: calculateBtcDominance(cryptocurrencies),
        marketTrend: calculateMarketTrend(cryptocurrencies),
        volatilityIndex: calculateVolatilityIndex(cryptocurrencies),
      };

      const context = {
        cryptocurrencies,
        opportunities,
        marketStats
      };

      // Get AI analysis
      const analysis = await tradingExpertService.analyzeUserQuery(message, context);
      
      res.json(analysis);
    } catch (error) {
      console.error('Trading expert chat error:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        response: 'I apologize, but I\'m experiencing technical difficulties. Please try your question again.',
        sentiment: 'neutral' as const,
        riskLevel: 'medium' as const,
        confidence: 50,
        recommendations: ['Try your question again', 'Check market data connectivity']
      });
    }
  });

  function calculateMarketTrend(cryptocurrencies: any[]): string {
    const avgChange = cryptocurrencies.reduce((sum, coin) => 
      sum + parseFloat(coin.priceChangePercentage24h?.toString() || '0'), 0) / cryptocurrencies.length;
    
    if (avgChange > 2) return 'bullish';
    if (avgChange < -2) return 'bearish';
    return 'neutral';
  }

  function calculateTierDistribution(cryptocurrencies: any[]) {
    const distribution = cryptocurrencies.reduce((acc, coin) => {
      acc[coin.tier] = (acc[coin.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return distribution;
  }

  function calculateVolatilityIndex(cryptocurrencies: any[]): number {
    const changes = cryptocurrencies.map(c => Math.abs(parseFloat(c.priceChangePercentage24h || '0')));
    const avgVolatility = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    return Math.round(avgVolatility * 10); // Scale to 0-100
  }

  // Auto-refresh market data every 5 minutes
  setInterval(async () => {
    try {
      console.log('Auto-refreshing market data...');
      const marketData = await cryptoService.getAllMarketData();
      
      for (const coinData of marketData.slice(0, 100)) { // Limit to avoid rate limits
        const cryptocurrency = cryptoService.transformToInsertCryptocurrency(coinData);
        await storage.upsertCryptocurrency(cryptocurrency);
      }
    } catch (error) {
      console.error('Auto-refresh error:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  return httpServer;
}
