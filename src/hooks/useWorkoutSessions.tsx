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
  confidence_rating: number | null;
  pain_flag: boolean | null;
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
      confidenceRating,
      painFlag,
    }: {
      logId: string;
      actualReps?: number;
      weightKg?: number;
      rpe?: number;
      completed?: boolean;
      notes?: string;
      confidenceRating?: number;
      painFlag?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (actualReps !== undefined) updates.actual_reps = actualReps;
      if (weightKg !== undefined) updates.weight_kg = weightKg;
      if (rpe !== undefined) updates.rpe = rpe;
      if (completed !== undefined) updates.completed = completed;
      if (notes !== undefined) updates.notes = notes;
      if (confidenceRating !== undefined) updates.confidence_rating = confidenceRating;
      if (painFlag !== undefined) updates.pain_flag = painFlag;
      
      const { error } = await supabase
        .from('exercise_logs')
        .update(updates)
        .eq('id', logId);
      
      if (error) throw error;
      
      return { logId, updates };
    },
    // Use optimistic updates to prevent re-renders during input
    onMutate: async ({ logId, actualReps, weightKg, rpe, completed, notes, confidenceRating, painFlag }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['active-session', user?.id] });
      
      // Snapshot the previous value
      const previousSession = queryClient.getQueryData<WorkoutSession | null>(['active-session', user?.id]);
      
      // Optimistically update the cache
      if (previousSession?.exercise_logs) {
        const updatedLogs = previousSession.exercise_logs.map((log) => {
          if (log.id === logId) {
            return {
              ...log,
              ...(actualReps !== undefined && { actual_reps: actualReps }),
              ...(weightKg !== undefined && { weight_kg: weightKg }),
              ...(rpe !== undefined && { rpe }),
              ...(completed !== undefined && { completed }),
              ...(notes !== undefined && { notes }),
              ...(confidenceRating !== undefined && { confidence_rating: confidenceRating }),
              ...(painFlag !== undefined && { pain_flag: painFlag }),
            };
          }
          return log;
        });
        
        queryClient.setQueryData(['active-session', user?.id], {
          ...previousSession,
          exercise_logs: updatedLogs,
        });
      }
      
      return { previousSession };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSession) {
        queryClient.setQueryData(['active-session', user?.id], context.previousSession);
      }
      toast({ title: 'Error saving', description: 'Failed to save changes', variant: 'destructive' });
    },
    // Don't invalidate queries on success - we already updated optimistically
    onSettled: () => {
      // Only invalidate workout-sessions list (not active-session) for background sync
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
    },
  });

  const completeSession = useMutation({
    mutationFn: async ({
      sessionId,
      notes,
      visibility,
      manualDurationSeconds,
    }: {
      sessionId: string;
      notes?: string;
      visibility?: 'public' | 'friends' | 'private';
      manualDurationSeconds?: number;
    }) => {
      const startedAt = activeSession?.started_at;
      const durationSeconds = manualDurationSeconds ?? (startedAt 
        ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
        : null);
      
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
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      toast({ title: 'Workout Complete!', description: 'Great job finishing your session!' });

      // Notify coaches and devs that a session was completed
      try {
        if (!user) return;

        // Fetch the completed session fresh to guarantee we have data
        const { data: completedSession } = await supabase
          .from('workout_sessions')
          .select('session_type, day_name, program_id')
          .eq('id', variables.sessionId)
          .single();

        const sessionLabel = completedSession
          ? `${completedSession.session_type} (${completedSession.day_name})`
          : 'a workout session';

        // Fetch athlete display name for notification context
        const { data: athleteProfile } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('user_id', user.id)
          .maybeSingle();

        const athleteName = athleteProfile?.display_name || athleteProfile?.username || 'An athlete';

        // Notify assigned coaches
        const { data: coaches } = await supabase
          .from('coaching_assignments')
          .select('coach_id')
          .eq('athlete_id', user.id)
          .eq('status', 'active');

        const coachNotifs = (coaches || []).map(c => ({
          user_id: c.coach_id,
          type: 'athlete_completed_session',
          title: '🏋️ Session Completed',
          body: `${athleteName} completed ${sessionLabel}. Tap to review their results.`,
          data: { session_id: variables.sessionId, athlete_id: user.id, program_id: completedSession?.program_id },
        }));

        // Notify devs
        const { data: devRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'dev');

        const devNotifs = (devRoles || [])
          .filter(d => d.user_id !== user.id)
          .map(d => ({
            user_id: d.user_id,
            type: 'athlete_completed_session',
            title: '🏋️ Session Completed',
            body: `${athleteName} completed ${sessionLabel}. Tap to review their results.`,
            data: { session_id: variables.sessionId, athlete_id: user.id, program_id: completedSession?.program_id },
          }));

        const allNotifs = [...coachNotifs, ...devNotifs];
        if (allNotifs.length > 0) {
          await supabase.from('notifications').insert(allNotifs);
        }
      } catch (e) {
        console.error('Failed to notify coach/dev on session complete:', e);
      }
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

  const updateSession = useMutation({
    mutationFn: async ({
      sessionId,
      notes,
      visibility,
      durationSeconds,
    }: {
      sessionId: string;
      notes?: string;
      visibility?: string;
      durationSeconds?: number;
    }) => {
      const updates: Record<string, unknown> = {};
      if (notes !== undefined) updates.notes = notes;
      if (visibility !== undefined) updates.visibility = visibility;
      if (durationSeconds !== undefined) updates.duration_seconds = durationSeconds;
      
      const { error } = await supabase
        .from('workout_sessions')
        .update(updates)
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['unified-feed'] });
    },
  });

  const swapExercise = useMutation({
    mutationFn: async ({
      sessionId,
      oldExerciseName,
      newExerciseName,
      newEquipment,
    }: {
      sessionId: string;
      oldExerciseName: string;
      newExerciseName: string;
      newEquipment: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Update all exercise logs for this exercise in this session
      const { error } = await supabase
        .from('exercise_logs')
        .update({
          exercise_name: newExerciseName,
          equipment: newEquipment,
        })
        .eq('session_id', sessionId)
        .eq('exercise_name', oldExerciseName);

      if (error) throw error;
    },
    onMutate: async ({ sessionId, oldExerciseName, newExerciseName, newEquipment }) => {
      await queryClient.cancelQueries({ queryKey: ['active-session', user?.id] });
      const previousSession = queryClient.getQueryData<WorkoutSession | null>(['active-session', user?.id]);

      if (previousSession?.exercise_logs) {
        const updatedLogs = previousSession.exercise_logs.map((log) => {
          if (log.exercise_name === oldExerciseName) {
            return { ...log, exercise_name: newExerciseName, equipment: newEquipment };
          }
          return log;
        });
        queryClient.setQueryData(['active-session', user?.id], {
          ...previousSession,
          exercise_logs: updatedLogs,
        });
      }
      return { previousSession };
    },
    onError: (err, variables, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(['active-session', user?.id], context.previousSession);
      }
      toast({ title: 'Swap Failed', description: 'Could not swap exercise', variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
    },
  });

  const addExerciseToSession = useMutation({
    mutationFn: async ({
      sessionId,
      exercise,
    }: {
      sessionId: string;
      exercise: { name: string; equipment: string; sets: number; reps: string };
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Get existing logs to find the next set numbers
      const { data: existingLogs } = await supabase
        .from('exercise_logs')
        .select('exercise_name, set_number')
        .eq('session_id', sessionId)
        .eq('exercise_name', exercise.name);

      const maxSet = existingLogs?.reduce((max, l) => Math.max(max, l.set_number), 0) || 0;

      const newLogs = Array.from({ length: exercise.sets }, (_, i) => ({
        session_id: sessionId,
        user_id: user.id,
        exercise_name: exercise.name,
        equipment: exercise.equipment,
        set_number: maxSet + i + 1,
        target_reps: exercise.reps,
        completed: false,
      }));

      const { error } = await supabase.from('exercise_logs').insert(newLogs);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast({ title: 'Exercise Added', description: 'New exercise added to your session.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
    updateSession,
    swapExercise,
    addExerciseToSession,
  };
}
