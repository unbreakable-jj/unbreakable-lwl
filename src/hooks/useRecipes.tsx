import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Recipe, RecipeIngredient } from '@/lib/fuelTypes';

export function useRecipes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .or(`user_id.eq.${user?.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Recipe[];
    },
    enabled: !!user,
  });

  const myRecipes = recipes?.filter((r) => r.user_id === user?.id) || [];
  const publicRecipes = recipes?.filter((r) => r.is_public && r.user_id !== user?.id) || [];
  const favouriteRecipes = recipes?.filter((r) => r.is_favourite) || [];

  const createRecipe = useMutation({
    mutationFn: async (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          ...recipe,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe created');
    },
    onError: (error) => {
      toast.error('Failed to create recipe');
      console.error(error);
    },
  });

  const updateRecipe = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Recipe> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe updated');
    },
    onError: (error) => {
      toast.error('Failed to update recipe');
      console.error(error);
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete recipe');
      console.error(error);
    },
  });

  const toggleFavourite = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const recipe = recipes?.find((r) => r.id === id);
      if (!recipe) throw new Error('Recipe not found');

      const { data, error } = await supabase
        .from('recipes')
        .update({ is_favourite: !recipe.is_favourite })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success(data.is_favourite ? 'Added to favourites' : 'Removed from favourites');
    },
    onError: (error) => {
      toast.error('Failed to update favourite');
      console.error(error);
    },
  });

  return {
    recipes,
    myRecipes,
    publicRecipes,
    favouriteRecipes,
    isLoading,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavourite,
  };
}
