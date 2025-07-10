import { 
  users, 
  cryptocurrencies,
  tradingOpportunities,
  correlationData,
  priceHistory,
  userFavorites,
  type User, 
  type InsertUser,
  type Cryptocurrency,
  type InsertCryptocurrency,
  type TradingOpportunity,
  type InsertTradingOpportunity,
  type CorrelationData,
  type PriceHistory,
  type UserFavorite,
  type InsertUserFavorite
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cryptocurrency methods
  getAllCryptocurrencies(): Promise<Cryptocurrency[]>;
  getCryptocurrenciesByTier(tier: string): Promise<Cryptocurrency[]>;
  getCryptocurrencyBySymbol(symbol: string): Promise<Cryptocurrency | undefined>;
  upsertCryptocurrency(cryptocurrency: InsertCryptocurrency): Promise<Cryptocurrency>;
  
  // Trading opportunity methods
  getAllTradingOpportunities(): Promise<TradingOpportunity[]>;
  getActiveOpportunities(): Promise<TradingOpportunity[]>;
  createTradingOpportunity(opportunity: InsertTradingOpportunity): Promise<TradingOpportunity>;
  deactivateOpportunity(id: number): Promise<void>;
  
  // Correlation methods
  getLatestCorrelations(): Promise<CorrelationData[]>;
  createCorrelation(correlation: Omit<CorrelationData, 'id' | 'calculatedAt'>): Promise<CorrelationData>;
  
  // Price history methods
  getPriceHistory(cryptocurrencyId: number, hours: number): Promise<PriceHistory[]>;
  addPriceHistory(priceData: Omit<PriceHistory, 'id' | 'timestamp'>): Promise<PriceHistory>;
  
  // Favorites methods
  getUserFavorites(userId: number): Promise<UserFavorite[]>;
  addFavorite(userId: number, cryptocurrencyId: number): Promise<UserFavorite>;
  removeFavorite(userId: number, cryptocurrencyId: number): Promise<void>;
  isFavorite(userId: number, cryptocurrencyId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private cryptocurrencies: Map<number, Cryptocurrency> = new Map();
  private tradingOpportunities: Map<number, TradingOpportunity> = new Map();
  private correlationData: Map<number, CorrelationData> = new Map();
  private priceHistory: Map<number, PriceHistory> = new Map();
  private userFavorites: Map<number, UserFavorite> = new Map();
  
  private currentUserId = 1;
  private currentCryptoId = 1;
  private currentOpportunityId = 1;
  private currentCorrelationId = 1;
  private currentPriceHistoryId = 1;
  private currentFavoriteId = 1;

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Initialize with comprehensive demo cryptocurrency data
    const demoCoins = [
      // Mega Cap ($100B+)
      { symbol: 'BTC', name: 'Bitcoin', price: 43250, marketCap: 847000000000, tier: 'mega', change: 2.1 },
      { symbol: 'ETH', name: 'Ethereum', price: 2580, marketCap: 310000000000, tier: 'mega', change: 1.8 },
      
      // Large Cap ($10B-$100B)
      { symbol: 'BNB', name: 'Binance Coin', price: 315, marketCap: 47000000000, tier: 'large', change: -0.5 },
      { symbol: 'SOL', name: 'Solana', price: 105, marketCap: 46000000000, tier: 'large', change: 3.2 },
      { symbol: 'XRP', name: 'Ripple', price: 0.62, marketCap: 34000000000, tier: 'large', change: -1.2 },
      { symbol: 'ADA', name: 'Cardano', price: 0.48, marketCap: 17000000000, tier: 'large', change: 0.8 },
      { symbol: 'AVAX', name: 'Avalanche', price: 38, marketCap: 15000000000, tier: 'large', change: 2.5 },
      { symbol: 'DOT', name: 'Polkadot', price: 7.2, marketCap: 10500000000, tier: 'large', change: -2.1 },
      
      // Large Medium ($5B-$10B)
      { symbol: 'MATIC', name: 'Polygon', price: 0.92, marketCap: 8500000000, tier: 'largeMedium', change: 1.5 },
      { symbol: 'LINK', name: 'Chainlink', price: 15.8, marketCap: 8200000000, tier: 'largeMedium', change: 0.7 },
      { symbol: 'UNI', name: 'Uniswap', price: 6.8, marketCap: 6800000000, tier: 'largeMedium', change: -0.9 },
      { symbol: 'LTC', name: 'Litecoin', price: 72, marketCap: 5300000000, tier: 'largeMedium', change: 1.2 },
      { symbol: 'ICP', name: 'Internet Computer', price: 12.5, marketCap: 5800000000, tier: 'largeMedium', change: 4.1 },
      { symbol: 'APT', name: 'Aptos', price: 8.9, marketCap: 5200000000, tier: 'largeMedium', change: -1.8 },
      
      // Small Medium ($1B-$5B)
      { symbol: 'ATOM', name: 'Cosmos', price: 10.2, marketCap: 4000000000, tier: 'smallMedium', change: 2.8 },
      { symbol: 'NEAR', name: 'NEAR Protocol', price: 3.5, marketCap: 3800000000, tier: 'smallMedium', change: 1.9 },
      { symbol: 'FTM', name: 'Fantom', price: 0.45, marketCap: 1800000000, tier: 'smallMedium', change: -3.2 },
      { symbol: 'ALGO', name: 'Algorand', price: 0.22, marketCap: 1700000000, tier: 'smallMedium', change: 0.5 },
      { symbol: 'VET', name: 'VeChain', price: 0.028, marketCap: 2200000000, tier: 'smallMedium', change: 1.1 },
      { symbol: 'FLOW', name: 'Flow', price: 0.78, marketCap: 1500000000, tier: 'smallMedium', change: -0.7 },
      { symbol: 'HBAR', name: 'Hedera', price: 0.065, marketCap: 2400000000, tier: 'smallMedium', change: 2.3 },
      { symbol: 'XTZ', name: 'Tezos', price: 0.95, marketCap: 1000000000, tier: 'smallMedium', change: -1.5 },
      
      // Small Cap ($100M-$1B)
      { symbol: 'ROSE', name: 'Oasis Network', price: 0.078, marketCap: 520000000, tier: 'small', change: 3.8 },
      { symbol: 'KAVA', name: 'Kava', price: 0.95, marketCap: 480000000, tier: 'small', change: -2.1 },
      { symbol: 'CELO', name: 'Celo', price: 0.62, marketCap: 320000000, tier: 'small', change: 1.7 },
      { symbol: 'SKL', name: 'SKALE Network', price: 0.048, marketCap: 180000000, tier: 'small', change: 4.2 },
      { symbol: 'BAND', name: 'Band Protocol', price: 1.25, marketCap: 250000000, tier: 'small', change: -1.9 },
      { symbol: 'REN', name: 'Ren', price: 0.058, marketCap: 150000000, tier: 'small', change: 2.5 },
      { symbol: 'KNC', name: 'Kyber Network', price: 0.72, marketCap: 140000000, tier: 'small', change: -0.8 },
      { symbol: 'OCEAN', name: 'Ocean Protocol', price: 0.45, marketCap: 290000000, tier: 'small', change: 3.1 },
      
      // Micro Cap / Shit Coins ($10M-$100M)
      { symbol: 'PEPE', name: 'Pepe', price: 0.00000125, marketCap: 52000000, tier: 'micro', change: 15.7 },
      { symbol: 'FLOKI', name: 'Floki Inu', price: 0.000165, marketCap: 38000000, tier: 'micro', change: -8.2 },
      { symbol: 'SHIB', name: 'Shiba Inu', price: 0.0000095, marketCap: 95000000, tier: 'micro', change: 22.1 },
      { symbol: 'WOJAK', name: 'Wojak', price: 0.000028, marketCap: 28000000, tier: 'micro', change: -12.5 },
      { symbol: 'DOGE2', name: 'Doge2.0', price: 0.0000045, marketCap: 18000000, tier: 'micro', change: 45.3 },
      { symbol: 'MEME', name: 'Meme Coin', price: 0.000072, marketCap: 35000000, tier: 'micro', change: -18.7 },
      { symbol: 'MOONBOY', name: 'MoonBoy', price: 0.000015, marketCap: 15000000, tier: 'micro', change: 67.9 },
      { symbol: 'ROCKET', name: 'RocketCoin', price: 0.0000089, marketCap: 22000000, tier: 'micro', change: -25.4 },
    ];

    demoCoins.forEach((coin, index) => {
      const id = this.currentCryptoId++;
      const crypto: Cryptocurrency = {
        id,
        symbol: coin.symbol,
        name: coin.name,
        currentPrice: coin.price.toString(),
        marketCap: coin.marketCap.toString(),
        marketCapRank: index + 1,
        volume24h: (coin.marketCap * 0.15).toString(), // Estimate 15% of market cap as volume
        priceChange24h: ((coin.price * coin.change) / 100).toString(),
        priceChangePercentage24h: coin.change.toString(),
        tier: coin.tier,
        logoUrl: null,
        lastUpdated: new Date(),
        metadata: {
          isDemo: true,
          lastUpdate: new Date().toISOString(),
        },
      };
      this.cryptocurrencies.set(id, crypto);
    });

    // Generate some demo correlations
    const correlations = [
      { tier1: 'mega', tier2: 'large', correlation: '0.94', timeframe: '24h' },
      { tier1: 'large', tier2: 'largeMedium', correlation: '0.87', timeframe: '24h' },
      { tier1: 'largeMedium', tier2: 'smallMedium', correlation: '0.72', timeframe: '24h' },
      { tier1: 'smallMedium', tier2: 'small', correlation: '0.58', timeframe: '24h' },
      { tier1: 'small', tier2: 'micro', correlation: '0.23', timeframe: '24h' },
    ];

    correlations.forEach(corr => {
      const id = this.currentCorrelationId++;
      this.correlationData.set(id, {
        id,
        tier1: corr.tier1,
        tier2: corr.tier2,
        correlation: corr.correlation,
        timeframe: corr.timeframe,
        calculatedAt: new Date(),
      });
    });

    // Generate demo trading opportunities
    const opportunities = [
      {
        cryptocurrencyId: 4, // SOL
        opportunityType: 'LONG',
        riskLevel: 'MEDIUM',
        riskPercentage: '25',
        leverageRecommendation: '3x',
        expectedReturn: '18.5',
        confidence: '87',
        analysis: {
          explanation: 'SOL is outperforming its Large Cap tier by +1.7%. While BTC and ETH show positive momentum, SOL demonstrates stronger fundamentals and is likely to continue its upward trajectory.',
          strategy: 'Enter long position on SOL with 3x leverage. Set tight stop-loss due to volatility.',
          entryPoint: '$105 - $108',
          exitPoint: '$125 - $130',
          stopLoss: '$98',
          volatilityRisk: 35,
          correlationRisk: 15,
          volumeRisk: 20,
          trendRisk: 10,
          statisticalSignificance: 85,
          historicalSuccessRate: 72
        },
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      },
      {
        cryptocurrencyId: 20, // FTM
        opportunityType: 'LONG',
        riskLevel: 'HIGH',
        riskPercentage: '45',
        leverageRecommendation: '5x',
        expectedReturn: '32.8',
        confidence: '62',
        analysis: {
          explanation: 'FTM is significantly lagging its Small Medium tier (-3.2% vs +0.8% tier average). When small-medium caps recover, FTM likely to catch up aggressively.',
          strategy: 'Contrarian play - buy the lag. FTM tends to overcorrect when tier sentiment improves.',
          entryPoint: '$0.44 - $0.46',
          exitPoint: '$0.58 - $0.65',
          stopLoss: '$0.41',
          volatilityRisk: 65,
          correlationRisk: 25,
          volumeRisk: 45,
          trendRisk: 35,
          statisticalSignificance: 68,
          historicalSuccessRate: 58
        },
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      },
      {
        cryptocurrencyId: 32, // PEPE
        opportunityType: 'SHORT',
        riskLevel: 'HIGH',
        riskPercentage: '78',
        leverageRecommendation: '2x',
        expectedReturn: '45.2',
        confidence: '34',
        analysis: {
          explanation: 'PEPE showing extreme volatility (+15.7%) with no correlation to market fundamentals. Meme coin pump appears unsustainable without major tier support.',
          strategy: 'Short the meme pump. Wait for momentum to fade then short with small position size.',
          entryPoint: '$0.00000120 - $0.00000130',
          exitPoint: '$0.00000085 - $0.00000095',
          stopLoss: '$0.00000145',
          volatilityRisk: 95,
          correlationRisk: 85,
          volumeRisk: 70,
          trendRisk: 60,
          statisticalSignificance: 35,
          historicalSuccessRate: 28
        },
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
      {
        cryptocurrencyId: 24, // SKL
        opportunityType: 'LONG',
        riskLevel: 'MEDIUM',
        riskPercentage: '38',
        leverageRecommendation: '4x',
        expectedReturn: '28.4',
        confidence: '74',
        analysis: {
          explanation: 'SKL outperforming Small Cap tier significantly (+4.2% vs +2.1% average). Small caps showing strength, SKL has momentum and volume support.',
          strategy: 'Momentum play on small cap leader. Strong volume confirms the move.',
          entryPoint: '$0.047 - $0.049',
          exitPoint: '$0.061 - $0.067',
          stopLoss: '$0.043',
          volatilityRisk: 55,
          correlationRisk: 30,
          volumeRisk: 25,
          trendRisk: 15,
          statisticalSignificance: 78,
          historicalSuccessRate: 65
        },
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
      },
      {
        cryptocurrencyId: 11, // UNI
        opportunityType: 'LONG',
        riskLevel: 'LOW',
        riskPercentage: '15',
        leverageRecommendation: '2x',
        expectedReturn: '12.3',
        confidence: '91',
        analysis: {
          explanation: 'UNI lagging Large Medium tier (-0.9% vs +1.5% average). Strong fundamentals, DeFi sector recovery expected to lift UNI back to tier average.',
          strategy: 'Value play on quality DeFi blue chip. Low risk entry with high probability of mean reversion.',
          entryPoint: '$6.75 - $6.85',
          exitPoint: '$7.40 - $7.80',
          stopLoss: '$6.45',
          volatilityRisk: 25,
          correlationRisk: 10,
          volumeRisk: 15,
          trendRisk: 8,
          statisticalSignificance: 92,
          historicalSuccessRate: 84
        },
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      }
    ];

    opportunities.forEach(opp => {
      const id = this.currentOpportunityId++;
      this.tradingOpportunities.set(id, {
        ...opp,
        id,
        createdAt: new Date(),
        isActive: true,
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Cryptocurrency methods
  async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptocurrencies.values());
  }

  async getCryptocurrenciesByTier(tier: string): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptocurrencies.values()).filter(
      crypto => crypto.tier === tier
    );
  }

  async getCryptocurrencyBySymbol(symbol: string): Promise<Cryptocurrency | undefined> {
    return Array.from(this.cryptocurrencies.values()).find(
      crypto => crypto.symbol === symbol
    );
  }

  async upsertCryptocurrency(cryptocurrency: InsertCryptocurrency): Promise<Cryptocurrency> {
    const existing = Array.from(this.cryptocurrencies.values()).find(
      crypto => crypto.symbol === cryptocurrency.symbol
    );

    if (existing) {
      const updated: Cryptocurrency = {
        ...existing,
        ...cryptocurrency,
        lastUpdated: new Date(),
        marketCapRank: cryptocurrency.marketCapRank ?? existing.marketCapRank,
      };
      this.cryptocurrencies.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentCryptoId++;
      const newCrypto: Cryptocurrency = {
        ...cryptocurrency,
        id,
        lastUpdated: new Date(),
        metadata: cryptocurrency.metadata || null,
      };
      this.cryptocurrencies.set(id, newCrypto);
      return newCrypto;
    }
  }

  // Trading opportunity methods
  async getAllTradingOpportunities(): Promise<TradingOpportunity[]> {
    return Array.from(this.tradingOpportunities.values());
  }

  async getActiveOpportunities(): Promise<TradingOpportunity[]> {
    const now = new Date();
    return Array.from(this.tradingOpportunities.values()).filter(
      opportunity => opportunity.isActive && 
      (!opportunity.expiresAt || opportunity.expiresAt > now)
    );
  }

  async createTradingOpportunity(opportunity: InsertTradingOpportunity): Promise<TradingOpportunity> {
    const id = this.currentOpportunityId++;
    const newOpportunity: TradingOpportunity = {
      ...opportunity,
      id,
      createdAt: new Date(),
      isActive: true,
      cryptocurrencyId: opportunity.cryptocurrencyId || null,
      expectedReturn: opportunity.expectedReturn || null,
      expiresAt: opportunity.expiresAt || null,
    };
    this.tradingOpportunities.set(id, newOpportunity);
    return newOpportunity;
  }

  async deactivateOpportunity(id: number): Promise<void> {
    const opportunity = this.tradingOpportunities.get(id);
    if (opportunity) {
      opportunity.isActive = false;
      this.tradingOpportunities.set(id, opportunity);
    }
  }

  // Correlation methods
  async getLatestCorrelations(): Promise<CorrelationData[]> {
    return Array.from(this.correlationData.values());
  }

  async createCorrelation(correlation: Omit<CorrelationData, 'id' | 'calculatedAt'>): Promise<CorrelationData> {
    const id = this.currentCorrelationId++;
    const newCorrelation: CorrelationData = {
      ...correlation,
      id,
      calculatedAt: new Date(),
    };
    this.correlationData.set(id, newCorrelation);
    return newCorrelation;
  }

  // Price history methods
  async getPriceHistory(cryptocurrencyId: number, hours: number): Promise<PriceHistory[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.priceHistory.values()).filter(
      history => history.cryptocurrencyId === cryptocurrencyId &&
      history.timestamp && history.timestamp > cutoff
    );
  }

  async addPriceHistory(priceData: Omit<PriceHistory, 'id' | 'timestamp'>): Promise<PriceHistory> {
    const id = this.currentPriceHistoryId++;
    const newPriceHistory: PriceHistory = {
      ...priceData,
      id,
      timestamp: new Date(),
    };
    this.priceHistory.set(id, newPriceHistory);
    return newPriceHistory;
  }

  // Favorites methods
  async getUserFavorites(userId: number): Promise<UserFavorite[]> {
    return Array.from(this.userFavorites.values()).filter(
      (favorite) => favorite.userId === userId
    );
  }

  async addFavorite(userId: number, cryptocurrencyId: number): Promise<UserFavorite> {
    // Check if favorite already exists
    const existingFavorite = Array.from(this.userFavorites.values()).find(
      (favorite) => favorite.userId === userId && favorite.cryptocurrencyId === cryptocurrencyId
    );
    
    if (existingFavorite) {
      return existingFavorite;
    }

    const id = this.currentFavoriteId++;
    const newFavorite: UserFavorite = {
      id,
      userId,
      cryptocurrencyId,
      createdAt: new Date(),
    };
    this.userFavorites.set(id, newFavorite);
    return newFavorite;
  }

  async removeFavorite(userId: number, cryptocurrencyId: number): Promise<void> {
    const favoriteToRemove = Array.from(this.userFavorites.entries()).find(
      ([_, favorite]) => favorite.userId === userId && favorite.cryptocurrencyId === cryptocurrencyId
    );
    
    if (favoriteToRemove) {
      this.userFavorites.delete(favoriteToRemove[0]);
    }
  }

  async isFavorite(userId: number, cryptocurrencyId: number): Promise<boolean> {
    return Array.from(this.userFavorites.values()).some(
      (favorite) => favorite.userId === userId && favorite.cryptocurrencyId === cryptocurrencyId
    );
  }
}

export const storage = new MemStorage();
