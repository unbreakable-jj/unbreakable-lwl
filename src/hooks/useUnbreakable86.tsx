import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface U86Program {
  id: string;
  user_id: string;
  fitness_level: string;
  equipment: string[];
  injuries: string | null;
  training_environment: string;
  running_ability: string;
  goal_emphasis: string | null;
  current_day: number;
  status: string;
  restart_enabled: boolean;
  restart_count: number;
  started_at: string | null;
  completed_at: string | null;
  last_generated_week: number;
  created_at: string;
  updated_at: string;
}

export interface U86Day {
  id: string;
  program_id: string;
  user_id: string;
  day_number: number;
  run_distance_km: number;
  run_completed: boolean;
  run_time_seconds: number | null;
  run_notes: string | null;
  strength_time_minutes: number;
  exercises: any;
  strength_completed: boolean;
  habit_train: boolean;
  habit_control_inputs: boolean;
  habit_learn_daily: boolean;
  habit_journal: boolean;
  habit_hard_thing: boolean;
  habit_identity: boolean;
  journal_entry: string | null;
  identity_reflection: string | null;
  day_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export function useUnbreakable86() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active program
  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ['u86-program', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from('unbreakable_86_programs')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['setup', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as U86Program | null;
    },
    enabled: !!user,
  });

  // Fetch all days for current program
  const { data: days, isLoading: daysLoading } = useQuery({
    queryKey: ['u86-days', program?.id],
    queryFn: async () => {
      if (!program) return [];
      const { data, error } = await (supabase as any)
        .from('unbreakable_86_days')
        .select('*')
        .eq('program_id', program.id)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return (data || []) as U86Day[];
    },
    enabled: !!program,
  });

  // Completed program for showing completion screen
  const { data: completedProgram } = useQuery({
    queryKey: ['u86-completed', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from('unbreakable_86_programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as U86Program | null;
    },
    enabled: !!user && !program,
  });

  // Create program
  const createProgram = useMutation({
    mutationFn: async (config: {
      fitness_level: string;
      equipment: string[];
      injuries: string;
      training_environment: string;
      running_ability: string;
      goal_emphasis: string | null;
    }) => {
      if (!user) throw new Error('Must be logged in');
      const { data, error } = await (supabase as any)
        .from('unbreakable_86_programs')
        .insert({ ...config, user_id: user.id, status: 'setup' })
        .select()
        .single();
      if (error) throw error;
      return data as U86Program;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['u86-program'] });
    },
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  // Activate program (after agreement)
  const activateProgram = useMutation({
    mutationFn: async (programId: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await (supabase as any)
        .from('unbreakable_86_programs')
        .update({ status: 'active', started_at: new Date().toISOString(), current_day: 1 })
        .eq('id', programId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['u86-program'] });
    },
  });

  // Generate a week
  const generateWeek = useMutation({
    mutationFn: async ({ programId, weekNumber, fitnessLevel, equipment, injuries }: {
      programId: string;
      weekNumber: number;
      fitnessLevel: string;
      equipment: string[];
      injuries: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-u86-week`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ programId, weekNumber, fitnessLevel, equipment, injuries }),
        }
      );
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to generate week');
      }
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['u86-days'] });
    },
    onError: (e) => {
      toast({ title: 'Generation Failed', description: e.message, variant: 'destructive' });
    },
  });

  // Update a day (habits, journal, completion)
  const updateDay = useMutation({
    mutationFn: async ({ dayId, updates }: { dayId: string; updates: Partial<U86Day> }) => {
      const { error } = await (supabase as any)
        .from('unbreakable_86_days')
        .update(updates)
        .eq('id', dayId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['u86-days'] });
    },
  });

  // Complete a day and advance
  const completeDay = useMutation({
    mutationFn: async ({ dayId, programId, dayNumber }: { dayId: string; programId: string; dayNumber: number }) => {
      // Mark day complete
      await (supabase as any)
        .from('unbreakable_86_days')
        .update({ day_completed: true, completed_at: new Date().toISOString() })
        .eq('id', dayId);

      if (dayNumber >= 86) {
        // Programme complete!
        await (supabase as any)
          .from('unbreakable_86_programs')
          .update({ status: 'completed', completed_at: new Date().toISOString(), current_day: 86 })
          .eq('id', programId);
      } else {
        // Advance to next day
        await (supabase as any)
          .from('unbreakable_86_programs')
          .update({ current_day: dayNumber + 1 })
          .eq('id', programId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['u86-program'] });
      queryClient.invalidateQueries({ queryKey: ['u86-days'] });
      queryClient.invalidateQueries({ queryKey: ['u86-completed'] });
    },
  });

  // Restart program
  const restartProgram = useMutation({
    mutationFn: async (programId: string) => {
      // Reset all days
      await (supabase as any)
        .from('unbreakable_86_days')
        .delete()
        .eq('program_id', programId);

      // Reset program
      const { data: prog } = await (supabase as any)
        .from('unbreakable_86_programs')
        .select('restart_count')
        .eq('id', programId)
        .single();

      await (supabase as any)
        .from('unbreakable_86_programs')
        .update({
          current_day: 1,
          status: 'active',
          started_at: new Date().toISOString(),
          completed_at: null,
          last_generated_week: 0,
          restart_count: (prog?.restart_count || 0) + 1,
        })
        .eq('id', programId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['u86-program'] });
      queryClient.invalidateQueries({ queryKey: ['u86-days'] });
      toast({ title: 'Programme Restarted', description: 'Day 1. Keep showing up.' });
    },
  });

  // Abandon program
  const abandonProgram = useMutation({
    mutationFn: async (programId: string) => {
      await (supabase as any)
        .from('unbreakable_86_programs')
        .update({ status: 'abandoned' })
        .eq('id', programId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['u86-program'] });
    },
  });

  const currentDay = days?.find(d => d.day_number === program?.current_day);
  const completedDays = days?.filter(d => d.day_completed).length || 0;
  const streak = (() => {
    if (!days || !program) return 0;
    let s = 0;
    for (let i = (program.current_day || 1) - 1; i >= 1; i--) {
      const d = days.find(day => day.day_number === i);
      if (d?.day_completed) s++;
      else break;
    }
    return s;
  })();

  return {
    program,
    completedProgram,
    days,
    currentDay,
    completedDays,
    streak,
    isLoading: programLoading || daysLoading,
    createProgram,
    activateProgram,
    generateWeek,
    updateDay,
    completeDay,
    restartProgram,
    abandonProgram,
  };
}
