import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ExerciseLog {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  equipment: string;
  set_number: number;
  target_reps: string | null;
  actual_reps: number | null;
  weight_kg: number | null;
  rpe: number | null;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  program_id: string | null;
  week_number: number;
  day_name: string;
  session_type: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  visibility: 'public' | 'friends' | 'private';
  comments_enabled: boolean;
  created_at: string;
  updated_at: string;
  exercise_logs?: ExerciseLog[];
}

export function useWorkoutSessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['workout-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*, exercise_logs(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkoutSession[];
    },
    enabled: !!user,
  });

  const { data: activeSession } = useQuery({
    queryKey: ['active-session', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*, exercise_logs(*)')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as WorkoutSession | null;
    },
    enabled: !!user,
  });

  const startSession = useMutation({
    mutationFn: async ({
      programId,
      weekNumber,
      dayName,
      sessionType,
      exercises,
    }: {
      programId?: string;
      weekNumber: number;
      dayName: string;
      sessionType: string;
      exercises: Array<{ name: string; equipment: string; sets: number; reps: string }>;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      // Create the session
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          program_id: programId || null,
          week_number: weekNumber,
          day_name: dayName,
          session_type: sessionType,
          status: 'in_progress',
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      // Create exercise logs for each set
      const exerciseLogs = exercises.flatMap((exercise) => {
        const numSets = typeof exercise.sets === 'number' ? exercise.sets : parseInt(String(exercise.sets)) || 3;
        return Array.from({ length: numSets }, (_, i) => ({
          session_id: session.id,
          user_id: user.id,
          exercise_name: exercise.name,
          equipment: exercise.equipment,
          set_number: i + 1,
          target_reps: exercise.reps,
          completed: false,
        }));
      });
      
      if (exerciseLogs.length > 0) {
        const { error: logsError } = await supabase
          .from('exercise_logs')
          .insert(exerciseLogs);
        
        if (logsError) throw logsError;
      }

      // Re-fetch the full session with its exercise logs so UIs can open immediately.
      const { data: fullSession, error: fullSessionError } = await supabase
        .from('workout_sessions')
        .select('*, exercise_logs(*)')
        .eq('id', session.id)
        .single();

      if (fullSessionError) throw fullSessionError;
      return fullSession as WorkoutSession;
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.setQueryData(['active-session', user.id], data);
      }
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast({ title: 'Workout Started', description: 'Good luck with your session!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateExerciseLog = useMutation({
    mutationFn: async ({
      logId,
      actualReps,
      weightKg,
      rpe,
      completed,
      notes,
    }: {
      logId: string;
      actualReps?: number;
      weightKg?: number;
      rpe?: number;
      completed?: boolean;
      notes?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (actualReps !== undefined) updates.actual_reps = actualReps;
      if (weightKg !== undefined) updates.weight_kg = weightKg;
      if (rpe !== undefined) updates.rpe = rpe;
      if (completed !== undefined) updates.completed = completed;
      if (notes !== undefined) updates.notes = notes;
      
      const { error } = await supabase
        .from('exercise_logs')
        .update(updates)
        .eq('id', logId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
    },
  });

  const completeSession = useMutation({
    mutationFn: async ({
      sessionId,
      notes,
      visibility,
    }: {
      sessionId: string;
      notes?: string;
      visibility?: 'public' | 'friends' | 'private';
    }) => {
      const startedAt = activeSession?.started_at;
      const durationSeconds = startedAt 
        ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
        : null;
      
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
          notes: notes || null,
          visibility: visibility || 'public',
        })
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      toast({ title: 'Workout Complete!', description: 'Great job finishing your session!' });
    },
  });

  const cancelSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ status: 'cancelled', ended_at: new Date().toISOString() })
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
    },
  });

  return {
    sessions,
    activeSession,
    isLoading,
    startSession,
    updateExerciseLog,
    completeSession,
    cancelSession,
  };
}
