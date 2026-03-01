import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Json } from '@/integrations/supabase/types';

export interface PlannedExercise {
  name: string;
  equipment: string;
  sets: number;
  reps: string;
  intensity: string;
  rest: string;
  notes?: string;
}

export interface SessionPlanner {
  id: string;
  user_id: string;
  program_id: string | null;
  week_number: number;
  day_number: number;
  scheduled_date: string | null;
  session_type: string;
  planned_exercises: PlannedExercise[];
  warmup: string | null;
  cooldown: string | null;
  notes: string | null;
  status: 'pending' | 'completed' | 'skipped';
  created_at: string;
  updated_at: string;
}

function toSessionPlanner(row: any): SessionPlanner {
  return {
    ...row,
    planned_exercises: row.planned_exercises as PlannedExercise[],
    status: row.status as 'pending' | 'completed' | 'skipped',
  };
}

export function useSessionPlanners(programId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: planners, isLoading } = useQuery({
    queryKey: ['session-planners', user?.id, programId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('session_planners')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true });
      
      if (programId) {
        query = query.eq('program_id', programId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(toSessionPlanner);
    },
    enabled: !!user,
  });

  const generatePlanners = useMutation({
    mutationFn: async ({ 
      programId, 
      programData,
      startDate 
    }: { 
      programId: string; 
      programData: any;
      startDate?: Date;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      const plannerEntries: any[] = [];
      const templateDays = programData.templateWeek?.days || programData.weeks?.[0]?.days || [];
      const start = startDate || new Date();
      
      // Generate 12 weeks of planners — only training days, skip rest days
      // Each training day advances the calendar sequentially from start date
      const trainingDays = templateDays.filter((day: any) => {
        const type = (day.sessionType || '').toLowerCase();
        return type !== 'rest' && type !== 'off' && type !== 'recovery';
      });
      
      let currentDate = new Date(start);
      for (let week = 1; week <= 12; week++) {
        trainingDays.forEach((day: any, dayIndex: number) => {
          const scheduledDate = new Date(currentDate);
          scheduledDate.setDate(scheduledDate.getDate() + dayIndex);
          
          plannerEntries.push({
            user_id: user.id,
            program_id: programId,
            week_number: week,
            day_number: dayIndex + 1,
            scheduled_date: scheduledDate.toISOString().split('T')[0],
            session_type: day.sessionType,
            planned_exercises: day.exercises.map((ex: any) => ({
              name: ex.name,
              equipment: ex.equipment,
              sets: typeof ex.sets === 'number' ? ex.sets : parseInt(String(ex.sets)) || 3,
              reps: ex.reps,
              intensity: ex.intensity,
              rest: ex.rest,
              notes: ex.notes,
            })) as unknown as Json,
            warmup: day.warmup,
            cooldown: day.cooldown,
            status: 'pending',
          });
        });
        // Advance currentDate by 7 days for the next week
        currentDate.setDate(currentDate.getDate() + 7);
      }
      
      const { error } = await supabase
        .from('session_planners')
        .insert(plannerEntries);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-planners'] });
      toast({ title: 'Session Planners Generated', description: 'Your weekly schedule is ready!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updatePlanner = useMutation({
    mutationFn: async ({ 
      plannerId, 
      updates 
    }: { 
      plannerId: string; 
      updates: { notes?: string; status?: string; scheduled_date?: string };
    }) => {
      const { error } = await supabase
        .from('session_planners')
        .update(updates)
        .eq('id', plannerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-planners'] });
    },
  });

  const markComplete = useMutation({
    mutationFn: async (plannerId: string) => {
      const { error } = await supabase
        .from('session_planners')
        .update({ status: 'completed' })
        .eq('id', plannerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-planners'] });
    },
  });

  const markSkipped = useMutation({
    mutationFn: async (plannerId: string) => {
      const { error } = await supabase
        .from('session_planners')
        .update({ status: 'skipped' })
        .eq('id', plannerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-planners'] });
    },
  });

  return {
    planners,
    isLoading,
    generatePlanners,
    updatePlanner,
    markComplete,
    markSkipped,
  };
}