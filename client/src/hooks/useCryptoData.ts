import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

export function useCryptoData() {
  const [marketData, setMarketData] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { isConnected, lastMessage, lastUpdate } = useWebSocket('/ws');

  // Fetch initial data
  const { data: cryptocurrencies } = useQuery({
    queryKey: ['/api/cryptocurrencies'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: correlations } = useQuery({
    queryKey: ['/api/correlations'],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Refresh market data mutation
  const refreshMarketData = useMutation({
    mutationFn: () => apiRequest('POST', '/api/market/refresh'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cryptocurrencies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({
        title: "Market Data Refreshed",
        description: "Latest cryptocurrency data has been fetched",
      });
    },
    onError: (error) => {
      console.error('Failed to refresh market data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh market data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update market data when WebSocket message is received
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'marketUpdate') {
      setMarketData(lastMessage.data);
    }
  }, [lastMessage]);

  // Set initial market data from queries
  useEffect(() => {
    if (cryptocurrencies || opportunities || correlations) {
      setMarketData({
        cryptocurrencies: cryptocurrencies || [],
        opportunities: opportunities || [],
        correlations: correlations || [],
      });
    }
  }, [cryptocurrencies, opportunities, correlations]);

  return {
    marketData,
    isConnected,
    lastUpdate,
    refreshMarketData: refreshMarketData.mutate,
    isRefreshing: refreshMarketData.isPending,
  };
}
