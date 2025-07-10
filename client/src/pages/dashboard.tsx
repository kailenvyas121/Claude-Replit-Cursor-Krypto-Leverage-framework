import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useCryptoData } from "@/hooks/useCryptoData";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'analysis' | 'opportunities'>('overview');
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set());
  
  const {
    marketData,
    isConnected,
    lastUpdate,
    refreshMarketData
  } = useCryptoData();

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tier)) {
        newSet.delete(tier);
      } else {
        newSet.add(tier);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header 
        isConnected={isConnected}
        lastUpdate={lastUpdate}
        onRefresh={refreshMarketData}
      />
      
      <div className="flex">
        <Sidebar
          cryptocurrencies={marketData?.cryptocurrencies || []}
          expandedTiers={expandedTiers}
          onToggleTier={toggleTier}
        />
        
        <MainContent
          activeTab={activeTab}
          onTabChange={setActiveTab}
          marketData={marketData}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
