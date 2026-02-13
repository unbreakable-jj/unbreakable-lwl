import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Big 5 Compound Framework ───
// Built around: Squat, Bench, Deadlift, OHP, Row + Pull-ups + Push-ups + Core
// Structured sets/reps scaled by level and week progression

interface ExerciseSlot {
  category: string;
  beginner: string[];
  intermediate: string[];
  advanced: string[];
}

const EXERCISE_SLOTS: ExerciseSlot[] = [
  {
    category: 'Squat (Lower Push)',
    beginner: ['Goblet Squat', 'Bodyweight Squats', 'Box Squat'],
    intermediate: ['Back Squat', 'Front Squat', 'Goblet Squat', 'Leg Press'],
    advanced: ['Back Squat', 'Front Squat', 'Zercher Squat', 'Pause Squat'],
  },
  {
    category: 'Bench Press (Upper Push)',
    beginner: ['Push Ups', 'Dumbbell Bench Press', 'Incline Dumbbell Press'],
    intermediate: ['Flat Bench Press', 'Incline Bench Press', 'Dumbbell Bench Press', 'Push Ups'],
    advanced: ['Flat Bench Press', 'Incline Bench Press', 'Close Grip Bench Press', 'Dumbbell Bench Press'],
  },
  {
    category: 'Deadlift (Hinge)',
    beginner: ['Dumbbell Romanian Deadlift', 'Glute Bridge', 'Kettlebell Deadlift'],
    intermediate: ['Conventional Deadlift', 'Romanian Deadlift', 'Dumbbell Romanian Deadlift'],
    advanced: ['Conventional Deadlift', 'Sumo Deadlift', 'Romanian Deadlift', 'Deficit Deadlift'],
  },
  {
    category: 'Overhead Press (Shoulders)',
    beginner: ['Dumbbell Overhead Press', 'Pike Push Ups', 'Lateral Raises'],
    intermediate: ['Overhead Press', 'Dumbbell Overhead Press', 'Arnold Press', 'Push Press'],
    advanced: ['Overhead Press', 'Push Press', 'Arnold Press', 'Z Press'],
  },
  {
    category: 'Row (Upper Pull)',
    beginner: ['Dumbbell Bent Over Row', 'Inverted Rows', 'Single Arm Dumbbell Row'],
    intermediate: ['Bent Over Row', 'Single Arm Dumbbell Row', 'T-Bar Row', 'Inverted Rows'],
    advanced: ['Bent Over Row', 'Pendlay Row', 'T-Bar Row', 'Weighted Inverted Rows'],
  },
  {
    category: 'Pull-up / Chin-up',
    beginner: ['Dead Hang', 'Band-Assisted Pull Ups', 'Lat Pulldown'],
    intermediate: ['Pull Ups', 'Chin Ups', 'Lat Pulldown', 'Neutral Grip Pull Ups'],
    advanced: ['Pull Ups', 'Chin Ups', 'Weighted Pull Ups', 'Muscle Ups'],
  },
  {
    category: 'Push-up Variation',
    beginner: ['Push Ups', 'Incline Push Ups', 'Knee Push Ups'],
    intermediate: ['Diamond Push Ups', 'Wide Push Ups', 'Decline Push Ups', 'Push Ups'],
    advanced: ['Weighted Push Ups', 'Deficit Push Ups', 'Archer Push Ups', 'Diamond Push Ups'],
  },
  {
    category: 'Core / Conditioning',
    beginner: ['Front Plank', 'Dead Bug', 'Bird Dog', 'Mountain Climbers'],
    intermediate: ['Hanging Leg Raise', 'Ab Wheel Rollout', 'Russian Twists', 'Farmers Walk'],
    advanced: ['Hanging Leg Raise', 'Ab Wheel Rollout', 'Dragon Flag', 'Weighted Plank'],
  },
];

// Equipment fallbacks
const BARBELL_ALTERNATIVES: Record<string, string> = {
  'Back Squat': 'Goblet Squat', 'Front Squat': 'Goblet Squat', 'Zercher Squat': 'Goblet Squat',
  'Pause Squat': 'Bodyweight Squats', 'Flat Bench Press': 'Dumbbell Bench Press',
  'Incline Bench Press': 'Incline Dumbbell Press', 'Close Grip Bench Press': 'Diamond Push Ups',
  'Conventional Deadlift': 'Dumbbell Romanian Deadlift', 'Sumo Deadlift': 'Dumbbell Romanian Deadlift',
  'Romanian Deadlift': 'Dumbbell Romanian Deadlift', 'Deficit Deadlift': 'Dumbbell Romanian Deadlift',
  'Overhead Press': 'Dumbbell Overhead Press', 'Push Press': 'Dumbbell Overhead Press',
  'Z Press': 'Dumbbell Overhead Press', 'Bent Over Row': 'Dumbbell Bent Over Row',
  'Pendlay Row': 'Single Arm Dumbbell Row', 'T-Bar Row': 'Single Arm Dumbbell Row',
};

