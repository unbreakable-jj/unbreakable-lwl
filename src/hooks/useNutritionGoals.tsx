import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { NutritionGoals } from '@/lib/fuelTypes';

export function useNutritionGoals() {
  const { user } = useAuth();
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
      return data as NutritionGoals | null;
    },
    enabled: !!user,
  });

  const saveGoals = useMutation({
    mutationFn: async (newGoals: Omit<NutritionGoals, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');

      if (goals) {
        // Update existing
        const { data, error } = await supabase
          .from('nutrition_goals')
          .update(newGoals)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
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
    goals,
    isLoading,
    saveGoals,
  };
}
