# Replit.md

## Overview

This is a comprehensive cryptocurrency tracking and trading opportunity detection application. The system is built as a full-stack web application with a React frontend and Express backend, designed to track thousands of cryptocurrencies across different market cap tiers and identify potential trading opportunities with leverage recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom crypto-themed design tokens
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Chart.js for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for live market updates
- **Session Management**: Express sessions with PostgreSQL store
- **API Integration**: CoinGecko API for cryptocurrency market data

### Database Schema
The application uses a PostgreSQL database with the following main tables:
- `users`: User accounts and authentication
- `cryptocurrencies`: Token information, prices, and market data
- `trading_opportunities`: Identified trading opportunities with risk analysis
- `price_history`: Historical price data for trend analysis
- `correlation_data`: Market correlation analysis between tiers

## Key Components

### Market Cap Tier System
The application categorizes cryptocurrencies into six tiers:
- **Mega Cap** ($100B+): Market leaders like BTC, ETH
- **Large Cap** ($10B-$100B): Major established tokens
- **Large Medium** ($5B-$10B): Growing established projects
- **Small Medium** ($1B-$5B): Emerging projects
- **Small Cap** ($100M-$1B): Smaller established tokens
- **Micro Cap** ($10M-$100M): High-risk speculative tokens

### Trading Opportunity Detection
- **Correlation Analysis**: Identifies when tokens break from expected correlation patterns
- **Risk Assessment**: Three-tier risk classification (Low/Medium/High)
- **Leverage Recommendations**: Suggests optimal leverage levels (2x-10x)
- **Scoring System**: Ranks opportunities by confidence and expected returns

### Real-time Data Management
- **WebSocket Integration**: Live market updates every 5 seconds
- **API Service Layer**: Handles external API calls with rate limiting
- **Data Storage**: In-memory storage with PostgreSQL persistence
- **Caching Strategy**: Query caching for improved performance

## Data Flow

1. **Data Ingestion**: CryptoService fetches market data from CoinGecko API
2. **Data Processing**: OpportunityService analyzes market data for trading opportunities
3. **Storage**: Data is stored in PostgreSQL via Drizzle ORM
4. **Real-time Updates**: WebSocket server broadcasts updates to connected clients
5. **Client Rendering**: React components display data with interactive charts and tables

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL database adapter
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **axios**: HTTP client for API requests
- **chart.js**: Data visualization library
- **ws**: WebSocket implementation

### UI Dependencies
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite provides fast HMR for frontend changes
- **Database**: Uses environment variable `DATABASE_URL` for connection

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles server code for Node.js
- **Database Migrations**: Drizzle handles schema migrations
- **Environment**: Requires `DATABASE_URL` and optional `COINGECKO_API_KEY`

### Replit Integration
- **Cartographer Plugin**: Enables Replit's development tools
- **Runtime Error Overlay**: Development error handling
- **WebSocket Support**: Compatible with Replit's WebSocket implementation

## Recent Changes

### Real Market Data Integration (July 11, 2025)
- **Live CoinGecko Integration**: Replaced all synthetic data with authentic market prices
- **Accurate Price Tracking**: All 750+ cryptocurrencies now show real-time market prices
- **Real Chart Data**: Price history charts display actual market movements from CoinGecko API
- **Manual Data Refresh**: Added refresh button to instantly update all market data
- **Automatic Updates**: System fetches fresh data every 10 minutes automatically
- **Error Handling**: Robust fallback system handles API rate limits gracefully
- **Data Validation**: All prices, market caps, and trading volumes are now authentic and accurate

### AI Trading Expert Integration (July 10, 2025)
- **Expanded Token Tracking**: Increased from 500+ to 2000+ cryptocurrency tracking capability
- **Enhanced Chips AI Assistant**: Advanced Google Gemini-powered trading expert with:
  - Intelligent greeting detection and personalized responses
  - Advanced technical analysis and trading strategies
  - Leveraged trading strategies and risk management
  - Market microstructure and DeFi protocols
  - Portfolio optimization and position sizing
  - Market psychology and regulatory impacts
- **Real-time Market Context**: AI analyzes current market data including:
  - Live cryptocurrency prices and trends (750+ active tokens)
  - 221+ active trading opportunities with risk analysis
  - Market volatility and correlation analysis
  - BTC dominance and tier distribution
- **Modern Chat Interface**: Complete UI overhaul with:
  - Gradient backgrounds and modern styling
  - Professional message bubbles with rounded corners
  - Real-time typing indicators and animations
  - Analysis badges with sentiment, risk, and confidence metrics
  - Responsive design that prevents layout overflow
- **Intelligent Analysis**: Provides sentiment analysis, risk assessment, confidence scores, and personalized recommendations
- **Advanced Fallback System**: Comprehensive rule-based analysis when AI is unavailable

### Leveraged Exchanges Analysis
- **Comprehensive Exchange Comparison**: Added detailed analysis of 6 top platforms
- **Risk Assessment**: Maximum leverage ratings, fee structures, and trading recommendations
- **Professional Features**: Pros/cons analysis, jurisdiction information, and best-use cases

The application now handles 750+ cryptocurrencies with completely accurate real-time market data, advanced AI-powered opportunity detection, and a modern, professional trading interface.