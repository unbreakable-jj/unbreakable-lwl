import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── A/B Split: 4 core lifts + 3 accessories = 7 exercises per session ───
// Session A: Squat, Bench, OHP, Press-up + 3 accessories
// Session B: Deadlift, Row, Bicep Curl, Pull-up/Chin-up + 3 accessories

interface ExerciseVariation {
  beginner: string[];
  intermediate: string[];
  advanced: string[];
}

// Core lifts for Session A
const SESSION_A_CORE: { category: string; variations: ExerciseVariation }[] = [
  {
    category: 'Squat',
    variations: {
      beginner: ['Goblet Squat', 'Bodyweight Squats', 'Box Squat'],
      intermediate: ['Back Squat', 'Front Squat', 'Goblet Squat', 'Leg Press'],
      advanced: ['Back Squat', 'Front Squat', 'Zercher Squat', 'Pause Squat'],
    },
  },
  {
    category: 'Bench Press',
    variations: {
      beginner: ['Push Ups', 'Dumbbell Bench Press', 'Incline Dumbbell Press'],
      intermediate: ['Flat Bench Press', 'Incline Bench Press', 'Dumbbell Bench Press'],
      advanced: ['Flat Bench Press', 'Incline Bench Press', 'Close Grip Bench Press', 'Dumbbell Bench Press'],
    },
  },
  {
    category: 'Overhead Press',
    variations: {
      beginner: ['Dumbbell Overhead Press', 'Pike Push Ups', 'Lateral Raises'],
      intermediate: ['Overhead Press', 'Dumbbell Overhead Press', 'Arnold Press', 'Push Press'],
      advanced: ['Overhead Press', 'Push Press', 'Arnold Press', 'Z Press'],
    },
  },
  {
    category: 'Press-up Variation',
    variations: {
      beginner: ['Push Ups', 'Incline Push Ups', 'Knee Push Ups'],
      intermediate: ['Diamond Push Ups', 'Wide Push Ups', 'Decline Push Ups'],
      advanced: ['Weighted Push Ups', 'Deficit Push Ups', 'Archer Push Ups', 'Diamond Push Ups'],
    },
  },
];

// Core lifts for Session B
const SESSION_B_CORE: { category: string; variations: ExerciseVariation }[] = [
  {
    category: 'Deadlift',
    variations: {
      beginner: ['Dumbbell Romanian Deadlift', 'Glute Bridge', 'Kettlebell Deadlift'],
      intermediate: ['Conventional Deadlift', 'Romanian Deadlift', 'Dumbbell Romanian Deadlift'],
      advanced: ['Conventional Deadlift', 'Sumo Deadlift', 'Romanian Deadlift', 'Deficit Deadlift'],
    },
  },
  {
    category: 'Bent Over Row',
    variations: {
      beginner: ['Dumbbell Bent Over Row', 'Inverted Rows', 'Single Arm Dumbbell Row'],
      intermediate: ['Bent Over Row', 'Single Arm Dumbbell Row', 'T-Bar Row', 'Inverted Rows'],
      advanced: ['Bent Over Row', 'Pendlay Row', 'T-Bar Row', 'Weighted Inverted Rows'],
    },
  },
  {
    category: 'Bicep Curl',
    variations: {
      beginner: ['Dumbbell Bicep Curl', 'Hammer Curl', 'Resistance Band Curl'],
      intermediate: ['Barbell Curl', 'Dumbbell Bicep Curl', 'Hammer Curl', 'Incline Dumbbell Curl'],
      advanced: ['Barbell Curl', 'Preacher Curl', 'Incline Dumbbell Curl', 'Concentration Curl'],
    },
  },
  {
    category: 'Pull-up / Chin-up',
    variations: {
      beginner: ['Dead Hang', 'Band-Assisted Pull Ups', 'Lat Pulldown'],
      intermediate: ['Pull Ups', 'Chin Ups', 'Lat Pulldown', 'Neutral Grip Pull Ups'],
      advanced: ['Pull Ups', 'Chin Ups', 'Weighted Pull Ups', 'Muscle Ups'],
    },
  },
];

