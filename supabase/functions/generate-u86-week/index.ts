import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Exercise pools by U86 category and equipment
const POOLS: Record<string, Record<string, string[]>> = {
  lower_push: {
    barbell: ['Back Squat', 'Front Squat', 'Zercher Squat'],
    dumbbell: ['Goblet Squat'],
    bodyweight: ['Bodyweight Squats', 'Jump Squats'],
    machine: ['Leg Press', 'Hack Squat', 'Smith Machine Squat', 'Pendulum Squat'],
    bands: ['Bodyweight Squats'],
  },
  lower_hinge: {
    barbell: ['Conventional Deadlift', 'Sumo Deadlift', 'Romanian Deadlift', 'Good Morning'],
    dumbbell: ['Dumbbell Romanian Deadlift', 'Dumbbell Hip Thrust'],
    bodyweight: ['Glute Bridge', 'Frog Pumps'],
    machine: ['Leg Curl'],
    bands: ['Glute Bridge'],
  },
  upper_push: {
    barbell: ['Flat Bench Press', 'Incline Bench Press', 'Overhead Press', 'Close Grip Bench Press', 'Push Press'],
    dumbbell: ['Dumbbell Bench Press', 'Incline Dumbbell Press', 'Dumbbell Overhead Press', 'Arnold Press'],
    bodyweight: ['Push Ups', 'Wide Push Ups', 'Decline Push Ups', 'Diamond Push Ups', 'Pike Push Ups'],
    machine: ['Chest Press Machine', 'Machine Shoulder Press', 'Smith Machine Bench Press'],
    bands: ['Push Ups'],
  },
  upper_pull: {
    barbell: ['Bent Over Row', 'Pendlay Row', 'Barbell Upright Row'],
    dumbbell: ['Single Arm Dumbbell Row', 'Dumbbell Bent Over Row', 'Dumbbell Shrug'],
    bodyweight: ['Pull Ups', 'Chin Ups', 'Inverted Rows'],
    machine: ['Machine Lat Pulldown', 'Seated Row Machine', 'T-Bar Row'],
    bands: ['Inverted Rows'],
  },
  unilateral: {
    barbell: ['Barbell Lunges'],
    dumbbell: ['Dumbbell Lunges', 'Dumbbell Step Ups', 'Dumbbell Bulgarian Split Squat'],
    bodyweight: ['Walking Lunges', 'Bulgarian Split Squats'],
    machine: ['Leg Extension'],
    bands: ['Walking Lunges'],
  },
  core_anti_ext: {
    barbell: [],
    dumbbell: [],
    bodyweight: ['Front Plank', 'Dead Bug', 'Ab Wheel Rollout', 'Crunches', 'Lying Leg Raises', 'Hanging Leg Raise'],
    machine: [],
    bands: ['Dead Bug'],
  },
  core_rotation: {
    barbell: [],
    dumbbell: ['Farmers Walk'],
    bodyweight: ['Russian Twists', 'Mountain Climbers', 'Bird Dog', 'Side Plank'],
    machine: [],
    bands: ['Russian Twists'],
  },
  conditioning: {
    barbell: ['Kettlebell Swings'],
    dumbbell: ['Kettlebell Swings'],
    bodyweight: ['Burpees', 'Jump Rope', 'Jump Squats', 'Mountain Climbers'],
    machine: ['Rowing Machine', 'Stationary Bike', 'Battle Ropes', 'Sled Push'],
    bands: ['Burpees'],
  },
};

// Difficulty filter: exclude complex movements for beginners
const ADVANCED_ONLY = new Set([
  'Front Squat', 'Zercher Squat', 'Sumo Deadlift', 'Push Press',
  'Pistol Squats', 'Archer Push Ups', 'Handstand Push Ups',
  'Pendlay Row', 'Ab Wheel Rollout', 'Hanging Leg Raise',
]);

