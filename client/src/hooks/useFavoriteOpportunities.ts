import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

export function useFavoriteOpportunities(userId: number = 1) {
  const [favoriteOpportunities, setFavoriteOpportunities] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's favorite opportunities
  const { data: favorites } = useQuery({
    queryKey: ['/api/favorite-opportunities', userId],
    queryFn: () => apiRequest('GET', `/api/favorite-opportunities/${userId}`),
    refetchInterval: 30000,
  });

  // Update local state when favorites change
  useEffect(() => {
    if (favorites) {
      const favoriteIds = new Set(favorites.map((fav: any) => fav.id));
      setFavoriteOpportunities(favoriteIds);
    }
  }, [favorites]);

  // Add favorite opportunity mutation
  const addFavorite = useMutation({
    mutationFn: (opportunityId: number) => 
      apiRequest('POST', '/api/favorite-opportunities', { userId, opportunityId }),
    onSuccess: (data, opportunityId) => {
      setFavoriteOpportunities(prev => new Set(prev).add(opportunityId));
      queryClient.invalidateQueries({ queryKey: ['/api/favorite-opportunities', userId] });
      toast({
        title: "Trade Starred",
        description: "Trading opportunity added to your personal dashboard",
      });
    },
    onError: (error) => {
      console.error('Failed to add favorite opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to star trading opportunity",
        variant: "destructive",
      });
    },
  });

  // Remove favorite opportunity mutation
  const removeFavorite = useMutation({
    mutationFn: (opportunityId: number) => 
      apiRequest('DELETE', `/api/favorite-opportunities/${userId}/${opportunityId}`),
    onSuccess: (data, opportunityId) => {
      setFavoriteOpportunities(prev => {
        const updated = new Set(prev);
        updated.delete(opportunityId);
        return updated;
      });
      queryClient.invalidateQueries({ queryKey: ['/api/favorite-opportunities', userId] });
      toast({
        title: "Trade Unstarred",
        description: "Trading opportunity removed from your personal dashboard",
      });
    },
    onError: (error) => {
      console.error('Failed to remove favorite opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to unstar trading opportunity",
        variant: "destructive",
      });
    },
  });

  const toggleFavorite = (opportunityId: number) => {
    if (favoriteOpportunities.has(opportunityId)) {
      removeFavorite.mutate(opportunityId);
    } else {
      addFavorite.mutate(opportunityId);
    }
  };

  const isFavorite = (opportunityId: number) => favoriteOpportunities.has(opportunityId);

  return {
    favorites: favorites || [],
    favoriteOpportunities,
    isFavorite,
    toggleFavorite,
    isLoading: addFavorite.isPending || removeFavorite.isPending,
  };
}