// Accessories for Session A (push/legs focus)
const SESSION_A_ACCESSORIES: { category: string; variations: ExerciseVariation }[] = [
  {
    category: 'Leg Accessory',
    variations: {
      beginner: ['Walking Lunges', 'Step Ups', 'Wall Sit'],
      intermediate: ['Bulgarian Split Squat', 'Walking Lunges', 'Leg Extension', 'Step Ups'],
      advanced: ['Bulgarian Split Squat', 'Leg Extension', 'Sissy Squat', 'Walking Lunges'],
    },
  },
  {
    category: 'Chest/Shoulder Accessory',
    variations: {
      beginner: ['Lateral Raises', 'Front Raises', 'Chest Fly (Dumbbell)'],
      intermediate: ['Lateral Raises', 'Cable Fly', 'Dumbbell Chest Fly', 'Face Pulls'],
      advanced: ['Cable Lateral Raise', 'Pec Deck', 'Dumbbell Chest Fly', 'Cable Crossover'],
    },
  },
  {
    category: 'Core',
    variations: {
      beginner: ['Front Plank', 'Dead Bug', 'Bird Dog'],
      intermediate: ['Hanging Leg Raise', 'Ab Wheel Rollout', 'Russian Twists'],
      advanced: ['Hanging Leg Raise', 'Ab Wheel Rollout', 'Dragon Flag', 'Weighted Plank'],
    },
  },
];