const DUMBBELL_ALTERNATIVES: Record<string, string> = {
  'Goblet Squat': 'Bodyweight Squats', 'Dumbbell Bench Press': 'Push Ups',
  'Incline Dumbbell Press': 'Decline Push Ups', 'Dumbbell Romanian Deadlift': 'Glute Bridge',
  'Dumbbell Overhead Press': 'Pike Push Ups', 'Arnold Press': 'Pike Push Ups',
  'Dumbbell Bent Over Row': 'Inverted Rows', 'Single Arm Dumbbell Row': 'Inverted Rows',
  'Farmers Walk': 'Front Plank', 'Kettlebell Deadlift': 'Glute Bridge',
};

// Bodyweight exercises that should use bodyweight rep schemes
const BODYWEIGHT_EXERCISES = new Set([
  'Push Ups', 'Incline Push Ups', 'Knee Push Ups', 'Diamond Push Ups', 'Wide Push Ups',
  'Decline Push Ups', 'Archer Push Ups', 'Deficit Push Ups', 'Weighted Push Ups',
  'Pike Push Ups', 'Pull Ups', 'Chin Ups', 'Weighted Pull Ups', 'Muscle Ups',
  'Band-Assisted Pull Ups', 'Neutral Grip Pull Ups', 'Inverted Rows', 'Weighted Inverted Rows',
  'Bodyweight Squats', 'Box Squat', 'Glute Bridge', 'Dead Hang',
  'Front Plank', 'Dead Bug', 'Bird Dog', 'Mountain Climbers',
  'Hanging Leg Raise', 'Ab Wheel Rollout', 'Russian Twists', 'Dragon Flag', 'Weighted Plank',
]);

function applyEquipmentFilter(exercise: string, equipment: string[]): string {
  const hasBarbell = equipment.includes('barbells');
  const hasDumbbell = equipment.includes('dumbbells');
  let result = exercise;
  if (!hasBarbell && BARBELL_ALTERNATIVES[result]) result = BARBELL_ALTERNATIVES[result];
  if (!hasDumbbell && DUMBBELL_ALTERNATIVES[result]) result = DUMBBELL_ALTERNATIVES[result];
  return result;
}

function selectExercise(pool: string[], dayNumber: number, slotIndex: number): string {
  if (pool.length === 0) return 'Bodyweight Squats';
  return pool[(dayNumber + slotIndex * 3) % pool.length];
}

// ─── Structured Sets/Reps Generation ───
// Progressive overload across 86 days: volume/intensity increase by phase

interface SetPrescription {
  set: number;
  targetReps: string; // e.g. "8-10" or "30s" for plank
  suggestedWeight: string; // guidance like "Light", "Moderate", "Heavy", "BW"
}

function getEquipmentType(exercise: string): 'barbell' | 'dumbbell' | 'bodyweight' | 'machine' {
  if (BODYWEIGHT_EXERCISES.has(exercise)) return 'bodyweight';
  if (exercise.includes('Dumbbell') || exercise.includes('Goblet') || exercise.includes('Arnold') || 
      exercise.includes('Kettlebell') || exercise.includes('Farmers') || exercise.includes('Lateral')) return 'dumbbell';
  if (exercise.includes('Lat Pulldown') || exercise.includes('Leg Press') || exercise.includes('Machine') ||
      exercise.includes('T-Bar')) return 'machine';
  return 'barbell';
}

