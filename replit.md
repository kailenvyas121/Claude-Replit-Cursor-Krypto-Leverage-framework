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

The application is designed to scale horizontally and can handle tracking 10,000+ cryptocurrencies with real-time updates and opportunity detection.