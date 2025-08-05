# 🚀 CryptoLevragePro - Local Setup Guide

## Prerequisites

Before running CryptoLevragePro locally, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **A modern web browser** (Chrome, Firefox, Safari, Edge)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/kailenvyas121/Claude-Replit-Cursor-Krypto-Leverage-framework.git
cd Claude-Replit-Cursor-Krypto-Leverage-framework
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
npm run dev
```

### 4. Open in Browser
Navigate to: **http://localhost:5000**

## 🎯 What You'll See

Your CryptoLevragePro application includes:

- **📊 Real-time Dashboard** - Live crypto market data
- **🤖 AI Trading Expert** - AI-powered trading assistance
- **📈 Advanced Charts** - Multiple analysis tools
- **⚡ Smart Alerts** - Intelligent notification system
- **🔄 WebSocket Integration** - Real-time data updates
- **💼 Personal Portfolio** - Track your investments
- **🔍 Crypto Discovery** - Find new opportunities

## 🛠️ Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Update database schema

## 🚨 Troubleshooting

### Port Already in Use
If port 5000 is busy:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Then run npm run dev again
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
# Push database schema
npm run db:push
```

## 🔧 Configuration

The application runs on:
- **Frontend & Backend:** http://localhost:5000
- **Development Mode:** Includes hot reload and error overlay
- **Production Mode:** Optimized build

## 📱 Features Overview

- **Modern UI:** Built with React + TypeScript + Tailwind CSS
- **Real-time Data:** WebSocket connections for live updates
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Dark Theme:** Professional crypto trading interface
- **Advanced Analytics:** Multiple chart types and analysis tools

## 🆘 Need Help?

If you encounter any issues:
1. Check that Node.js version is 18+: `node --version`
2. Ensure all dependencies installed: `npm install`
3. Check if port 5000 is available
4. Try clearing browser cache

---

**Your CryptoLevragePro application should now be running locally! 🎉**