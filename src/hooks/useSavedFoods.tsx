import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { SavedFood } from '@/lib/fuelTypes';

export function useSavedFoods() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedFoods, isLoading } = useQuery({
    queryKey: ['saved-foods', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('saved_foods')
        .select('*')
        .eq('user_id', user.id)
        .order('use_count', { ascending: false });

      if (error) throw error;
      return data as SavedFood[];
    },
    enabled: !!user,
  });

  const favourites = savedFoods?.filter((f) => f.is_favourite) || [];
  const recents = savedFoods?.slice(0, 10) || [];

  const saveFood = useMutation({
    mutationFn: async (food: Omit<SavedFood, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'use_count' | 'last_used_at'>) => {
      if (!user) throw new Error('Not authenticated');

      // Check if food with same name already exists
      const existing = savedFoods?.find(
        (f) => f.food_name.toLowerCase() === food.food_name.toLowerCase() && f.brand === food.brand
      );

      if (existing) {
        // Update use count
        const { data, error } = await supabase
          .from('saved_foods')
          .update({
            use_count: (existing.use_count || 0) + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('saved_foods')
        .insert({
          user_id: user.id,
          use_count: 1,
          last_used_at: new Date().toISOString(),
          ...food,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-foods'] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const toggleFavourite = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const food = savedFoods?.find((f) => f.id === id);
      if (!food) throw new Error('Food not found');

      const { data, error } = await supabase
        .from('saved_foods')
        .update({ is_favourite: !food.is_favourite })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saved-foods'] });
      toast.success(data.is_favourite ? 'Added to favourites' : 'Removed from favourites');
    },
    onError: (error) => {
      toast.error('Failed to update favourite');
      console.error(error);
    },
  });

  const deleteFood = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_foods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-foods'] });
      toast.success('Food deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete food');
      console.error(error);
    },
  });

  return {
    savedFoods,
    favourites,
    recents,
    isLoading,
    saveFood,
    toggleFavourite,
    deleteFood,
  };
}