function generateSets(
  exercise: string,
  fitnessLevel: string,
  dayNumber: number,
  slotIndex: number
): SetPrescription[] {
  const phase = dayNumber <= 28 ? 1 : dayNumber <= 56 ? 2 : 3; // Foundation → Build → Peak
  const isBodyweight = BODYWEIGHT_EXERCISES.has(exercise);
  const equipType = getEquipmentType(exercise);
  
  // Time-based core exercises
  const isTimeBased = ['Front Plank', 'Dead Hang', 'Weighted Plank', 'Bird Dog'].includes(exercise);
  
  if (isTimeBased) {
    const duration = fitnessLevel === 'beginner' ? ['20s', '25s', '30s'] :
                     fitnessLevel === 'intermediate' ? ['30s', '35s', '40s'] :
                     ['40s', '45s', '50s'];
    const numSets = phase === 1 ? 3 : 4;
    return Array.from({ length: numSets }, (_, i) => ({
      set: i + 1,
      targetReps: duration[Math.min(phase - 1, duration.length - 1)],
      suggestedWeight: 'BW',
    }));
  }

  // Compound Big 5 exercises: more sets, lower reps, heavier
  const isBig5 = slotIndex <= 4; // First 5 slots are the big compounds
  
  let numSets: number;
  let repRange: string;
  let weightGuide: string;

  if (isBig5) {
    // Big 5 compounds - progressive structure
    if (fitnessLevel === 'beginner') {
      numSets = phase === 1 ? 3 : phase === 2 ? 3 : 4;
      repRange = phase === 1 ? '10-12' : phase === 2 ? '8-10' : '6-8';
      weightGuide = isBodyweight ? 'BW' : phase === 1 ? 'Light' : phase === 2 ? 'Moderate' : 'Moderate-Heavy';
    } else if (fitnessLevel === 'intermediate') {
      numSets = phase === 1 ? 3 : phase === 2 ? 4 : 4;
      repRange = phase === 1 ? '8-10' : phase === 2 ? '6-8' : '5-6';
      weightGuide = isBodyweight ? 'BW' : phase === 1 ? 'Moderate' : phase === 2 ? 'Moderate-Heavy' : 'Heavy';
    } else {
      numSets = phase === 1 ? 4 : phase === 2 ? 4 : 5;
      repRange = phase === 1 ? '6-8' : phase === 2 ? '5-6' : '3-5';
      weightGuide = isBodyweight ? 'BW+' : phase === 1 ? 'Moderate-Heavy' : phase === 2 ? 'Heavy' : 'Heavy';
    }
  } else {
    // Accessory exercises (pull-ups, push-ups, core) - higher reps
    if (fitnessLevel === 'beginner') {
      numSets = phase === 1 ? 3 : 3;
      repRange = isBodyweight ? (phase === 1 ? '5-8' : phase === 2 ? '8-12' : '10-15') : '10-12';
      weightGuide = isBodyweight ? 'BW' : 'Light';
    } else if (fitnessLevel === 'intermediate') {
      numSets = 3;
      repRange = isBodyweight ? (phase === 1 ? '8-12' : phase === 2 ? '10-15' : '12-20') : '10-12';
      weightGuide = isBodyweight ? 'BW' : 'Light-Moderate';
    } else {
      numSets = phase === 1 ? 3 : 4;
      repRange = isBodyweight ? (phase === 1 ? '10-15' : phase === 2 ? '15-20' : 'Max') : '8-12';
      weightGuide = isBodyweight ? 'BW+' : 'Moderate';
    }
  }

  return Array.from({ length: numSets }, (_, i) => ({
    set: i + 1,
    targetReps: repRange,
    suggestedWeight: weightGuide,
  }));
}

function getRunDistance(day: number): number {
  if (day <= 7) return 1.0;
  if (day <= 14) return 1.5;
  if (day <= 21) return 2.0;
  if (day <= 28) return 2.5;
  if (day <= 35) return 3.0;
  if (day <= 42) return 3.5;
  if (day <= 49) return 4.0;
  if (day <= 56) return 4.5;
  return 5.0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { programId, weekNumber, fitnessLevel, equipment } = await req.json();

    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = Math.min(startDay + 6, 86);

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userId = user.id;
    const level = fitnessLevel as 'beginner' | 'intermediate' | 'advanced';
    const days = [];

    for (let day = startDay; day <= endDay; day++) {
      const runDist = getRunDistance(day);

      const exercises = EXERCISE_SLOTS.map((slot, i) => {
        const pool = slot[level];
        const rawExercise = selectExercise(pool, day, i);
        const exercise = applyEquipmentFilter(rawExercise, equipment);
        const equipmentType = getEquipmentType(exercise);
        const sets = generateSets(exercise, level, day, i);

        return {
          category: slot.category,
          name: exercise,
          equipment: equipmentType,
          sets,
          // Per-set logged data (filled in by user)
          logged: sets.map(s => ({
            set: s.set,
            reps: null as number | null,
            weight: null as number | null,
            rpe: null as number | null,
            completed: false,
          })),
        };
      });

      days.push({
        program_id: programId,
        user_id: userId,
        day_number: day,
        run_distance_km: runDist,
        strength_time_minutes: 0, // No longer time-based
        exercises,
      });
    }

    const { data: insertedDays, error: insertError } = await serviceClient
      .from('unbreakable_86_days')
      .upsert(days, { onConflict: 'program_id,day_number' })
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to generate week');
    }

    await serviceClient
      .from('unbreakable_86_programs')
      .update({ last_generated_week: weekNumber })
      .eq('id', programId);

    return new Response(JSON.stringify({ days: insertedDays }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('U86 generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
