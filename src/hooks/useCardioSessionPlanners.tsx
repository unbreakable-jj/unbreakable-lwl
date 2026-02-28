import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CardioSessionPlanner {
  id: string;
  user_id: string;
  program_id: string | null;
  week_number: number;
  day_number: number;
  scheduled_date: string | null;
  session_type: string;
  planned_session: any;
  warmup: string | null;
  cooldown: string | null;
  notes: string | null;
  status: 'pending' | 'completed' | 'skipped';
  duration_minutes: number | null;
  distance_km: number | null;
  actual_duration_minutes: number | null;
  actual_distance_km: number | null;
  created_at: string;
  updated_at: string;
}

export function useCardioSessionPlanners(programId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: planners, isLoading } = useQuery({
    queryKey: ['cardio-session-planners', user?.id, programId],
    queryFn: async () => {
      if (!user || !programId) return [];

      const { data, error } = await supabase
        .from('cardio_session_planners')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .order('week_number', { ascending: true })
        .order('day_number', { ascending: true });

      if (error) throw error;
      return (data || []) as CardioSessionPlanner[];
    },
    enabled: !!user && !!programId,
  });

  const markComplete = useMutation({
    mutationFn: async ({ plannerId, actualDuration, actualDistance }: {
      plannerId: string;
      actualDuration?: number;
      actualDistance?: number;
    }) => {
      const updates: Record<string, unknown> = { status: 'completed' };
      if (actualDuration !== undefined) updates.actual_duration_minutes = actualDuration;
      if (actualDistance !== undefined) updates.actual_distance_km = actualDistance;

      const { error } = await supabase
        .from('cardio_session_planners')
        .update(updates)
        .eq('id', plannerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
    },
  });

  const markSkipped = useMutation({
    mutationFn: async (plannerId: string) => {
      const { error } = await supabase
        .from('cardio_session_planners')
        .update({ status: 'skipped' })
        .eq('id', plannerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
    },
  });

  const swapSession = useMutation({
    mutationFn: async ({ plannerId, newSession }: {
      plannerId: string;
      newSession: {
        sessionType: string;
        mainSession: any[];
        warmup: string;
        cooldown: string;
      };
    }) => {
      const { error } = await supabase
        .from('cardio_session_planners')
        .update({
          session_type: newSession.sessionType,
          planned_session: JSON.parse(JSON.stringify({
            ...newSession,
            sessionType: newSession.sessionType,
          })),
          warmup: newSession.warmup,
          cooldown: newSession.cooldown,
        })
        .eq('id', plannerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
    },
  });

  const applyProgression = useMutation({
    mutationFn: async (updates: Array<{
      plannerId: string;
      sessionType?: string;
      mainSession?: any[];
      duration?: string;
    }>) => {
      for (const update of updates) {
        const updateData: Record<string, unknown> = {};
        if (update.sessionType) updateData.session_type = update.sessionType;
        if (update.mainSession) {
          updateData.planned_session = JSON.parse(JSON.stringify({
            sessionType: update.sessionType,
            mainSession: update.mainSession,
            duration: update.duration,
          }));
        }
        
        const { error } = await supabase
          .from('cardio_session_planners')
          .update(updateData)
          .eq('id', update.plannerId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardio-session-planners'] });
    },
  });

  return {
    planners,
    isLoading,
    markComplete,
    markSkipped,
    swapSession,
    applyProgression,
  };
}
