import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface FoodSearchResult {
  barcode?: string;
  name: string;
  brand?: string;
  servingSize: string;
  servingQuantityG?: number;
  hasServingData: boolean;
  per100g: NutritionValues;
  perServing: NutritionValues;
  // Legacy fields for backward compatibility
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  imageUrl?: string;
  source: 'api' | 'user_library';
}

export function useFoodSearch() {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FoodSearchResult[]>([]);

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }, []);

  const searchFoods = useCallback(async (query: string): Promise<FoodSearchResult[]> => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return [];
    }

    if (!user) {
      toast.error('Please sign in to search foods');
      return [];
    }

    setIsSearching(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/food-lookup`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'search',
            query,
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      return data.results || [];
    } catch (error) {
      console.error('Food search error:', error);
      toast.error(error instanceof Error ? error.message : 'Search failed. Try again.');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [user, getAuthHeaders]);
  const lookupBarcode = useCallback(async (barcode: string): Promise<FoodSearchResult | null> => {
    if (!barcode.trim()) return null;

    if (!user) {
      toast.error('Please sign in to scan barcodes');
      return null;
    }

    setIsSearching(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/food-lookup`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'barcode',
            barcode,
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Barcode lookup failed');
      }

      const data = await response.json();
      
      if (data.found && data.result) {
        return data.result;
      }
      
      return null;
    } catch (error) {
      console.error('Barcode lookup error:', error);
      toast.error(error instanceof Error ? error.message : 'Could not find product. Try manual entry.');
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [user, getAuthHeaders]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    searchFoods,
    lookupBarcode,
    clearResults,
    results,
    isSearching,
  };
}
