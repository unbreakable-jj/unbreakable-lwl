import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { GeneratedProgram } from '@/lib/programTypes';
import { Json } from '@/integrations/supabase/types';

export type ProgramStatus = 'not_started' | 'active' | 'completed' | 'paused';

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
  status: ProgramStatus;
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
  // Derive status from is_active and started_at
  let status: ProgramStatus = 'not_started';
  if (row.is_active) {
    status = 'active';
  } else if (row.started_at) {
    status = 'completed'; // Was started but no longer active
  }
  
  return {
    ...row,
    program_data: row.program_data as unknown as GeneratedProgram,
    current_week: row.current_week ?? 1,
    current_day: row.current_day ?? 1,
    status,
  };
}

const MAX_ACTIVE_PROGRAMS = 3;

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

  const { data: activePrograms } = useQuery({
    queryKey: ['active-programs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return (data || []).map(toTrainingProgram);
    },
    enabled: !!user,
  });

  // Legacy: single active program (first one)
  const activeProgram = activePrograms?.[0] ?? null;
  const activeProgramCount = activePrograms?.length ?? 0;
  const canActivateMore = activeProgramCount < MAX_ACTIVE_PROGRAMS;

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
          is_active: false, // Always start as not active
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      toast({ 
        title: 'Programme Saved', 
        description: 'Your programme has been saved to My Programmes with status "Not Started".' 
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const activateProgram = useMutation({
    mutationFn: async (programId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      // Check current active count
      const { data: currentActive, error: countError } = await supabase
        .from('training_programs')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (countError) throw countError;
      
      // Check if this program is already active
      const isAlreadyActive = currentActive?.some(p => p.id === programId);
      
      if (!isAlreadyActive && (currentActive?.length ?? 0) >= MAX_ACTIVE_PROGRAMS) {
        throw new Error(`Maximum ${MAX_ACTIVE_PROGRAMS} active programmes allowed. Please deactivate one first.`);
      }
      
      // Activate the selected program
      const { error } = await supabase
        .from('training_programs')
        .update({ 
          is_active: true, 
          started_at: new Date().toISOString(),
          current_week: 1,
          current_day: 1,
        })
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      toast({ title: 'Programme Activated', description: 'This programme is now active and ready for tracking.' });
    },
    onError: (error) => {
      toast({ title: 'Cannot Activate', description: error.message, variant: 'destructive' });
    },
  });

  const deactivateProgram = useMutation({
    mutationFn: async (programId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('training_programs')
        .update({ is_active: false })
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      toast({ title: 'Programme Paused', description: 'Programme has been deactivated.' });
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
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
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
      queryClient.invalidateQueries({ queryKey: ['active-programs'] });
      toast({ title: 'Programme Deleted' });
    },
  });

  return {
    programs,
    activeProgram,
    activePrograms,
    activeProgramCount,
    canActivateMore,
    maxActivePrograms: MAX_ACTIVE_PROGRAMS,
    isLoading,
    saveProgram,
    activateProgram,
    deactivateProgram,
    updateProgress,
    deleteProgram,
  };
}
