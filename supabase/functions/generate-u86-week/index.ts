import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Big 5 Compound Framework ───
// The programme is built around the Big 5 lifts + Pull-ups/Chin-ups + Push-ups
// Scaled by fitness level: beginner → intermediate → advanced

interface ExerciseSlot {
  category: string;
  beginner: string[];
  intermediate: string[];
  advanced: string[];
}

// 8 exercise slots per day, built around the Big 5
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
    category: 'Barbell Row (Upper Pull)',
    beginner: ['Dumbbell Bent Over Row', 'Inverted Rows', 'Single Arm Dumbbell Row'],
    intermediate: ['Bent Over Row', 'Single Arm Dumbbell Row', 'T-Bar Row', 'Inverted Rows'],
    advanced: ['Bent Over Row', 'Pendlay Row', 'T-Bar Row', 'Weighted Inverted Rows'],
  },
  {
    category: 'Pull-up / Chin-up (Vertical Pull)',
    beginner: ['Dead Hang', 'Band-Assisted Pull Ups', 'Lat Pulldown'],
    intermediate: ['Pull Ups', 'Chin Ups', 'Lat Pulldown', 'Neutral Grip Pull Ups'],
    advanced: ['Pull Ups', 'Chin Ups', 'Weighted Pull Ups', 'Muscle Ups'],
  },
  {
    category: 'Push-up Variation (Bodyweight Push)',
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

// Equipment-based fallbacks: if user lacks barbells, swap to alternatives
const BARBELL_ALTERNATIVES: Record<string, string> = {
  'Back Squat': 'Goblet Squat',
  'Front Squat': 'Goblet Squat',
  'Zercher Squat': 'Goblet Squat',
  'Pause Squat': 'Bodyweight Squats',
  'Flat Bench Press': 'Dumbbell Bench Press',
  'Incline Bench Press': 'Incline Dumbbell Press',
  'Close Grip Bench Press': 'Diamond Push Ups',
  'Conventional Deadlift': 'Dumbbell Romanian Deadlift',
  'Sumo Deadlift': 'Dumbbell Romanian Deadlift',
  'Romanian Deadlift': 'Dumbbell Romanian Deadlift',
  'Deficit Deadlift': 'Dumbbell Romanian Deadlift',
  'Overhead Press': 'Dumbbell Overhead Press',
  'Push Press': 'Dumbbell Overhead Press',
  'Z Press': 'Dumbbell Overhead Press',
  'Bent Over Row': 'Dumbbell Bent Over Row',
  'Pendlay Row': 'Single Arm Dumbbell Row',
  'T-Bar Row': 'Single Arm Dumbbell Row',
};

const DUMBBELL_ALTERNATIVES: Record<string, string> = {
  'Goblet Squat': 'Bodyweight Squats',
  'Dumbbell Bench Press': 'Push Ups',
  'Incline Dumbbell Press': 'Decline Push Ups',
  'Dumbbell Romanian Deadlift': 'Glute Bridge',
  'Dumbbell Overhead Press': 'Pike Push Ups',
  'Arnold Press': 'Pike Push Ups',
  'Dumbbell Bent Over Row': 'Inverted Rows',
  'Single Arm Dumbbell Row': 'Inverted Rows',
  'Farmers Walk': 'Front Plank',
  'Kettlebell Deadlift': 'Glute Bridge',
};

function applyEquipmentFilter(exercise: string, equipment: string[]): string {
  const hasBarbell = equipment.includes('barbells');
  const hasDumbbell = equipment.includes('dumbbells');
  
  let result = exercise;
  
  if (!hasBarbell && BARBELL_ALTERNATIVES[result]) {
    result = BARBELL_ALTERNATIVES[result];
  }
  if (!hasDumbbell && DUMBBELL_ALTERNATIVES[result]) {
    result = DUMBBELL_ALTERNATIVES[result];
  }
  
  return result;
}

function selectExercise(pool: string[], dayNumber: number, slotIndex: number): string {
  if (pool.length === 0) return 'Bodyweight Squats';
  const idx = (dayNumber + slotIndex * 3) % pool.length;
  return pool[idx];
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

function getStrengthTime(dist: number): number {
  if (dist <= 2) return 48;
  if (dist <= 3) return 43;
  if (dist <= 4) return 38;
  return 33;
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

    const { programId, weekNumber, fitnessLevel, equipment, injuries } = await req.json();

    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = Math.min(startDay + 6, 86);

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userId = user.id;
    const level = fitnessLevel as 'beginner' | 'intermediate' | 'advanced';

    const intensityNote = level === 'beginner'
      ? 'Moderate effort. Rest 60–90s between sets. Leave 2–3 reps in reserve.'
      : level === 'intermediate'
      ? 'Strong effort. Rest 45–60s between sets. Leave 1–2 reps in reserve.'
      : 'High effort. Rest 30–45s between sets. Leave 1 rep in reserve.';

    const days = [];

    for (let day = startDay; day <= endDay; day++) {
      const runDist = getRunDistance(day);
      const strengthTime = getStrengthTime(runDist);
      const timePerExercise = Math.floor(strengthTime / 8);

      const exercises = EXERCISE_SLOTS.map((slot, i) => {
        const pool = slot[level];
        const rawExercise = selectExercise(pool, day, i);
        const exercise = applyEquipmentFilter(rawExercise, equipment);

        return {
          category: slot.category,
          name: exercise,
          timeMinutes: timePerExercise,
          instruction: `Work for ${timePerExercise} minutes. ${intensityNote}`,
        };
      });

      days.push({
        program_id: programId,
        user_id: userId,
        day_number: day,
        run_distance_km: runDist,
        strength_time_minutes: strengthTime,
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
