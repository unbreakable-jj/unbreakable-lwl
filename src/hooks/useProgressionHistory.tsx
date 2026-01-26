import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProgressionEntry {
  id: string;
  user_id: string;
  exercise_name: string;
  previous_weight_kg: number | null;
  new_weight_kg: number | null;
  previous_reps: number | null;
  new_reps: number | null;
  adjustment_reason: string | null;
  adjustment_type: 'increase' | 'decrease' | 'maintain' | 'deload' | null;
  recorded_at: string;
}

export interface ExerciseProgression {
  exerciseName: string;
  currentWeight: number;
  currentReps: number;
  suggestedWeight: number;
  suggestedReps: number;
  adjustmentType: 'increase' | 'decrease' | 'maintain' | 'deload';
  reason: string;
}

export function useProgressionHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ['progression-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('progression_history')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as ProgressionEntry[];
    },
    enabled: !!user,
  });

  const recordProgression = useMutation({
    mutationFn: async (entry: Omit<ProgressionEntry, 'id' | 'user_id' | 'recorded_at'>) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('progression_history')
        .insert({
          user_id: user.id,
          ...entry,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progression-history'] });
    },
  });

  // Calculate suggested progression based on logged data
  const calculateProgression = (
    exerciseName: string,
    lastSets: { reps: number; weight: number; rpe?: number }[]
  ): ExerciseProgression => {
    const avgReps = lastSets.reduce((sum, s) => sum + s.reps, 0) / lastSets.length;
    const avgWeight = lastSets.reduce((sum, s) => sum + s.weight, 0) / lastSets.length;
    const avgRpe = lastSets.filter(s => s.rpe).reduce((sum, s) => sum + (s.rpe || 0), 0) / 
                  lastSets.filter(s => s.rpe).length || 7;
    
    let adjustmentType: 'increase' | 'decrease' | 'maintain' | 'deload' = 'maintain';
    let suggestedWeight = avgWeight;
    let suggestedReps = Math.round(avgReps);
    let reason = '';
    
    // PT Distinction-style progression logic
    if (avgRpe < 7 && avgReps >= 10) {
      // Increase weight if RPE is low and hitting rep targets
      adjustmentType = 'increase';
      suggestedWeight = Math.round((avgWeight * 1.025) / 2.5) * 2.5; // Round to nearest 2.5kg
      reason = 'RPE below 7 with good rep performance - increase load';
    } else if (avgRpe > 9 || avgReps < 6) {
      // Decrease if struggling
      adjustmentType = 'decrease';
      suggestedWeight = Math.round((avgWeight * 0.95) / 2.5) * 2.5;
      reason = 'High RPE or missed reps - reduce load for recovery';
    } else if (avgRpe >= 7 && avgRpe <= 8.5) {
      // Maintain if in optimal range
      adjustmentType = 'maintain';
      reason = 'Good RPE range - maintain current load';
    }
    
    return {
      exerciseName,
      currentWeight: avgWeight,
      currentReps: Math.round(avgReps),
      suggestedWeight,
      suggestedReps,
      adjustmentType,
      reason,
    };
  };

  // Get exercise-specific progression history
  const getExerciseHistory = (exerciseName: string): ProgressionEntry[] => {
    return (history || []).filter(h => h.exercise_name === exerciseName);
  };

  return {
    history,
    isLoading,
    recordProgression,
    calculateProgression,
    getExerciseHistory,
  };
}