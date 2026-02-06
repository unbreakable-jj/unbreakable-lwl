import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNutritionGoals } from '@/hooks/useNutritionGoals';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FoodItem {
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  ingredients?: string;
  servingSize?: string;
}

interface FeedbackResult {
  analysis: string;
  itemName: string;
  timestamp: string;
}

export function useNutritionFeedback() {
  const { user } = useAuth();
  const { goals } = useNutritionGoals();
  const { dailySummary } = useFoodLogs();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const analyzeFood = useCallback(async (
    type: 'barcode' | 'food_log' | 'recipe' | 'daily_summary',
    item: FoodItem
  ): Promise<FeedbackResult | null> => {
    if (!user) {
      toast({ title: 'Sign in required', variant: 'destructive' });
      return null;
    }

    setIsAnalyzing(true);

    try {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

      const userContext = {
        dailyGoals: goals ? {
          calories: goals.daily_calories || 2000,
          protein: goals.daily_protein_g || 150,
          carbs: goals.daily_carbs_g || 200,
          fat: goals.daily_fat_g || 70,
        } : undefined,
        currentIntake: {
          calories: Math.round(dailySummary.totalCalories),
          protein: Math.round(dailySummary.totalProtein),
          carbs: Math.round(dailySummary.totalCarbs),
          fat: Math.round(dailySummary.totalFat),
        },
        timeOfDay,
      };

      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-nutrition`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type,
            item,
            userContext,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Nutrition analysis error:', error);
      toast({
        title: 'Analysis Error',
        description: error instanceof Error ? error.message : 'Could not analyze food',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, goals, dailySummary, getAuthHeaders]);

  const analyzeDailySummary = useCallback(async (): Promise<FeedbackResult | null> => {
    return analyzeFood('daily_summary', {
      name: 'Daily Nutrition Summary',
      calories: Math.round(dailySummary.totalCalories),
      protein: Math.round(dailySummary.totalProtein),
      carbs: Math.round(dailySummary.totalCarbs),
      fat: Math.round(dailySummary.totalFat),
    });
  }, [analyzeFood, dailySummary]);

  return {
    analyzeFood,
    analyzeDailySummary,
    isAnalyzing,
  };
}
