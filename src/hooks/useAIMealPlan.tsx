import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNutritionGoals } from '@/hooks/useNutritionGoals';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface MealPlanDay {
  dayNumber: number;
  dayName: string;
  isTrainingDay: boolean;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: {
    breakfast: MealItem;
    lunch: MealItem;
    dinner: MealItem;
    snacks: MealItem[];
  };
}

interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepNotes?: string;
}

interface GeneratedMealPlan {
  planName: string;
  overview: string;
  weeklyCalories: number;
  weeklyProtein: number;
  days: MealPlanDay[];
  shoppingList: string[];
  mealPrepTips: string[];
  coachNotes: string;
}

interface MealPlanResult {
  type: 'plan' | 'suggestions';
  plan?: GeneratedMealPlan;
  content?: string;
  savedToHub?: boolean;
  planId?: string;
  message?: string;
}

// Keywords that indicate a meal plan request
const MEAL_PLAN_KEYWORDS = [
  'meal plan',
  'build me a meal',
  'create a meal plan',
  'weekly meal',
  'nutrition plan',
  'eating plan',
  'diet plan',
  'food plan',
  'what should i eat',
  'plan my meals',
  'help me eat',
  'nutrition for',
  'macros for the week',
  'weekly menu',
  'prep my meals',
];

export function useAIMealPlan() {
  const { user } = useAuth();
  const { goals } = useNutritionGoals();
  const { sessions } = useWorkoutSessions();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const detectMealPlanRequest = useCallback((message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return MEAL_PLAN_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  }, []);

  const generateMealPlan = useCallback(async (
    prompt: string,
    requestType: 'full_plan' | 'suggestions' = 'full_plan',
    additionalContext?: { chatContext?: string }
  ): Promise<MealPlanResult | null> => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to generate a meal plan.', variant: 'destructive' });
      return null;
    }

    setIsGenerating(true);

    try {
      // Calculate weekly workout load from recent sessions
      const recentSessions = sessions?.filter(s => {
        const sessionDate = new Date(s.started_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
      }) || [];

      // Calculate average duration in minutes from seconds
      const avgDurationMins = recentSessions.length > 0 
        ? Math.round(recentSessions.reduce((sum, s) => sum + ((s.duration_seconds || 3600) / 60), 0) / recentSessions.length)
        : 60;

      const userContext = {
        userId: user.id,
        goals: goals ? {
          dailyCalories: goals.daily_calories,
          dailyProtein: goals.daily_protein_g,
          dailyCarbs: goals.daily_carbs_g,
          dailyFat: goals.daily_fat_g,
        } : undefined,
        trainingLoad: {
          weeklyWorkouts: recentSessions.length,
          avgDuration: avgDurationMins,
        },
        chatContext: additionalContext?.chatContext,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-meal-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            userContext,
            prompt,
            requestType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate meal plan');
      }

      const result: MealPlanResult = await response.json();

      // Refresh meal plans in cache
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });

      if (result.savedToHub) {
        toast({
          title: 'Meal Plan Created!',
          description: result.message || `Your meal plan is ready in your Fuel hub.`,
        });
      }

      return result;
    } catch (error) {
      console.error('Meal plan generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate meal plan',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, goals, sessions, queryClient]);

  return {
    generateMealPlan,
    detectMealPlanRequest,
    isGenerating,
  };
}
