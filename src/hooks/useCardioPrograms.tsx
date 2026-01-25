import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { GeneratedCardioProgram } from '@/lib/cardioTypes';
import { Json } from '@/integrations/supabase/types';

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

// Helper to convert DB row to typed CardioProgram
function toCardioProgram(row: {
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
}): CardioProgram {
  return {
    ...row,
    program_data: row.program_data as unknown as GeneratedCardioProgram,
    current_week: row.current_week ?? 1,
    current_day: row.current_day ?? 1,
  };
}

export function useCardioPrograms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: programs, isLoading } = useQuery({
    queryKey: ['cardio-programs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Filter for cardio programs by checking program_data structure
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter for cardio programs (those with activityType in program_data)
      const cardioPrograms = (data || []).filter(p => {
        const programData = p.program_data as Record<string, unknown>;
        return programData && 'activityType' in programData;
      });
      
      return cardioPrograms.map(toCardioProgram);
    },
    enabled: !!user,
  });

  const saveProgram = useMutation({
    mutationFn: async (program: GeneratedCardioProgram) => {
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
        .from('training_programs')
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
