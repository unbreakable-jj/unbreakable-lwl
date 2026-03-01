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
      return data as (SavedFood & { quantity_remaining?: number | null; quantity_unit?: string | null })[];
    },
    enabled: !!user,
  });

  const favourites = savedFoods?.filter((f) => f.is_favourite) || [];
  const recents = savedFoods?.slice(0, 10) || [];

  const saveFood = useMutation({
    mutationFn: async (food: Omit<SavedFood, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'use_count' | 'last_used_at'> & { quantity_remaining?: number; quantity_unit?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const existing = savedFoods?.find(
        (f) => f.food_name.toLowerCase() === food.food_name.toLowerCase() && f.brand === food.brand
      );

      if (existing) {
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

      const { quantity_remaining, quantity_unit, ...rest } = food;
      const insertData: any = {
        user_id: user.id,
        use_count: 1,
        last_used_at: new Date().toISOString(),
        ...rest,
      };
      if (quantity_remaining != null) insertData.quantity_remaining = quantity_remaining;
      if (quantity_unit) insertData.quantity_unit = quantity_unit;

      const { data, error } = await supabase
        .from('saved_foods')
        .insert(insertData)
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

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity_remaining }: { id: string; quantity_remaining: number | null }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('saved_foods')
        .update({ quantity_remaining } as any)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-foods'] });
    },
  });

  const depleteFoods = useMutation({
    mutationFn: async (depletions: { foodId: string; newRemaining: number | null }[]) => {
      if (!user) throw new Error('Not authenticated');
      
      for (const d of depletions) {
        await supabase
          .from('saved_foods')
          .update({ quantity_remaining: d.newRemaining } as any)
          .eq('id', d.foodId)
          .eq('user_id', user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-foods'] });
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
    updateQuantity,
    depleteFoods,
  };
}
