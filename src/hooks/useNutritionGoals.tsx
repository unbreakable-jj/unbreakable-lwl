import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCoachingProfile } from '@/hooks/useCoachingProfile';
import { toast } from 'sonner';
import { NutritionGoals } from '@/lib/fuelTypes';
import { useMemo } from 'react';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  type Gender,
  type ActivityLevel,
  type Goal,
  type MacroSplit,
} from '@/lib/fuelCalculations';

export interface NutritionGoalsWithMode extends NutritionGoals {
  goals_mode: 'auto' | 'manual';
  activity_level: string | null;
  macro_split: string | null;
}

// Map coaching profile nutrition_goal to calculator Goal type
function mapNutritionGoal(nutritionGoal: string | null): Goal {
  if (!nutritionGoal) return 'maintain';
  const lower = nutritionGoal.toLowerCase();
  if (lower.includes('lose') || lower.includes('cut') || lower.includes('fat loss')) return 'lose';
  if (lower.includes('build') || lower.includes('bulk') || lower.includes('gain') || lower.includes('muscle')) return 'build';
  if (lower.includes('recomp')) return 'recomp';
  return 'maintain';
}

// Map days_per_week to activity level
function mapActivityLevel(daysPerWeek: number | null): ActivityLevel {
  if (!daysPerWeek || daysPerWeek <= 1) return 'sedentary';
  if (daysPerWeek <= 3) return 'light';
  if (daysPerWeek <= 5) return 'moderate';
  if (daysPerWeek <= 6) return 'very';
  return 'extreme';
}

export function useNutritionGoals() {
  const { user } = useAuth();
  const { profile: coachingProfile } = useCoachingProfile();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['nutrition-goals', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as NutritionGoalsWithMode | null;
    },
    enabled: !!user,
  });

  // Auto-calculate goals from coaching profile when in auto mode
  const autoCalculatedGoals = useMemo(() => {
    if (!coachingProfile) return null;
    
    const { weight_kg, height_cm, age_years, gender } = coachingProfile;
    if (!weight_kg || !height_cm || !age_years) return null;
    
    const genderVal: Gender = gender?.toLowerCase() === 'female' ? 'female' : 'male';
    const activityLevel: ActivityLevel = (goals?.activity_level as ActivityLevel) || mapActivityLevel(coachingProfile.days_per_week);
    const goal = mapNutritionGoal(coachingProfile.nutrition_goal);
    const macroSplit: MacroSplit = (goals?.macro_split as MacroSplit) || 'high_protein';
    
    const bmr = calculateBMR(genderVal, weight_kg, height_cm, age_years);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros(targetCalories, macroSplit);
    
    return {
      daily_calories: Math.round(targetCalories),
      daily_protein_g: macros.protein,
      daily_carbs_g: macros.carbs,
      daily_fat_g: macros.fat,
    };
  }, [coachingProfile, goals?.activity_level, goals?.macro_split]);

  // Effective goals: use manual values if mode is manual, otherwise use auto-calculated
  const effectiveGoals = useMemo(() => {
    if (!goals && !autoCalculatedGoals) return null;
    
    const mode = goals?.goals_mode || 'auto';
    
    if (mode === 'manual' && goals) {
      return goals;
    }
    
    // Auto mode: use calculated values, falling back to stored values
    if (autoCalculatedGoals) {
      return {
        ...(goals || {}),
        daily_calories: autoCalculatedGoals.daily_calories,
        daily_protein_g: autoCalculatedGoals.daily_protein_g,
        daily_carbs_g: autoCalculatedGoals.daily_carbs_g,
        daily_fat_g: autoCalculatedGoals.daily_fat_g,
      } as NutritionGoalsWithMode;
    }
    
    return goals;
  }, [goals, autoCalculatedGoals]);

  const saveGoals = useMutation({
    mutationFn: async (newGoals: Partial<NutritionGoalsWithMode>) => {
      if (!user) throw new Error('Not authenticated');

      if (goals) {
        const { data, error } = await supabase
          .from('nutrition_goals')
          .update(newGoals)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('nutrition_goals')
          .insert({
            user_id: user.id,
            ...newGoals,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-goals'] });
      toast.success('Nutrition goals saved');
    },
    onError: (error) => {
      toast.error('Failed to save goals');
      console.error(error);
    },
  });

  return {
    goals: effectiveGoals,
    rawGoals: goals,
    autoCalculatedGoals,
    isLoading,
    saveGoals,
    isAutoMode: (goals?.goals_mode || 'auto') === 'auto',
  };
}