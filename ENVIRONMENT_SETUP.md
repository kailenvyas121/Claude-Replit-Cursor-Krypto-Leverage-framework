# 🚀 CryptoLeverage Pro - Environment Setup Guide

This guide will help you set up all the required environment variables for your crypto trading app.

## ✅ Prerequisites

- [ ] Node.js installed
- [ ] Git installed
- [ ] Your `.env` file created (already done!)

## 🗄️ Step 1: Database Setup (Neon - Recommended)

**Neon Database** is a serverless PostgreSQL service with a generous free tier.

### Option A: Neon Database (Free)
1. **Sign up** at [https://console.neon.tech/](https://console.neon.tech/)
2. **Create a project** (choose "PostgreSQL 15" or latest)
3. **Copy your connection string** from the dashboard
4. **Update your .env file:**
   ```bash
   DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
   ```

### Option B: Alternative Free Databases
- **Supabase**: [https://supabase.com/](https://supabase.com/) (10MB free)
- **PlanetScale**: [https://planetscale.com/](https://planetscale.com/) (1 database free)

## 🤖 Step 2: Google Gemini AI API Key

Your app uses Google's Gemini AI for the trading expert chat feature.

1. **Go to** [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the API key**
5. **Update your .env file:**
   ```bash
   GEMINI_API_KEY="your_actual_api_key_here"
   ```

**Free Tier:** 15 requests per minute, 1,500 requests per day

## 💰 Step 3: CoinGecko API Key

Your app fetches real cryptocurrency market data from CoinGecko.

1. **Sign up** at [https://www.coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing)
2. **Choose the Demo plan** (free)
3. **Verify your email**
4. **Go to your dashboard** and copy your API key
5. **Update your .env file:**
   ```bash
   COINGECKO_API_KEY="your_actual_api_key_here"
   ```

**Free Tier:** 10,000 requests per month

## 🔐 Step 4: Verify Your Environment Variables

Your `.env` file should look like this (with your actual values):

```bash
# Database
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

# API Keys  
GEMINI_API_KEY="your_gemini_api_key"
COINGECKO_API_KEY="your_coingecko_api_key"

# Security (already generated)
SESSION_SECRET="93bff2ebbe93afb588bcd766f4e9524739a6509172df910718db347afd3774b1e0e46c0a7a16b4c2391852267a76347cc906987912729f7c1bee82cf3c432816"

# Environment
NODE_ENV="development"
PORT=5000
```

## 🚀 Step 5: Initialize Your Database

Once you have your DATABASE_URL set up:

```bash
# Install dependencies (if not done already)
npm install

# Push database schema
npm run db:push

# Start your app
npm run dev
```

## 🧪 Step 6: Test Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** to `http://localhost:5000`

3. **Check for these indicators:**
   - ✅ App loads without database errors
   - ✅ Cryptocurrency data appears on dashboard
   - ✅ AI chat feature works
   - ✅ Real-time price updates work

## 🔧 Troubleshooting

### Database Connection Issues
```bash
Error: DATABASE_URL must be set
```
- **Solution:** Double-check your DATABASE_URL in `.env`
- **Format:** `postgresql://username:password@hostname/database?sslmode=require`

### API Key Issues
```bash
Error: Request failed with status 401
```
- **Solution:** Verify your API keys are correct and active
- **Check:** API key quotas and rate limits

### TypeScript Errors
```bash
npm run check
```
- **Note:** Some TypeScript errors are expected and won't prevent the app from running
- **Focus:** Database connection and API functionality

## 🎯 Next Steps

Once your environment is set up:

1. **Explore the Dashboard** - View real crypto market data
2. **Test Trading Signals** - Check the opportunities tab
3. **Try AI Chat** - Ask the trading expert questions
4. **Customize Settings** - Modify tiers and preferences

## 💡 Pro Tips

- **Keep your .env file secure** - Never commit it to version control
- **Monitor API quotas** - Both services have rate limits
- **Use development mode** - Set `NODE_ENV="development"` for detailed logs
- **Database backups** - Neon provides automatic backups on paid plans

## 🆘 Need Help?

If you encounter issues:
1. Check the console logs in your browser
2. Check the terminal output for server errors
3. Verify all environment variables are set correctly
4. Ensure your database schema is pushed (`npm run db:push`)

Your crypto trading app should now be fully configured and ready to use! 🎉