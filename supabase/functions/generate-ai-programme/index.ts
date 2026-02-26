import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UserContext {
  userId: string;
  profile?: {
    displayName?: string;
    age?: number;
    gender?: string;
    heightCm?: number;
    weightKg?: number;
  };
  goals?: string;
  experience?: string;
  injuries?: string;
  equipment?: string[];
  daysPerWeek?: number;
  sessionLength?: number;
  previousPerformance?: {
    benchMax?: number;
    squatMax?: number;
    deadliftMax?: number;
    fiveKTime?: string;
  };
  chatContext?: string;
}

interface ProgrammeRequest {
  userContext: UserContext;
  prompt: string;
  requestType: 'full_programme' | 'quick_programme' | 'chat_request';
}

// Compact exercise name list — coaching cues/standards live client-side in exerciseCoachingData.ts
const EXERCISE_NAMES = `ONLY use exercises from this list. No invented names.
CHEST: Flat Bench Press,Incline Bench Press,Decline Bench Press,Close Grip Bench Press,Floor Press,Dumbbell Bench Press,Incline Dumbbell Press,Decline Dumbbell Press,Dumbbell Flyes,Incline Dumbbell Flyes,Squeeze Press,Dumbbell Pullovers,Push Ups,Wide Push Ups,Decline Push Ups,Diamond Push Ups,Archer Push Ups,Chest Dips,Cable Flyes,High Cable Flyes,Low Cable Flyes,Cable Crossovers,Chest Press Machine,Pec Deck,Smith Machine Bench Press
BACK: Conventional Deadlift,Sumo Deadlift,Bent Over Row,Pendlay Row,Barbell Shrug,Single Arm Dumbbell Row,Dumbbell Bent Over Row,Dumbbell Pullovers,Dumbbell Shrug,Pull Ups,Chin Ups,Inverted Rows,Scapular Pull Ups,Lat Pulldown,Seated Cable Row,Face Pulls,Straight Arm Pulldown,Single Arm Cable Row,Machine Lat Pulldown,Seated Row Machine,T-Bar Row,Assisted Pull Up Machine
SHOULDERS: Overhead Press,Push Press,Barbell Upright Row,Behind Neck Press,Dumbbell Overhead Press,Lateral Raises,Front Raises,Rear Delt Flyes,Arnold Press,Dumbbell Upright Row,Pike Push Ups,Handstand Push Ups,Cable Lateral Raises,Cable Front Raises,Cable Face Pulls,Cable Upright Row,Machine Shoulder Press,Reverse Pec Deck,Lateral Raise Machine
LEGS: Back Squat,Front Squat,Romanian Deadlift,Barbell Lunges,Hip Thrust,Zercher Squat,Good Morning,Goblet Squat,Dumbbell Romanian Deadlift,Dumbbell Lunges,Dumbbell Step Ups,Dumbbell Bulgarian Split Squat,Bodyweight Squats,Walking Lunges,Bulgarian Split Squats,Jump Squats,Pistol Squats,Calf Raises,Leg Press,Leg Extension,Leg Curl,Hack Squat,Machine Calf Raises,Smith Machine Squat,Pendulum Squat
ARMS: Barbell Curl,EZ Bar Curl,Skull Crushers,Barbell Preacher Curl,Dumbbell Bicep Curl,Hammer Curl,Concentration Curl,Incline Dumbbell Curl,Dumbbell Tricep Kickback,Overhead Dumbbell Extension,Cable Curl,Rope Curl,Tricep Pushdown,Rope Pushdown,Overhead Cable Extension,Bayesian Curl,Preacher Curl Machine,Tricep Dip Machine,Dips,Diamond Push Ups
CORE: Front Plank,Side Plank,Dead Bug,Hanging Leg Raise,Cable Woodchops,Russian Twists,Mountain Climbers,Ab Wheel Rollout,Crunches,Lying Leg Raises,Pallof Press,Bird Dog
GLUTES: Barbell Hip Thrust,Dumbbell Hip Thrust,Glute Bridge,Cable Kickbacks,Cable Pull Through,Frog Pumps
CARDIO: Treadmill Run,Rowing Machine,Stationary Bike,Jump Rope,Burpees,Battle Ropes,Sled Push,Farmers Walk,Kettlebell Swings`;

