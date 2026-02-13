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
    gender: string | null;
    experienceLevel: string | null;
    trainingGoal: string | null;
    daysPerWeek: number | null;
    sessionLengthMinutes: number | null;
    benchMaxKg: number | null;
    squatMaxKg: number | null;
    deadliftMaxKg: number | null;
    preferredCardio: string | null;
    fitnessLevel: string | null;
    raceGoals: string | null;
    weeklyCardioFrequency: number | null;
    dietaryPreferences: string | null;
    nutritionGoal: string | null;
    allergies: string | null;
    mealsPerDay: number | null;
    primaryMotivation: string | null;
    biggestChallenge: string | null;
    sleepHours: number | null;
    sleepQuality: string | null;
    stressLevel: string | null;
    injuries: string | null;
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
        gender: coachingProfile.gender,
        experienceLevel: coachingProfile.experience_level,
        trainingGoal: coachingProfile.training_goal,
        daysPerWeek: coachingProfile.days_per_week,
        sessionLengthMinutes: coachingProfile.session_length_minutes,
        benchMaxKg: coachingProfile.bench_max_kg,
        squatMaxKg: coachingProfile.squat_max_kg,
        deadliftMaxKg: coachingProfile.deadlift_max_kg,
        preferredCardio: coachingProfile.preferred_cardio,
        fitnessLevel: coachingProfile.fitness_level,
        raceGoals: coachingProfile.race_goals,
        weeklyCardioFrequency: coachingProfile.weekly_cardio_frequency,
        dietaryPreferences: coachingProfile.dietary_preferences,
        nutritionGoal: coachingProfile.nutrition_goal,
        allergies: coachingProfile.allergies,
        mealsPerDay: coachingProfile.meals_per_day,
        primaryMotivation: coachingProfile.primary_motivation,
        biggestChallenge: coachingProfile.biggest_challenge,
        sleepHours: coachingProfile.sleep_hours,
        sleepQuality: coachingProfile.sleep_quality,
        stressLevel: coachingProfile.stress_level,
        injuries: coachingProfile.injuries,
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
      const cp = context.coachingProfile;
      const statsParts: string[] = [];
      if (cp.gender) statsParts.push(`Gender: ${cp.gender}`);
      if (cp.ageYears) statsParts.push(`Age: ${cp.ageYears}`);
      if (cp.heightCm) statsParts.push(`Height: ${cp.heightCm}cm`);
      if (cp.weightKg) statsParts.push(`Weight: ${cp.weightKg}kg`);
      if (statsParts.length) parts.push(`USER STATS: ${statsParts.join(', ')}`);

      // Power profile
      const powerParts: string[] = [];
      if (cp.experienceLevel) powerParts.push(`Level: ${cp.experienceLevel}`);
      if (cp.trainingGoal) powerParts.push(`Goal: ${cp.trainingGoal}`);
      if (cp.daysPerWeek) powerParts.push(`${cp.daysPerWeek} days/week`);
      if (cp.sessionLengthMinutes) powerParts.push(`${cp.sessionLengthMinutes}min sessions`);
      if (cp.benchMaxKg) powerParts.push(`Bench: ${cp.benchMaxKg}kg`);
      if (cp.squatMaxKg) powerParts.push(`Squat: ${cp.squatMaxKg}kg`);
      if (cp.deadliftMaxKg) powerParts.push(`Deadlift: ${cp.deadliftMaxKg}kg`);
      if (powerParts.length) parts.push(`POWER PROFILE: ${powerParts.join(', ')}`);

      // Movement profile
      const moveParts: string[] = [];
      if (cp.fitnessLevel) moveParts.push(`Fitness: ${cp.fitnessLevel}`);
      if (cp.preferredCardio) moveParts.push(`Cardio: ${cp.preferredCardio}`);
      if (cp.weeklyCardioFrequency) moveParts.push(`${cp.weeklyCardioFrequency}x/week`);
      if (cp.raceGoals) moveParts.push(`Goals: ${cp.raceGoals}`);
      if (moveParts.length) parts.push(`MOVEMENT PROFILE: ${moveParts.join(', ')}`);

      // Fuel profile
      const fuelParts: string[] = [];
      if (cp.nutritionGoal) fuelParts.push(`Goal: ${cp.nutritionGoal}`);
      if (cp.dietaryPreferences) fuelParts.push(`Diet: ${cp.dietaryPreferences}`);
      if (cp.allergies) fuelParts.push(`Allergies: ${cp.allergies}`);
      if (cp.mealsPerDay) fuelParts.push(`${cp.mealsPerDay} meals/day`);
      if (fuelParts.length) parts.push(`FUEL PROFILE: ${fuelParts.join(', ')}`);

      // Mindset profile
      const mindParts: string[] = [];
      if (cp.primaryMotivation) mindParts.push(`Motivation: ${cp.primaryMotivation}`);
      if (cp.biggestChallenge) mindParts.push(`Challenge: ${cp.biggestChallenge}`);
      if (cp.sleepHours) mindParts.push(`Sleep: ${cp.sleepHours}h (${cp.sleepQuality || 'N/A'})`);
      if (cp.stressLevel) mindParts.push(`Stress: ${cp.stressLevel}`);
      if (mindParts.length) parts.push(`MINDSET PROFILE: ${mindParts.join(', ')}`);

      if (cp.injuries) parts.push(`INJURIES/LIMITATIONS: ${cp.injuries}`);
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
