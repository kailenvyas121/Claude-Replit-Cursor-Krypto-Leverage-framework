export const MARKET_CAP_TIERS = {
  mega: {
    name: "Mega Cap",
    description: "$100B+ Market Cap",
    threshold: 100_000_000_000,
    color: "purple",
  },
  large: {
    name: "Large Cap",
    description: "$10B-$100B",
    threshold: 10_000_000_000,
    color: "blue",
  },
  largeMedium: {
    name: "Large Medium",
    description: "$5B-$10B",
    threshold: 5_000_000_000,
    color: "green",
  },
  smallMedium: {
    name: "Small Medium",
    description: "$1B-$5B",
    threshold: 1_000_000_000,
    color: "orange",
  },
  small: {
    name: "Small Cap",
    description: "$100M-$1B",
    threshold: 100_000_000,
    color: "red",
  },
  micro: {
    name: "Micro/Shit Coins",
    description: "$10M-$100M",
    threshold: 10_000_000,
    color: "gray",
  },
} as const;

export const RISK_LEVELS = {
  low: {
    name: "Low Risk",
    color: "green",
    maxLeverage: 10,
    description: "Conservative plays with high success probability",
  },
  medium: {
    name: "Medium Risk",
    color: "yellow",
    maxLeverage: 7,
    description: "Balanced risk-reward opportunities",
  },
  high: {
    name: "High Risk",
    color: "red",
    maxLeverage: 5,
    description: "High volatility with potential for significant gains",
  },
} as const;

export const OPPORTUNITY_TYPES = {
  long: {
    name: "Long Position",
    description: "Expect price to increase",
    icon: "TrendingUp",
  },
  short: {
    name: "Short Position",
    description: "Expect price to decrease",
    icon: "TrendingDown",
  },
  arbitrage: {
    name: "Arbitrage",
    description: "Price discrepancy opportunity",
    icon: "Target",
  },
} as const;

export const CHART_COLORS = {
  primary: "#06B6D4",
  secondary: "#8B5CF6",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
} as const;

export const UPDATE_INTERVALS = {
  PRICE_UPDATE: 5000, // 5 seconds
  OPPORTUNITY_SCAN: 60000, // 1 minute
  CORRELATION_UPDATE: 300000, // 5 minutes
  MARKET_REFRESH: 900000, // 15 minutes
} as const;
