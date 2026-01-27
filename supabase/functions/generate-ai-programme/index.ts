import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Full exercise library for AI reference
const EXERCISE_LIBRARY_SUMMARY = `
AVAILABLE EXERCISES BY BODY PART:

CHEST:
- Barbell: Flat/Incline/Decline Bench Press, Close Grip Bench, Floor Press
- Dumbbell: Flat/Incline/Decline Press, Flyes, Squeeze Press, Pullovers
- Bodyweight: Push Ups (Standard, Wide, Decline, Diamond, Archer), Chest Dips
- Cable: Flyes (High/Low), Crossovers

BACK:
- Barbell: Deadlift (Conventional/Sumo), Bent Over Row, Pendlay Row
- Dumbbell: Single Arm Row, Bent Over Row, Pullovers
- Bodyweight: Pull Ups, Chin Ups, Inverted Rows
- Cable: Lat Pulldown, Seated Row, Face Pulls, Straight Arm Pulldown
- Machine: Lat Pulldown, Seated Row

SHOULDERS:
- Barbell: Overhead Press, Push Press, Upright Row
- Dumbbell: Overhead Press, Lateral/Front/Rear Raises, Arnold Press
- Bodyweight: Pike Push Ups, Handstand Push Ups
- Cable: Lateral/Front Raises, Face Pulls

LEGS:
- Barbell: Back/Front Squat, Romanian Deadlift, Lunges, Hip Thrust
- Dumbbell: Goblet Squat, Romanian Deadlift, Lunges, Step Ups
- Bodyweight: Squats, Lunges, Bulgarian Split Squats, Jump Squats
- Machine: Leg Press, Leg Extension, Leg Curl, Hack Squat, Calf Raises

ARMS:
- Barbell: Bicep Curls, Skull Crushers, Close Grip Bench
- Dumbbell: Bicep Curls, Hammer Curls, Tricep Kickbacks, Overhead Extension
- Cable: Curls, Tricep Pushdowns, Rope Curls
- Bodyweight: Dips, Chin Ups, Diamond Push Ups

CORE:
- Planks (Front/Side), Dead Bug, Hanging Leg Raise, Cable Woodchops
- Russian Twists, Mountain Climbers, Ab Wheel, Crunches, Leg Raises

GLUTES:
- Hip Thrust (Barbell/Dumbbell), Glute Bridge, Cable Kickbacks
- Romanian Deadlift, Bulgarian Split Squat, Sumo Deadlift

CARDIO:
- Treadmill, Rowing, Bike, Jump Rope, Burpees, Battle Ropes

COACHING CUES:
- Compound movements: Brace core, maintain neutral spine, control eccentric
- Pressing: Retract scapulae, elbows at 45 degrees, full lockout
- Pulling: Lead with elbows, squeeze at contraction, full stretch
- Squatting: Knees track toes, depth to parallel minimum, drive through heels
- Hinging: Hip hinge pattern, maintain flat back, hamstring tension
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const systemPrompt = `You are an elite strength & conditioning coach creating FULLY BESPOKE training programmes. Each programme must be uniquely crafted for this specific athlete based on their profile, goals, and constraints.

${EXERCISE_LIBRARY_SUMMARY}

PROGRAMME CREATION RULES:
1. NEVER use generic templates - every programme is custom
2. Match exercise selection to user's equipment and experience
3. Include coaching cues/notes for each exercise
4. Apply proper periodization based on goals
5. Consider injuries and limitations in exercise selection
6. Progress volume/intensity appropriately for experience level
7. Include warm-up and cooldown recommendations
8. Add rest day guidance and recovery notes

RETURN ONLY VALID JSON (no markdown):
{
  "programName": "Descriptive Name Based on User's Goal",
  "overview": "2-3 sentences explaining the programme approach for this specific user",
  "weeklySchedule": [{"day": "Monday", "focus": "Lower Strength", "type": "strength|running|rest|active_recovery"}],
  "phases": [{"name": "Foundation", "weeks": "1-4", "focus": "Building base strength and movement quality", "notes": "Focus on technique, RPE 6-7"}],
  "templateWeek": {
    "days": [
      {
        "day": "Monday",
        "sessionType": "Lower Strength",
        "duration": "60 mins",
        "warmup": "5 min cardio, hip mobility drills, glute activation",
        "exercises": [
          {
            "name": "Back Squat",
            "equipment": "barbell",
            "sets": 4,
            "reps": "6-8",
            "intensity": "RPE 7",
            "rest": "3 min",
            "notes": "Brace core, knees track toes, full depth if mobility allows"
          }
        ],
        "cooldown": "Lower body stretching, 5 min walk"
      }
    ]
  },
  "phaseProgressions": [
    {"phase": "Foundation (Weeks 1-4)", "adjustments": "Start conservative, focus on form. Add weight when hitting top of rep range with good form."},
    {"phase": "Building (Weeks 5-8)", "adjustments": "Increase intensity by 5%, reduce rest slightly."},
    {"phase": "Peak (Weeks 9-12)", "adjustments": "Peak intensity, maintain volume, deload week 12."}
  ],
  "progressionRules": ["Add 2.5kg to upper body when completing all reps at RPE <8", "Add 5kg to lower body lifts", "If missing reps, stay at weight for another week"],
  "nutritionTips": ["Protein: 1.8-2.2g per kg bodyweight", "Hydrate well before training"],
  "metadata": {
    "origin": "ai_chat",
    "createdFor": "${userContext.profile?.displayName || 'User'}",
    "promptUsed": "${prompt.replace(/"/g, '\\"').substring(0, 500)}"
  }
}`;

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

    // Parse the programme JSON
    let cleanedContent = content.trim();
    
    // Remove markdown blocks
    if (cleanedContent.includes("```json")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```json") + 7);
    } else if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```") + 3);
    }
    if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(0, cleanedContent.lastIndexOf("```"));
    }
    cleanedContent = cleanedContent.trim();
    
    // Extract JSON
    const jsonStart = cleanedContent.indexOf("{");
    const jsonEnd = cleanedContent.lastIndexOf("}");
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error("No valid JSON found:", cleanedContent.substring(0, 500));
      throw new Error("Coach couldn't format the programme properly. Please try again.");
    }
    
    cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);

    let program;
    try {
      program = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Parse error:", cleanedContent.substring(0, 500));
      throw new Error("Programme data formatting issue. Please try again.");
    }

    // If we have Supabase credentials and user ID, save directly to database
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && userContext.userId) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Check active program count
        const { data: activePrograms } = await supabase
          .from('training_programs')
          .select('id')
          .eq('user_id', userContext.userId)
          .eq('is_active', true);
        
        const activeCount = activePrograms?.length || 0;
        
        // Save the programme
        const { data: savedProgram, error: saveError } = await supabase
          .from('training_programs')
          .insert([{
            user_id: userContext.userId,
            name: program.programName,
            overview: program.overview,
            program_data: program,
            is_active: false,
          }])
          .select()
          .single();
        
        if (saveError) {
          console.error("Failed to save programme:", saveError);
        } else {
          return new Response(
            JSON.stringify({ 
              program, 
              savedToHub: true, 
              programId: savedProgram.id,
              activeCount,
              message: `Programme "${program.programName}" has been created and saved to your My Programmes hub!`
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue and return programme without saving
      }
    }

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