const INTERMEDIATE_PLUS = new Set([
  'Close Grip Bench Press', 'Arnold Press', 'Bulgarian Split Squats',
  'Decline Push Ups', 'Diamond Push Ups', 'Chin Ups',
]);

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

function getAvailableExercises(
  category: string,
  equipment: string[],
  fitnessLevel: string
): string[] {
  const pool = POOLS[category];
  if (!pool) return [];

  const exercises = new Set<string>();
  // Always include bodyweight
  (pool.bodyweight || []).forEach(e => exercises.add(e));
  
  for (const equip of equipment) {
    const key = equip === 'dumbbells' ? 'dumbbell' :
                equip === 'barbells' ? 'barbell' :
                equip === 'machines' ? 'machine' : equip;
    (pool[key] || []).forEach(e => exercises.add(e));
  }

  // Filter by level
  let filtered = Array.from(exercises);
  if (fitnessLevel === 'beginner') {
    filtered = filtered.filter(e => !ADVANCED_ONLY.has(e) && !INTERMEDIATE_PLUS.has(e));
  } else if (fitnessLevel === 'intermediate') {
    filtered = filtered.filter(e => !ADVANCED_ONLY.has(e));
  }

  return filtered.length > 0 ? filtered : Array.from(exercises).slice(0, 2);
}

function selectExercise(pool: string[], dayNumber: number, seed: number): string {
  if (pool.length === 0) return 'Bodyweight Squats';
  const idx = (dayNumber + seed) % pool.length;
  return pool[idx];
}

const CATEGORIES = [
  'lower_push', 'lower_hinge', 'upper_push', 'upper_pull',
  'unilateral', 'core_anti_ext', 'core_rotation', 'conditioning',
];

const CATEGORY_LABELS: Record<string, string> = {
  lower_push: 'Lower Push',
  lower_hinge: 'Lower Hinge',
  upper_push: 'Upper Push',
  upper_pull: 'Upper Pull',
  unilateral: 'Unilateral',
  core_anti_ext: 'Core – Anti-Extension',
  core_rotation: 'Core – Rotation / Carry',
  conditioning: 'Conditioning / Output',
};

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

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { programId, weekNumber, fitnessLevel, equipment, injuries } = await req.json();

    // Calculate which days this week covers
    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = Math.min(startDay + 6, 86);

    // Build exercise pools for each category
    const pools: Record<string, string[]> = {};
    for (const cat of CATEGORIES) {
      pools[cat] = getAvailableExercises(cat, equipment, fitnessLevel);
    }

    // Use service role for inserts
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userId = (claimsData.claims as any).sub;
    const days = [];

    // Intensity labels by level
    const intensityNote = fitnessLevel === 'beginner' 
      ? 'Moderate effort. Rest 60-90s between exercises. Leave 2-3 reps in reserve.'
      : fitnessLevel === 'intermediate'
      ? 'Strong effort. Rest 45-60s between exercises. Leave 1-2 reps in reserve.'
      : 'High effort. Rest 30-45s between exercises. Leave 1 rep in reserve.';

    for (let day = startDay; day <= endDay; day++) {
      const runDist = getRunDistance(day);
      const strengthTime = getStrengthTime(runDist);
      const timePerExercise = Math.floor(strengthTime / 8);

      // Select 8 exercises with rotation
      const exercises = CATEGORIES.map((cat, i) => ({
        category: CATEGORY_LABELS[cat],
        name: selectExercise(pools[cat], day, i * 7),
        timeMinutes: timePerExercise,
        instruction: `Work for ${timePerExercise} minutes. ${intensityNote}`,
      }));

      days.push({
        program_id: programId,
        user_id: userId,
        day_number: day,
        run_distance_km: runDist,
        strength_time_minutes: strengthTime,
        exercises,
      });
    }

    // Insert days
    const { data: insertedDays, error: insertError } = await serviceClient
      .from('unbreakable_86_days')
      .upsert(days, { onConflict: 'program_id,day_number' })
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to generate week');
    }

    // Update program's last_generated_week
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
