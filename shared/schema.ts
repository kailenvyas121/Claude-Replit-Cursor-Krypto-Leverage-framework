import { pgTable, text, serial, decimal, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }).notNull(),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }).notNull(),
  marketCapRank: integer("market_cap_rank"),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  priceChange24h: decimal("price_change_24h", { precision: 10, scale: 4 }),
  priceChangePercentage24h: decimal("price_change_percentage_24h", { precision: 10, scale: 4 }),
  tier: text("tier").notNull(), // mega, large, largeMedium, smallMedium, small, micro
  logoUrl: text("logo_url"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  metadata: jsonb("metadata"),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  cryptocurrencyId: integer("cryptocurrency_id").references(() => cryptocurrencies.id),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const tradingOpportunities = pgTable("trading_opportunities", {
  id: serial("id").primaryKey(),
  cryptocurrencyId: integer("cryptocurrency_id").references(() => cryptocurrencies.id),
  opportunityType: text("opportunity_type").notNull(), // long, short, arbitrage
  riskLevel: text("risk_level").notNull(), // low, medium, high
  riskPercentage: decimal("risk_percentage", { precision: 5, scale: 2 }).notNull(),
  leverageRecommendation: text("leverage_recommendation").notNull(),
  expectedReturn: decimal("expected_return", { precision: 10, scale: 4 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  analysis: jsonb("analysis").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const correlationData = pgTable("correlation_data", {
  id: serial("id").primaryKey(),
  tier1: text("tier1").notNull(),
  tier2: text("tier2").notNull(),
  correlation: decimal("correlation", { precision: 5, scale: 4 }).notNull(),
  timeframe: text("timeframe").notNull(), // 1h, 24h, 7d, 30d
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies).omit({
  id: true,
  lastUpdated: true,
});

export const insertTradingOpportunitySchema = createInsertSchema(tradingOpportunities).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptocurrency = z.infer<typeof insertCryptocurrencySchema>;
export type TradingOpportunity = typeof tradingOpportunities.$inferSelect;
export type InsertTradingOpportunity = z.infer<typeof insertTradingOpportunitySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type CorrelationData = typeof correlationData.$inferSelect;
