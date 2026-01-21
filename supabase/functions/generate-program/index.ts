import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      console.error(`AI gateway error (attempt ${attempt + 1}):`, response.status, errorText);

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
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: "The AI is currently busy. Please wait a moment and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
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
      console.error("Failed to parse AI response:", cleanedContent.substring(0, 500));
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
