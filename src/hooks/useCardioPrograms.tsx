import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { GeneratedCardioProgram } from '@/lib/cardioTypes';

export interface CardioProgram {
  id: string;
  user_id: string;
  name: string;
  overview: string | null;
  program_data: GeneratedCardioProgram;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  started_at: string | null;
  current_week: number;
  current_day: number;
}

export function useCardioPrograms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: programs, isLoading } = useQuery({
    queryKey: ['cardio-programs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('cardio_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(row => ({
        ...row,
        program_data: row.program_data as unknown as GeneratedCardioProgram,
        current_week: row.current_week ?? 1,
        current_day: row.current_day ?? 1,
      })) as CardioProgram[];
    },
    enabled: !!user,
  });

  const saveProgram = useMutation({
    mutationFn: async (program: GeneratedCardioProgram) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('cardio_programs')
        .insert([{
          user_id: user.id,
          name: program.programName,
          overview: program.overview,
          program_data: JSON.parse(JSON.stringify(program)),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
      toast({ title: 'Programme Saved', description: 'Your cardio programme has been saved.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteProgram = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from('cardio_programs')
        .delete()
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-programs'] });
      toast({ title: 'Programme Deleted' });
    },
  });

  return {
    programs,
    isLoading,
    saveProgram,
    deleteProgram,
  };
}
