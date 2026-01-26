import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MealPlan, MealPlanItem } from '@/lib/fuelTypes';

export function useMealPlans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: mealPlans, isLoading } = useQuery({
    queryKey: ['meal-plans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MealPlan[];
    },
    enabled: !!user,
  });

  const activePlan = mealPlans?.find((p) => p.is_active);

  const { data: planItems } = useQuery({
    queryKey: ['meal-plan-items', activePlan?.id],
    queryFn: async () => {
      if (!activePlan) return [];
      
      const { data, error } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', activePlan.id)
        .order('day_of_week', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as MealPlanItem[];
    },
    enabled: !!activePlan,
  });

  const createMealPlan = useMutation({
    mutationFn: async (plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          ...plan,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan created');
    },
    onError: (error) => {
      toast.error('Failed to create meal plan');
      console.error(error);
    },
  });

  const updateMealPlan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MealPlan> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan updated');
    },
    onError: (error) => {
      toast.error('Failed to update meal plan');
      console.error(error);
    },
  });

  const setActivePlan = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      // Deactivate all plans first
      await supabase
        .from('meal_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate the selected plan
      const { data, error } = await supabase
        .from('meal_plans')
        .update({ is_active: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Active meal plan updated');
    },
    onError: (error) => {
      toast.error('Failed to set active plan');
      console.error(error);
    },
  });

  const deleteMealPlan = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete meal plan');
      console.error(error);
    },
  });

  const addPlanItem = useMutation({
    mutationFn: async (item: Omit<MealPlanItem, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meal_plan_items')
        .insert({
          user_id: user.id,
          ...item,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan-items'] });
    },
    onError: (error) => {
      toast.error('Failed to add item');
      console.error(error);
    },
  });

  const deletePlanItem = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('meal_plan_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan-items'] });
    },
    onError: (error) => {
      toast.error('Failed to remove item');
      console.error(error);
    },
  });

  return {
    mealPlans,
    activePlan,
    planItems,
    isLoading,
    createMealPlan,
    updateMealPlan,
    setActivePlan,
    deleteMealPlan,
    addPlanItem,
    deletePlanItem,
  };
}
