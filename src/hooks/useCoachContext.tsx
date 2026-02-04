import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useCoachingProfile } from './useCoachingProfile';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export interface CoachUserContext {
  profile: {
    displayName: string | null;
    username: string | null;
    bio: string | null;
    totalRuns: number;
    totalDistanceKm: number;
    totalTimeSeconds: number;
  } | null;
  coachingProfile: {
    ageYears: number | null;
    heightCm: number | null;
    weightKg: number | null;
  } | null;
  recentWorkouts: {
    date: string;
    dayName: string;
    sessionType: string;
    durationSeconds: number | null;
    exercises: Array<{
      name: string;
      sets: number;
      avgWeight: number | null;
      avgReps: number | null;
    }>;
  }[];
  recentNutrition: {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    mealCount: number;
  }[];
  trainingPrograms: {
    name: string;
    isActive: boolean;
    currentWeek: number | null;
    currentDay: number | null;
  }[];
}

export function useCoachContext() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { profile: coachingProfile } = useCoachingProfile();

  const gatherContext = async (): Promise<CoachUserContext> => {
    if (!user) {
      return {
        profile: null,
        coachingProfile: null,
        recentWorkouts: [],
        recentNutrition: [],
        trainingPrograms: [],
      };
    }

    const sevenDaysAgo = subDays(new Date(), 7).toISOString();

    // Fetch recent workouts with exercise logs
    const { data: workoutSessions } = await supabase
      .from('workout_sessions')
      .select('*, exercise_logs(*)')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('started_at', sevenDaysAgo)
      .order('started_at', { ascending: false })
      .limit(10);

    // Fetch recent food logs
    const { data: foodLogs } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', sevenDaysAgo)
      .order('logged_at', { ascending: false });

    // Fetch training programs
    const { data: programs } = await supabase
      .from('training_programs')
      .select('name, is_active, current_week, current_day')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5);

    // Process workouts
    const recentWorkouts = (workoutSessions || []).map((session: any) => {
      const logs = session.exercise_logs || [];
      const exerciseMap = new Map<string, { weights: number[]; reps: number[] }>();
      
      logs.forEach((log: any) => {
        if (!exerciseMap.has(log.exercise_name)) {
          exerciseMap.set(log.exercise_name, { weights: [], reps: [] });
        }
        const entry = exerciseMap.get(log.exercise_name)!;
        if (log.weight_kg) entry.weights.push(log.weight_kg);
        if (log.actual_reps) entry.reps.push(log.actual_reps);
      });

      return {
        date: format(new Date(session.started_at), 'yyyy-MM-dd'),
        dayName: session.day_name,
        sessionType: session.session_type,
        durationSeconds: session.duration_seconds,
        exercises: Array.from(exerciseMap.entries()).map(([name, data]) => ({
          name,
          sets: data.weights.length || data.reps.length,
          avgWeight: data.weights.length ? Math.round(data.weights.reduce((a, b) => a + b, 0) / data.weights.length * 10) / 10 : null,
          avgReps: data.reps.length ? Math.round(data.reps.reduce((a, b) => a + b, 0) / data.reps.length) : null,
        })),
      };
    });

    // Process nutrition by day
    const nutritionByDay = new Map<string, { calories: number; protein: number; carbs: number; fat: number; count: number }>();
    (foodLogs || []).forEach((log: any) => {
      const date = format(new Date(log.logged_at), 'yyyy-MM-dd');
      const servings = log.servings || 1;
      
      if (!nutritionByDay.has(date)) {
        nutritionByDay.set(date, { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
      }
      const day = nutritionByDay.get(date)!;
      day.calories += (log.calories || 0) * servings;
      day.protein += (log.protein_g || 0) * servings;
      day.carbs += (log.carbs_g || 0) * servings;
      day.fat += (log.fat_g || 0) * servings;
      day.count++;
    });

    const recentNutrition = Array.from(nutritionByDay.entries()).map(([date, data]) => ({
      date,
      totalCalories: Math.round(data.calories),
      totalProtein: Math.round(data.protein),
      totalCarbs: Math.round(data.carbs),
      totalFat: Math.round(data.fat),
      mealCount: data.count,
    }));

    return {
      profile: profile ? {
        displayName: profile.display_name,
        username: profile.username,
        bio: profile.bio,
        totalRuns: profile.total_runs,
        totalDistanceKm: profile.total_distance_km,
        totalTimeSeconds: profile.total_time_seconds,
      } : null,
      coachingProfile: coachingProfile ? {
        ageYears: coachingProfile.age_years,
        heightCm: coachingProfile.height_cm,
        weightKg: coachingProfile.weight_kg,
      } : null,
      recentWorkouts,
      recentNutrition,
      trainingPrograms: (programs || []).map((p: any) => ({
        name: p.name,
        isActive: p.is_active,
        currentWeek: p.current_week,
        currentDay: p.current_day,
      })),
    };
  };

  const formatContextForAI = (context: CoachUserContext): string => {
    const parts: string[] = [];

    if (context.coachingProfile) {
      const { ageYears, heightCm, weightKg } = context.coachingProfile;
      const profileParts: string[] = [];
      if (ageYears) profileParts.push(`Age: ${ageYears}`);
      if (heightCm) profileParts.push(`Height: ${heightCm}cm`);
      if (weightKg) profileParts.push(`Weight: ${weightKg}kg`);
      if (profileParts.length) {
        parts.push(`USER STATS: ${profileParts.join(', ')}`);
      }
    }

    if (context.profile) {
      const { totalRuns, totalDistanceKm } = context.profile;
      if (totalRuns > 0) {
        parts.push(`CARDIO HISTORY: ${totalRuns} runs totalling ${totalDistanceKm.toFixed(1)}km`);
      }
    }

    if (context.recentWorkouts.length > 0) {
      const workoutSummary = context.recentWorkouts.slice(0, 5).map(w => {
        const exerciseList = w.exercises.slice(0, 3).map(e => 
          `${e.name}${e.avgWeight ? ` @${e.avgWeight}kg` : ''}${e.avgReps ? ` x${e.avgReps}` : ''}`
        ).join(', ');
        return `${w.date} ${w.dayName}: ${exerciseList}`;
      }).join('; ');
      parts.push(`RECENT WORKOUTS (last 7 days): ${workoutSummary}`);
    }

    if (context.recentNutrition.length > 0) {
      const avgCalories = Math.round(context.recentNutrition.reduce((sum, d) => sum + d.totalCalories, 0) / context.recentNutrition.length);
      const avgProtein = Math.round(context.recentNutrition.reduce((sum, d) => sum + d.totalProtein, 0) / context.recentNutrition.length);
      parts.push(`NUTRITION (7-day avg): ${avgCalories} kcal/day, ${avgProtein}g protein/day`);
    }

    if (context.trainingPrograms.length > 0) {
      const activeProgram = context.trainingPrograms.find(p => p.isActive);
      if (activeProgram) {
        parts.push(`ACTIVE PROGRAM: "${activeProgram.name}" - Week ${activeProgram.currentWeek || 1}, Day ${activeProgram.currentDay || 1}`);
      }
    }

    return parts.length > 0 ? `\n\n[USER CONTEXT]\n${parts.join('\n')}` : '';
  };

  return {
    gatherContext,
    formatContextForAI,
  };
}
