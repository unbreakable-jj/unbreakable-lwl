import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { GeneratedProgram } from '@/lib/programTypes';
import { Json } from '@/integrations/supabase/types';

export interface TrainingProgram {
  id: string;
  user_id: string;
  name: string;
  overview: string | null;
  program_data: GeneratedProgram;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  started_at: string | null;
  current_week: number;
  current_day: number;
}

// Helper to convert DB row to typed TrainingProgram
function toTrainingProgram(row: {
  id: string;
  user_id: string;
  name: string;
  overview: string | null;
  program_data: Json;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  started_at: string | null;
  current_week: number | null;
  current_day: number | null;
}): TrainingProgram {
  return {
    ...row,
    program_data: row.program_data as unknown as GeneratedProgram,
    current_week: row.current_week ?? 1,
    current_day: row.current_day ?? 1,
  };
}

export function useTrainingPrograms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: programs, isLoading } = useQuery({
    queryKey: ['training-programs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(toTrainingProgram);
    },
    enabled: !!user,
  });

  const { data: activeProgram } = useQuery({
    queryKey: ['active-program', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data ? toTrainingProgram(data) : null;
    },
    enabled: !!user,
  });

  const saveProgram = useMutation({
    mutationFn: async (program: GeneratedProgram) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('training_programs')
        .insert([{
          user_id: user.id,
          name: program.programName,
          overview: program.overview,
          program_data: program as unknown as Json,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      toast({ title: 'Program Saved', description: 'Your training program has been saved to your profile.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const activateProgram = useMutation({
    mutationFn: async (programId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      // Deactivate all other programs first
      await supabase
        .from('training_programs')
        .update({ is_active: false })
        .eq('user_id', user.id);
      
      // Activate the selected program
      const { error } = await supabase
        .from('training_programs')
        .update({ is_active: true, started_at: new Date().toISOString() })
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-program'] });
      toast({ title: 'Program Activated', description: 'This is now your active training program.' });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ programId, week, day }: { programId: string; week: number; day: number }) => {
      const { error } = await supabase
        .from('training_programs')
        .update({ current_week: week, current_day: day })
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-program'] });
    },
  });

  const deleteProgram = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from('training_programs')
        .delete()
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-program'] });
      toast({ title: 'Program Deleted' });
    },
  });

  return {
    programs,
    activeProgram,
    isLoading,
    saveProgram,
    activateProgram,
    updateProgress,
    deleteProgram,
  };
}
