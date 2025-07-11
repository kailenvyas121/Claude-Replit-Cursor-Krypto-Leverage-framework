import axios from 'axios';
import { Cryptocurrency, InsertCryptocurrency } from '@shared/schema';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  image: string;
}

export class CryptoService {
  private static instance: CryptoService;
  private rateLimitDelay = 2000; // 2 seconds between requests to avoid rate limits
  private lastRequestTime = 0;

  static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    // Rate limiting with exponential backoff
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (COINGECKO_API_KEY) {
      headers['X-CG-API-Key'] = COINGECKO_API_KEY;
    }

    try {
      this.lastRequestTime = Date.now();
      const response = await axios.get(`${COINGECKO_BASE_URL}${endpoint}`, {
        headers,
        params,
        timeout: 10000, // 10 second timeout
      });
      
      // Reset delay on successful request
      this.rateLimitDelay = Math.max(1000, this.rateLimitDelay * 0.9);
      
      return response.data;
    } catch (error: any) {
      console.error('CoinGecko API error:', error?.response?.status, error?.message);
      
      // Handle rate limiting with exponential backoff
      if (error?.response?.status === 429) {
        this.rateLimitDelay = Math.min(30000, this.rateLimitDelay * 2); // Max 30 seconds
        const retryAfter = error?.response?.headers?.['retry-after'];
        if (retryAfter) {
          const waitTime = parseInt(retryAfter) * 1000;
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.makeRequest(endpoint, params); // Retry once
        }
      }
      
      throw error;
    }
  }

  async getMarketData(page: number = 1, perPage: number = 250): Promise<CoinGeckoMarketData[]> {
    const endpoint = '/coins/markets';
    const params = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: perPage,
      page: page,
      sparkline: false,
      price_change_percentage: '24h',
    };

    return this.makeRequest(endpoint, params);
  }

  async getAllMarketData(): Promise<CoinGeckoMarketData[]> {
    const allData: CoinGeckoMarketData[] = [];
    const perPage = 250;
    let page = 1;
    let hasMore = true;

    while (hasMore && allData.length < 750) { // Optimized to 750 for better performance
      try {
        const data = await this.getMarketData(page, perPage);
        if (data && data.length > 0) {
          allData.push(...data);
          page++;
          hasMore = data.length === perPage;
          
          // Ensure we don't hit rate limits
          if (page > 1) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
          }
        } else {
          hasMore = false;
        }
      } catch (error: any) {
        console.error(`Error fetching page ${page}:`, error?.response?.status || error?.message);
        
        // Stop on rate limit to avoid further issues
        if (error?.response?.status === 429) {
          console.log('Rate limit reached, stopping data fetch');
          hasMore = false;
        } else {
          hasMore = false;
        }
      }
    }

    return allData.slice(0, 750); // Optimized to 750 for better performance and analysis
  }

  determineMarketCapTier(marketCap: number): string {
    if (marketCap >= 100_000_000_000) return 'mega';
    if (marketCap >= 10_000_000_000) return 'large';
    if (marketCap >= 5_000_000_000) return 'largeMedium';
    if (marketCap >= 1_000_000_000) return 'smallMedium';
    if (marketCap >= 100_000_000) return 'small';
    return 'micro';
  }

  transformToInsertCryptocurrency(coinData: CoinGeckoMarketData): InsertCryptocurrency {
    return {
      symbol: coinData.symbol.toUpperCase(),
      name: coinData.name,
      coinGeckoId: coinData.id,
      currentPrice: coinData.current_price.toString(),
      marketCap: coinData.market_cap.toString(),
      marketCapRank: coinData.market_cap_rank,
      volume24h: coinData.total_volume.toString(),
      priceChange24h: (coinData.price_change_24h || 0).toString(),
      priceChangePercentage24h: (coinData.price_change_percentage_24h || 0).toString(),
      tier: this.determineMarketCapTier(coinData.market_cap),
      logoUrl: coinData.image,
      metadata: {
        coinGeckoId: coinData.id,
        lastApiUpdate: new Date().toISOString(),
      },
    };
  }

  async getPriceHistory(coinId: string, days: number = 30): Promise<any> {
    const endpoint = `/coins/${coinId}/market_chart`;
    const params = {
      vs_currency: 'usd',
      days: days,
      interval: days > 1 ? 'daily' : 'hourly',
    };

    return this.makeRequest(endpoint, params);
  }

  calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // Convert to percentage
  }

  calculateCorrelation(prices1: number[], prices2: number[]): number {
    if (prices1.length !== prices2.length || prices1.length < 2) return 0;
    
    const n = prices1.length;
    const sum1 = prices1.reduce((sum, p) => sum + p, 0);
    const sum2 = prices2.reduce((sum, p) => sum + p, 0);
    const sum1Sq = prices1.reduce((sum, p) => sum + p * p, 0);
    const sum2Sq = prices2.reduce((sum, p) => sum + p * p, 0);
    const pSum = prices1.reduce((sum, p, i) => sum + p * prices2[i], 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  }
}