// Accessories for Session B (pull/posterior focus)
const SESSION_B_ACCESSORIES: { category: string; variations: ExerciseVariation }[] = [
  {
    category: 'Hamstring/Glute Accessory',
    variations: {
      beginner: ['Glute Bridge', 'Leg Curl (Machine)', 'Hip Thrust (Bodyweight)'],
      intermediate: ['Hip Thrust', 'Leg Curl (Machine)', 'Good Morning', 'Glute Bridge'],
      advanced: ['Barbell Hip Thrust', 'Nordic Hamstring Curl', 'Good Morning', 'Leg Curl (Machine)'],
    },
  },
  {
    category: 'Back/Rear Delt Accessory',
    variations: {
      beginner: ['Face Pulls (Band)', 'Rear Delt Fly', 'Prone Y Raise'],
      intermediate: ['Face Pulls', 'Rear Delt Fly', 'Straight Arm Pulldown', 'Cable Row'],
      advanced: ['Face Pulls', 'Meadows Row', 'Straight Arm Pulldown', 'Cable Row'],
    },
  },
  {
    category: 'Core',
    variations: {
      beginner: ['Front Plank', 'Mountain Climbers', 'Farmer Walk'],
      intermediate: ['Farmer Walk', 'Suitcase Carry', 'Pallof Press', 'Russian Twists'],
      advanced: ['Farmer Walk', 'Pallof Press', 'L-Sit Hold', 'Weighted Plank'],
    },
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
  'Barbell Curl': 'Dumbbell Bicep Curl', 'Preacher Curl': 'Dumbbell Bicep Curl',
  'Barbell Hip Thrust': 'Hip Thrust (Bodyweight)', 'Good Morning': 'Dumbbell Romanian Deadlift',
};

const DUMBBELL_ALTERNATIVES: Record<string, string> = {
  'Goblet Squat': 'Bodyweight Squats', 'Dumbbell Bench Press': 'Push Ups',
  'Incline Dumbbell Press': 'Decline Push Ups', 'Dumbbell Romanian Deadlift': 'Glute Bridge',
  'Dumbbell Overhead Press': 'Pike Push Ups', 'Arnold Press': 'Pike Push Ups',
  'Dumbbell Bent Over Row': 'Inverted Rows', 'Single Arm Dumbbell Row': 'Inverted Rows',
  'Dumbbell Bicep Curl': 'Resistance Band Curl', 'Hammer Curl': 'Resistance Band Curl',
  'Incline Dumbbell Curl': 'Resistance Band Curl', 'Concentration Curl': 'Resistance Band Curl',
  'Farmer Walk': 'Front Plank', 'Kettlebell Deadlift': 'Glute Bridge',
  'Lateral Raises': 'Front Raises', 'Dumbbell Chest Fly': 'Wide Push Ups',
  'Rear Delt Fly': 'Prone Y Raise', 'Hip Thrust': 'Hip Thrust (Bodyweight)',
};

const MACHINE_ALTERNATIVES: Record<string, string> = {
  'Leg Press': 'Goblet Squat', 'Leg Extension': 'Walking Lunges',
  'Leg Curl (Machine)': 'Glute Bridge', 'Pec Deck': 'Dumbbell Chest Fly',
  'Cable Fly': 'Dumbbell Chest Fly', 'Cable Crossover': 'Wide Push Ups',
  'Cable Lateral Raise': 'Lateral Raises', 'Lat Pulldown': 'Band-Assisted Pull Ups',
  'Cable Row': 'Dumbbell Bent Over Row', 'Straight Arm Pulldown': 'Inverted Rows',
  'Meadows Row': 'Single Arm Dumbbell Row',
};

const BODYWEIGHT_EXERCISES = new Set([
  'Push Ups', 'Incline Push Ups', 'Knee Push Ups', 'Diamond Push Ups', 'Wide Push Ups',
  'Decline Push Ups', 'Archer Push Ups', 'Deficit Push Ups', 'Weighted Push Ups',
  'Pike Push Ups', 'Pull Ups', 'Chin Ups', 'Weighted Pull Ups', 'Muscle Ups',
  'Band-Assisted Pull Ups', 'Neutral Grip Pull Ups', 'Inverted Rows', 'Weighted Inverted Rows',
  'Bodyweight Squats', 'Box Squat', 'Glute Bridge', 'Dead Hang', 'Wall Sit',
  'Walking Lunges', 'Step Ups', 'Bulgarian Split Squat', 'Sissy Squat',
  'Hip Thrust (Bodyweight)', 'Nordic Hamstring Curl',
  'Front Plank', 'Dead Bug', 'Bird Dog', 'Mountain Climbers',
  'Hanging Leg Raise', 'Ab Wheel Rollout', 'Russian Twists', 'Dragon Flag', 'Weighted Plank',
  'L-Sit Hold', 'Prone Y Raise', 'Front Raises', 'Resistance Band Curl',
  'Face Pulls (Band)',
]);

function applyEquipmentFilter(exercise: string, equipment: string[]): string {
  const hasBarbell = equipment.includes('barbells');
  const hasDumbbell = equipment.includes('dumbbells');
  const hasMachines = equipment.includes('machines');
  let result = exercise;
  if (!hasBarbell && BARBELL_ALTERNATIVES[result]) result = BARBELL_ALTERNATIVES[result];
  if (!hasDumbbell && DUMBBELL_ALTERNATIVES[result]) result = DUMBBELL_ALTERNATIVES[result];
  if (!hasMachines && MACHINE_ALTERNATIVES[result]) result = MACHINE_ALTERNATIVES[result];
  return result;
}

// Select a variation from pool based on week number (rotates every 7 days)
function selectVariation(pool: string[], weekNumber: number, slotIndex: number): string {
  if (pool.length === 0) return 'Bodyweight Squats';
  return pool[(weekNumber + slotIndex) % pool.length];
}

function getEquipmentType(exercise: string): 'barbell' | 'dumbbell' | 'bodyweight' | 'machine' {
  if (BODYWEIGHT_EXERCISES.has(exercise)) return 'bodyweight';
  if (exercise.includes('Dumbbell') || exercise.includes('Goblet') || exercise.includes('Arnold') ||
      exercise.includes('Kettlebell') || exercise.includes('Farmer') || exercise.includes('Lateral') ||
      exercise.includes('Hammer') || exercise.includes('Concentration') || exercise.includes('Suitcase')) return 'dumbbell';
  if (exercise.includes('Lat Pulldown') || exercise.includes('Leg Press') || exercise.includes('Machine') ||
      exercise.includes('T-Bar') || exercise.includes('Cable') || exercise.includes('Pec Deck') ||
      exercise.includes('Straight Arm')) return 'machine';
  return 'barbell';
}

interface SetPrescription {
  set: number;
  targetReps: string;
  suggestedWeight: string;
}

function generateSets(
  exercise: string,
  fitnessLevel: string,
  dayNumber: number,
  isCoreLift: boolean
): SetPrescription[] {
  const phase = dayNumber <= 28 ? 1 : dayNumber <= 56 ? 2 : 3;
  const isBodyweight = BODYWEIGHT_EXERCISES.has(exercise);
  const isTimeBased = ['Front Plank', 'Dead Hang', 'Weighted Plank', 'Bird Dog', 'L-Sit Hold', 'Wall Sit'].includes(exercise);

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

  let numSets: number;
  let repRange: string;
  let weightGuide: string;

  if (isCoreLift) {
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
    // Accessories - higher reps, fewer sets
    if (fitnessLevel === 'beginner') {
      numSets = 3;
      repRange = isBodyweight ? (phase === 1 ? '8-10' : phase === 2 ? '10-12' : '12-15') : '10-12';
      weightGuide = isBodyweight ? 'BW' : 'Light';
    } else if (fitnessLevel === 'intermediate') {
      numSets = 3;
      repRange = isBodyweight ? (phase === 1 ? '10-12' : phase === 2 ? '12-15' : '15-20') : '10-12';
      weightGuide = isBodyweight ? 'BW' : 'Light-Moderate';
    } else {
      numSets = phase === 1 ? 3 : 4;
      repRange = isBodyweight ? (phase === 1 ? '12-15' : phase === 2 ? '15-20' : 'Max') : '8-12';
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
  // Linear progression: 1km on day 1 → 5km on day 86
  // Formula: 1 + (4 * (day - 1) / 85) rounded to 1 decimal
  return Math.round((1 + (4 * (day - 1) / 85)) * 10) / 10;
}

function isSessionA(dayNumber: number): boolean {
  return dayNumber % 2 === 1; // Odd days = A, Even days = B
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
      const sessionA = isSessionA(day);

      const coreSlots = sessionA ? SESSION_A_CORE : SESSION_B_CORE;
      const accessorySlots = sessionA ? SESSION_A_ACCESSORIES : SESSION_B_ACCESSORIES;

      // Build 7 exercises: 4 core + 3 accessories
      const exercises = [
        ...coreSlots.map((slot, i) => {
          const pool = slot.variations[level];
          const rawExercise = selectVariation(pool, weekNumber, i);
          const exercise = applyEquipmentFilter(rawExercise, equipment);
          const equipmentType = getEquipmentType(exercise);
          const sets = generateSets(exercise, level, day, true);

          return {
            category: slot.category,
            name: exercise,
            equipment: equipmentType,
            isCore: true,
            sets,
            logged: sets.map(s => ({
              set: s.set,
              reps: null as number | null,
              weight: null as number | null,
              rpe: null as number | null,
              completed: false,
            })),
          };
        }),
        ...accessorySlots.map((slot, i) => {
          const pool = slot.variations[level];
          const rawExercise = selectVariation(pool, weekNumber, i + 4);
          const exercise = applyEquipmentFilter(rawExercise, equipment);
          const equipmentType = getEquipmentType(exercise);
          const sets = generateSets(exercise, level, day, false);

          return {
            category: slot.category,
            name: exercise,
            equipment: equipmentType,
            isCore: false,
            sets,
            logged: sets.map(s => ({
              set: s.set,
              reps: null as number | null,
              weight: null as number | null,
              rpe: null as number | null,
              completed: false,
            })),
          };
        }),
      ];

      days.push({
        program_id: programId,
        user_id: userId,
        day_number: day,
        run_distance_km: runDist,
        strength_time_minutes: 0,
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
