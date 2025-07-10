import { 
  users, 
  cryptocurrencies,
  tradingOpportunities,
  correlationData,
  priceHistory,
  type User, 
  type InsertUser,
  type Cryptocurrency,
  type InsertCryptocurrency,
  type TradingOpportunity,
  type InsertTradingOpportunity,
  type CorrelationData,
  type PriceHistory
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private cryptocurrencies: Map<number, Cryptocurrency> = new Map();
  private tradingOpportunities: Map<number, TradingOpportunity> = new Map();
  private correlationData: Map<number, CorrelationData> = new Map();
  private priceHistory: Map<number, PriceHistory> = new Map();
  
  private currentUserId = 1;
  private currentCryptoId = 1;
  private currentOpportunityId = 1;
  private currentCorrelationId = 1;
  private currentPriceHistoryId = 1;

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
      };
      this.cryptocurrencies.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentCryptoId++;
      const newCrypto: Cryptocurrency = {
        ...cryptocurrency,
        id,
        lastUpdated: new Date(),
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
}

export const storage = new MemStorage();