function extractJsonFromResponse(response: string): unknown {
  let cleaned = response
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonStart = cleaned.search(/[\{\[]/);
  const jsonEnd = cleaned.lastIndexOf(jsonStart !== -1 && cleaned[jsonStart] === '[' ? ']' : '}');

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON object found in response");
  }

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, "");

    return JSON.parse(cleaned);
  }
}

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

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: ProgrammeRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("AI service is not configured");
    }

    const { userContext, prompt, requestType } = requestData;

    // Build comprehensive user context
    let contextString = `USER PROFILE AND CONTEXT:\n`;
    
    if (userContext.profile?.displayName) {
      contextString += `Name: ${userContext.profile.displayName}\n`;
    }
    if (userContext.profile?.age) {
      contextString += `Age: ${userContext.profile.age}\n`;
    }
    if (userContext.profile?.gender) {
      contextString += `Gender: ${userContext.profile.gender}\n`;
    }
    if (userContext.profile?.heightCm) {
      contextString += `Height: ${userContext.profile.heightCm}cm\n`;
    }
    if (userContext.profile?.weightKg) {
      contextString += `Weight: ${userContext.profile.weightKg}kg\n`;
    }
    if (userContext.goals) {
      contextString += `Goals: ${userContext.goals}\n`;
    }
    if (userContext.experience) {
      contextString += `Experience Level: ${userContext.experience}\n`;
    }
    if (userContext.injuries) {
      contextString += `Injuries/Limitations: ${userContext.injuries}\n`;
    }
    if (userContext.equipment && userContext.equipment.length > 0) {
      contextString += `Available Equipment: ${userContext.equipment.join(', ')}\n`;
    }
    if (userContext.daysPerWeek) {
      contextString += `Training Days Per Week: ${userContext.daysPerWeek}\n`;
    }
    if (userContext.sessionLength) {
      contextString += `Session Length: ${userContext.sessionLength} minutes\n`;
    }
    if (userContext.previousPerformance) {
      const perf = userContext.previousPerformance;
      const perfLines = [];
      if (perf.benchMax) perfLines.push(`Bench 1RM: ${perf.benchMax}kg`);
      if (perf.squatMax) perfLines.push(`Squat 1RM: ${perf.squatMax}kg`);
      if (perf.deadliftMax) perfLines.push(`Deadlift 1RM: ${perf.deadliftMax}kg`);
      if (perf.fiveKTime) perfLines.push(`5K Time: ${perf.fiveKTime}`);
      if (perfLines.length > 0) {
        contextString += `Current Performance: ${perfLines.join(', ')}\n`;
      }
    }
    if (userContext.chatContext) {
      contextString += `\nConversation Context:\n${userContext.chatContext}\n`;
    }

    const systemPrompt = `Elite S&C coach. Create bespoke 12-week programmes using ONLY exercises from the approved library. Coaching cues are handled client-side — focus on exercise selection, sets/reps/intensity/rest.

${EXERCISE_NAMES}

Rules: Match equipment+experience. Periodize for goals. Account for injuries. Include warmup/cooldown.

Return ONLY valid JSON:
{"programName":"string","overview":"string","weeklySchedule":[{"day":"Monday","focus":"string","type":"strength|running|rest|active_recovery"}],"phases":[{"name":"string","weeks":"1-4","focus":"string","notes":"string"}],"templateWeek":{"days":[{"day":"Monday","sessionType":"string","duration":"60 mins","warmup":"string","exercises":[{"name":"Back Squat","equipment":"barbell","sets":4,"reps":"6-8","intensity":"RPE 7","rest":"3 min","notes":"string"}],"cooldown":"string"}]},"phaseProgressions":[{"phase":"string","adjustments":"string"}],"progressionRules":["string"],"nutritionTips":["string"],"metadata":{"origin":"ai_chat","createdFor":"${userContext.profile?.displayName || 'User'}"}}`;

    const userPrompt = `${contextString}

USER REQUEST: "${prompt}"

Create a fully bespoke, personalised training programme for this specific user. The programme should:
1. Be 12 weeks long with proper periodization
2. Match their available training days and session length
3. Account for any injuries or limitations
4. Use only equipment they have access to (or bodyweight if not specified)
5. Include detailed coaching notes for each exercise
6. Feel like it was written by a coach who knows them personally

If the user hasn't provided enough information, make intelligent assumptions based on typical profiles but note these in the overview.`;

    // Retry logic
    const maxRetries = 3;
    let response: Response | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        const delayMs = Math.pow(2, attempt) * 1000;
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
          max_tokens: 20000,
        }),
      });

      if (response.ok) break;

      if (response.status === 429) continue;
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error(`Gateway error (attempt ${attempt + 1}):`, response.status, errorText);
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: "Coach is busy right now. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from coach");
    }

    // Parse the programme JSON with robust extraction
    let program;
    try {
      program = extractJsonFromResponse(content);
    } catch (parseError) {
      console.error("Parse error:", content.substring(0, 500));
      throw new Error("Programme data formatting issue. Please try again.");
    }

    // Return programme for user review — do NOT auto-save
    return new Response(
      JSON.stringify({ program, savedToHub: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-ai-programme error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create programme" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
