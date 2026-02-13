import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Compact exercise name list for coach reference
const EXERCISE_NAMES = `CHEST: Flat Bench Press,Incline Bench Press,Decline Bench Press,Close Grip Bench Press,Floor Press,Dumbbell Bench Press,Incline Dumbbell Press,Decline Dumbbell Press,Dumbbell Flyes,Incline Dumbbell Flyes,Squeeze Press,Dumbbell Pullovers,Push Ups,Wide Push Ups,Decline Push Ups,Diamond Push Ups,Archer Push Ups,Chest Dips,Cable Flyes,High Cable Flyes,Low Cable Flyes,Cable Crossovers,Chest Press Machine,Pec Deck,Smith Machine Bench Press
BACK: Conventional Deadlift,Sumo Deadlift,Bent Over Row,Pendlay Row,Barbell Shrug,Single Arm Dumbbell Row,Dumbbell Bent Over Row,Dumbbell Pullovers,Dumbbell Shrug,Pull Ups,Chin Ups,Inverted Rows,Scapular Pull Ups,Lat Pulldown,Seated Cable Row,Face Pulls,Straight Arm Pulldown,Single Arm Cable Row,Machine Lat Pulldown,Seated Row Machine,T-Bar Row,Assisted Pull Up Machine
SHOULDERS: Overhead Press,Push Press,Barbell Upright Row,Behind Neck Press,Dumbbell Overhead Press,Lateral Raises,Front Raises,Rear Delt Flyes,Arnold Press,Dumbbell Upright Row,Pike Push Ups,Handstand Push Ups,Cable Lateral Raises,Cable Front Raises,Cable Face Pulls,Cable Upright Row,Machine Shoulder Press,Reverse Pec Deck,Lateral Raise Machine
LEGS: Back Squat,Front Squat,Romanian Deadlift,Barbell Lunges,Hip Thrust,Zercher Squat,Good Morning,Goblet Squat,Dumbbell Romanian Deadlift,Dumbbell Lunges,Dumbbell Step Ups,Dumbbell Bulgarian Split Squat,Bodyweight Squats,Walking Lunges,Bulgarian Split Squats,Jump Squats,Pistol Squats,Calf Raises,Leg Press,Leg Extension,Leg Curl,Hack Squat,Machine Calf Raises,Smith Machine Squat,Pendulum Squat
ARMS: Barbell Curl,EZ Bar Curl,Skull Crushers,Barbell Preacher Curl,Dumbbell Bicep Curl,Hammer Curl,Concentration Curl,Incline Dumbbell Curl,Dumbbell Tricep Kickback,Overhead Dumbbell Extension,Cable Curl,Rope Curl,Tricep Pushdown,Rope Pushdown,Overhead Cable Extension,Bayesian Curl,Preacher Curl Machine,Tricep Dip Machine,Dips,Diamond Push Ups
CORE: Front Plank,Side Plank,Dead Bug,Hanging Leg Raise,Cable Woodchops,Russian Twists,Mountain Climbers,Ab Wheel Rollout,Crunches,Lying Leg Raises,Pallof Press,Bird Dog
GLUTES: Barbell Hip Thrust,Dumbbell Hip Thrust,Glute Bridge,Cable Kickbacks,Cable Pull Through,Frog Pumps
CARDIO: Treadmill Run,Rowing Machine,Stationary Bike,Jump Rope,Burpees,Battle Ropes,Sled Push,Farmers Walk,Kettlebell Swings`;

const systemPrompt = `You are the UNBREAKABLE COACH — motivating, slightly cheeky personal trainer. LIVE WITHOUT LIMITS energy.

Help with: training, nutrition, recovery, mindset, race prep. Be practical, actionable, encouraging. Bold **key points**. End with motivation.

EXERCISE RULES: When suggesting exercises, ONLY use names from this list (coaching cues handled client-side):
${EXERCISE_NAMES}

Analyse media when shared (form checks, meal photos). Use user context data to personalise.

Never mention AI/bots. Never diagnose medical issues. Never invent exercise names outside the library.`;

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

    const { messages, userContext, mediaUrls } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("Coaching service is temporarily unavailable");
    }

    // Build enhanced system prompt with user context
    let enhancedSystemPrompt = systemPrompt;
    if (userContext) {
      enhancedSystemPrompt += `\n\n[CURRENT USER DATA]\n${userContext}`;
    }

    // Process messages to include media references
    const processedMessages = messages.map((msg: any) => {
      if (msg.role === 'user' && mediaUrls && mediaUrls.length > 0) {
        // For the most recent user message, include media context
        const mediaContext = mediaUrls.map((media: { type: string; url: string }) => 
          `[User attached ${media.type}: ${media.url}]`
        ).join('\n');
        
        return {
          role: msg.role,
          content: `${msg.content}\n\n${mediaContext}`,
        };
      }
      return msg;
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...processedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Coach is catching their breath — try again in a moment!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Coach is on a quick break — try again shortly!" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Coach couldn't respond — please try again" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("help-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Coach is unavailable right now" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
