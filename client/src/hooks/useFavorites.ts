import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const DEMO_USER_ID = 1; // Using demo user for now

export interface FavoriteToken {
  id: number;
  symbol: string;
  name: string;
  currentPrice: string;
  priceChangePercentage24h: string;
  tier: string;
  favoriteId?: number;
}

export function useFavorites() {
  return useQuery<FavoriteToken[]>({
    queryKey: ['/api/favorites', DEMO_USER_ID],
    queryFn: () => apiRequest(`/api/favorites/${DEMO_USER_ID}`),
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cryptocurrencyId: number) => 
      apiRequest('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: DEMO_USER_ID, 
          cryptocurrencyId 
        })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', DEMO_USER_ID] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cryptocurrencyId: number) => 
      apiRequest(`/api/favorites/${DEMO_USER_ID}/${cryptocurrencyId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', DEMO_USER_ID] });
    },
  });
}

export function useIsFavorite(cryptocurrencyId: number) {
  return useQuery<{ isFavorite: boolean }>({
    queryKey: ['/api/favorites/check', DEMO_USER_ID, cryptocurrencyId],
    queryFn: () => apiRequest(`/api/favorites/check/${DEMO_USER_ID}/${cryptocurrencyId}`),
    enabled: !!cryptocurrencyId,
  });
}