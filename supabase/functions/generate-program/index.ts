import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProgramRequest {
  goal: string;
  availability: number;
  sessionLength: number;
  level: string;
  commitment: string;
  strengthData?: {
    benchMax?: number;
    squatMax?: number;
    deadliftMax?: number;
    ohpMax?: number;
  };
  speedData?: {
    fiveKTime?: string;
    tenKTime?: string;
    pacePerKm?: string;
  };
  bodyweight?: number;
  age?: number;
  gender?: string;
}

// Full exercise library for AI reference — exercises MUST come from this list
const EXERCISE_LIBRARY_REFERENCE = `
CRITICAL RULE: You MUST ONLY use exercises from this library. Do NOT invent or auto-generate exercise names.

AVAILABLE EXERCISES BY BODY PART:

CHEST:
- Barbell: Flat Bench Press, Incline Bench Press, Decline Bench Press, Close Grip Bench Press, Floor Press
- Dumbbell: Dumbbell Bench Press, Incline Dumbbell Press, Decline Dumbbell Press, Dumbbell Flyes, Incline Dumbbell Flyes, Squeeze Press, Dumbbell Pullovers
- Bodyweight: Push Ups, Wide Push Ups, Decline Push Ups, Diamond Push Ups, Archer Push Ups, Chest Dips
- Cable: Cable Flyes, High Cable Flyes, Low Cable Flyes, Cable Crossovers
- Machine: Chest Press Machine, Pec Deck, Smith Machine Bench Press

BACK:
- Barbell: Conventional Deadlift, Sumo Deadlift, Bent Over Row, Pendlay Row, Barbell Shrug
- Dumbbell: Single Arm Dumbbell Row, Dumbbell Bent Over Row, Dumbbell Pullovers, Dumbbell Shrug
- Bodyweight: Pull Ups, Chin Ups, Inverted Rows, Scapular Pull Ups
- Cable: Lat Pulldown, Seated Cable Row, Face Pulls, Straight Arm Pulldown, Single Arm Cable Row
- Machine: Machine Lat Pulldown, Seated Row Machine, T-Bar Row, Assisted Pull Up Machine

SHOULDERS:
- Barbell: Overhead Press, Push Press, Barbell Upright Row, Behind Neck Press
- Dumbbell: Dumbbell Overhead Press, Lateral Raises, Front Raises, Rear Delt Flyes, Arnold Press, Dumbbell Upright Row
- Bodyweight: Pike Push Ups, Handstand Push Ups
- Cable: Cable Lateral Raises, Cable Front Raises, Cable Face Pulls, Cable Upright Row
- Machine: Machine Shoulder Press, Reverse Pec Deck, Lateral Raise Machine

LEGS:
- Barbell: Back Squat, Front Squat, Romanian Deadlift, Barbell Lunges, Hip Thrust, Zercher Squat, Good Morning
- Dumbbell: Goblet Squat, Dumbbell Romanian Deadlift, Dumbbell Lunges, Dumbbell Step Ups, Dumbbell Bulgarian Split Squat
- Bodyweight: Bodyweight Squats, Walking Lunges, Bulgarian Split Squats, Jump Squats, Pistol Squats, Calf Raises
- Machine: Leg Press, Leg Extension, Leg Curl, Hack Squat, Machine Calf Raises, Smith Machine Squat, Pendulum Squat

ARMS:
- Barbell: Barbell Curl, EZ Bar Curl, Skull Crushers, Close Grip Bench Press, Barbell Preacher Curl
- Dumbbell: Dumbbell Bicep Curl, Hammer Curl, Concentration Curl, Incline Dumbbell Curl, Dumbbell Tricep Kickback, Overhead Dumbbell Extension
- Cable: Cable Curl, Rope Curl, Tricep Pushdown, Rope Pushdown, Overhead Cable Extension, Bayesian Curl
- Machine: Preacher Curl Machine, Tricep Dip Machine
- Bodyweight: Dips, Chin Ups, Diamond Push Ups

CORE:
- Front Plank, Side Plank, Dead Bug, Hanging Leg Raise, Cable Woodchops, Russian Twists, Mountain Climbers, Ab Wheel Rollout, Crunches, Lying Leg Raises, Pallof Press, Bird Dog

GLUTES:
- Barbell Hip Thrust, Dumbbell Hip Thrust, Glute Bridge, Cable Kickbacks, Cable Pull Through, Frog Pumps

CARDIO/CONDITIONING:
- Treadmill Run, Rowing Machine, Stationary Bike, Jump Rope, Burpees, Battle Ropes, Sled Push, Farmers Walk, Kettlebell Swings

EXERCISE ENTRY STANDARD (every exercise in the programme MUST include):
1. Exercise Name (exact match from list above)
2. Equipment Required
3. Sets, Reps, Intensity (RPE or load guidance)
4. Rest periods
5. Coaching notes (2-4 action cues)
6. Regressions for intermediate/advanced exercises
7. Progressions for beginner/intermediate exercises
`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in to use this feature' }),
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

    const requestData: ProgramRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { 
      goal, 
      availability, 
      sessionLength, 
      level, 
      commitment,
      strengthData,
      speedData,
      bodyweight,
      age,
      gender
    } = requestData;

    // Build context about user's current fitness
    let fitnessContext = "";
    
    if (strengthData) {
      const lifts = [];
      if (strengthData.benchMax) lifts.push(`Bench Press 1RM: ${strengthData.benchMax}kg`);
      if (strengthData.squatMax) lifts.push(`Squat 1RM: ${strengthData.squatMax}kg`);
      if (strengthData.deadliftMax) lifts.push(`Deadlift 1RM: ${strengthData.deadliftMax}kg`);
      if (strengthData.ohpMax) lifts.push(`Overhead Press 1RM: ${strengthData.ohpMax}kg`);
      if (lifts.length > 0) {
        fitnessContext += `\n\nCurrent Strength Levels:\n${lifts.join("\n")}`;
      }
    }
    
    if (speedData) {
      const speeds = [];
      if (speedData.fiveKTime) speeds.push(`5K Time: ${speedData.fiveKTime}`);
      if (speedData.tenKTime) speeds.push(`10K Time: ${speedData.tenKTime}`);
      if (speedData.pacePerKm) speeds.push(`Current Pace: ${speedData.pacePerKm}/km`);
      if (speeds.length > 0) {
        fitnessContext += `\n\nCurrent Running Performance:\n${speeds.join("\n")}`;
      }
    }

    if (bodyweight) fitnessContext += `\nBodyweight: ${bodyweight}kg`;
    if (age) fitnessContext += `\nAge: ${age}`;
    if (gender) fitnessContext += `\nGender: ${gender}`;

    const systemPrompt = `You are an elite strength and conditioning coach. Create a concise 12-week training program template.

CRITICAL RULE: You MUST ONLY use exercises from the approved Unbreakable Exercise Library below. Do NOT invent or auto-generate exercise names. Every exercise in your programme must be an exact match from this list.

${EXERCISE_LIBRARY_REFERENCE}

Periodization:
- Phase 1 (Weeks 1-4): Foundation - higher volume, moderate intensity
- Phase 2 (Weeks 5-8): Intensification - moderate volume, higher intensity  
- Phase 3 (Weeks 9-12): Peaking - lower volume, peak intensity
- Deload: Week 4, 8, 12 (reduce volume 40%)

Return ONLY this JSON structure (no markdown):
{
  "programName": "string",
  "overview": "2-3 sentences about the program",
  "weeklySchedule": [{"day": "Monday", "focus": "Lower Strength", "type": "strength|running|rest|active_recovery"}],
  "phases": [{"name": "Foundation", "weeks": "1-4", "focus": "string", "notes": "string"}],
  "templateWeek": {
    "days": [
      {
        "day": "Monday",
        "sessionType": "Lower Strength",
        "duration": "75 mins",
        "warmup": "10 min dynamic stretching",
        "exercises": [
          {"name": "Back Squat", "equipment": "barbell", "sets": 4, "reps": "6-8", "intensity": "RPE 7-8", "rest": "3 min", "notes": "Control the descent"}
        ],
        "cooldown": "5 min stretching"
      }
    ]
  },
  "phaseProgressions": [
    {"phase": "Foundation (Weeks 1-4)", "adjustments": "Start at RPE 7, add weight when hitting top of rep range"},
    {"phase": "Intensification (Weeks 5-8)", "adjustments": "Reduce reps by 2, increase intensity to RPE 8-9"},
    {"phase": "Peaking (Weeks 9-12)", "adjustments": "Work up to heavy singles/doubles, reduce accessory volume"}
  ],
  "progressionRules": ["Add 2.5kg to upper lifts when completing all reps", "Add 5kg to lower lifts"],
  "nutritionTips": ["Eat 1.6-2g protein per kg bodyweight"]
}`;

    const userPrompt = `Create a 12-week hybrid training program:

GOAL: ${goal}
DAYS/WEEK: ${availability}
SESSION LENGTH: ${sessionLength} minutes
LEVEL: ${level}
COMMITMENT: ${commitment}
${fitnessContext}

Create a TEMPLATE WEEK with ${availability} training days that will be repeated with phase-based progressions. Include barbell, dumbbell, bodyweight exercises, and running. Be specific with exercises, sets, reps, and intensity.`;

    // Retry logic with exponential backoff for rate limits
    const maxRetries = 3;
    let lastError: Error | null = null;
    let response: Response | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 2s, 4s, 8s
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`Retry attempt ${attempt + 1}, waiting ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 16000,
        }),
      });

      if (response.ok) {
        break;
      }

      const errorText = await response.text();
      console.error(`Gateway error (attempt ${attempt + 1}):`, response.status, errorText);

      if (response.status === 429) {
        lastError = new Error("Rate limit exceeded");
        continue; // Retry on rate limit
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gateway error: ${response.status}`);
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: "The service is currently busy. Please wait a moment and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in response");
    }

    // Clean and parse the JSON response
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.includes("```json")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```json") + 7);
    } else if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```") + 3);
    }
    if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(0, cleanedContent.lastIndexOf("```"));
    }
    cleanedContent = cleanedContent.trim();
    
    // Extract JSON object - find first { and last }
    const jsonStart = cleanedContent.indexOf("{");
    const jsonEnd = cleanedContent.lastIndexOf("}");
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error("No valid JSON found in response:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse program data - no JSON found");
    }
    
    cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);

    let program;
    try {
      program = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse response:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse program data");
    }

    return new Response(
      JSON.stringify({ program }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-program error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate program" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
