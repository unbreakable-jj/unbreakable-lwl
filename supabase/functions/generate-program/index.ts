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

    const systemPrompt = `You are an elite strength and conditioning coach creating personalized 12-week training programs. You specialize in hybrid training combining barbell work, dumbbell accessories, bodyweight exercises, and running.

Your programs follow proven periodization principles:
- Weeks 1-4: Foundation/Accumulation phase (higher volume, moderate intensity)
- Weeks 5-8: Intensification phase (moderate volume, higher intensity)
- Weeks 9-12: Peaking/Realization phase (lower volume, peak intensity)

Always include:
1. Progressive overload through weight, reps, or sets
2. Appropriate deload weeks (every 4th week typically)
3. Exercise variety within movement patterns
4. Running that complements strength goals
5. Rest day placement for optimal recovery

Format your response as a structured JSON object with the following schema:
{
  "programName": "string - catchy program name",
  "overview": "string - 2-3 sentence program description",
  "weeklySchedule": [
    {
      "day": "string - e.g. Monday",
      "focus": "string - e.g. Upper Body Strength",
      "type": "strength" | "running" | "rest" | "active_recovery"
    }
  ],
  "phases": [
    {
      "name": "string - phase name",
      "weeks": "string - e.g. Weeks 1-4",
      "focus": "string - phase focus",
      "notes": "string - key points for this phase"
    }
  ],
  "weeks": [
    {
      "weekNumber": number,
      "phase": "string - which phase",
      "isDeload": boolean,
      "days": [
        {
          "day": "string - day name",
          "sessionType": "string - e.g. Upper Strength",
          "duration": "string - e.g. 60 mins",
          "warmup": "string - warmup protocol",
          "exercises": [
            {
              "name": "string",
              "equipment": "barbell" | "dumbbell" | "bodyweight" | "running",
              "sets": number | string,
              "reps": string,
              "intensity": "string - RPE or % or pace",
              "rest": "string",
              "notes": "string - form cues or progression notes"
            }
          ],
          "cooldown": "string - cooldown protocol"
        }
      ]
    }
  ],
  "progressionRules": [
    "string - how to progress through the program"
  ],
  "nutritionTips": [
    "string - nutrition recommendations for the goal"
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`;

    const userPrompt = `Create a 12-week training program with these parameters:

GOAL: ${goal}
TRAINING DAYS PER WEEK: ${availability}
SESSION LENGTH: ${sessionLength} minutes
EXPERIENCE LEVEL: ${level}
COMMITMENT LEVEL: ${commitment}
${fitnessContext}

Requirements:
- Use only barbell, dumbbell, bodyweight exercises, and running
- Sessions must fit within ${sessionLength} minutes
- Appropriate intensity for ${level} level
- ${commitment === 'realistic' ? 'Conservative progression suitable for busy lifestyle' : commitment === 'committed' ? 'Steady progression with consistent effort expected' : 'Aggressive progression for dedicated athletes'}
- Include specific sets, reps, and intensity guidelines
- Provide the full 12-week program with daily workouts`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
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
