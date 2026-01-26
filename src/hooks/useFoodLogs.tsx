import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FoodLog, MealType, DailyNutritionSummary } from '@/lib/fuelTypes';
import { startOfDay, endOfDay, format } from 'date-fns';

export function useFoodLogs(date?: Date) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetDate = date || new Date();

  const { data: foodLogs, isLoading } = useQuery({
    queryKey: ['food-logs', user?.id, format(targetDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay(targetDate).toISOString())
        .lte('logged_at', endOfDay(targetDate).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as FoodLog[];
    },
    enabled: !!user,
  });

  const dailySummary: DailyNutritionSummary = {
    date: format(targetDate, 'yyyy-MM-dd'),
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    },
  };

  if (foodLogs) {
    foodLogs.forEach((log) => {
      const calories = (log.calories || 0) * (log.servings || 1);
      const protein = (log.protein_g || 0) * (log.servings || 1);
      const carbs = (log.carbs_g || 0) * (log.servings || 1);
      const fat = (log.fat_g || 0) * (log.servings || 1);

      dailySummary.totalCalories += calories;
      dailySummary.totalProtein += protein;
      dailySummary.totalCarbs += carbs;
      dailySummary.totalFat += fat;
      dailySummary.meals[log.meal_type as MealType].push(log);
    });
  }

  const addFoodLog = useMutation({
    mutationFn: async (food: Omit<FoodLog, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          ...food,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-logs'] });
      toast.success('Food logged successfully');
    },
    onError: (error) => {
      toast.error('Failed to log food');
      console.error(error);
    },
  });

  const updateFoodLog = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FoodLog> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('food_logs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-logs'] });
      toast.success('Food log updated');
    },
    onError: (error) => {
      toast.error('Failed to update food log');
      console.error(error);
    },
  });

  const deleteFoodLog = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-logs'] });
      toast.success('Food log deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete food log');
      console.error(error);
    },
  });

  return {
    foodLogs,
    dailySummary,
    isLoading,
    addFoodLog,
    updateFoodLog,
    deleteFoodLog,
  };
}
