import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CardioRequest {
  activityType: 'walk' | 'run' | 'cycle';
  goal: 'fitness' | 'distance' | 'speed' | 'endurance' | 'weight_loss';
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  sessionsPerWeek: number;
  sessionLength: number; // minutes
  targetDistance?: string; // e.g., "5K", "10K", "Half Marathon"
  currentPace?: string; // e.g., "6:30/km"
  age?: number;
  gender?: 'male' | 'female';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: CardioRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { 
      activityType,
      goal, 
      currentLevel,
      sessionsPerWeek,
      sessionLength,
      targetDistance,
      currentPace,
      age,
      gender
    } = requestData;

    // Build context
    let context = "";
    if (targetDistance) context += `\nTarget Distance: ${targetDistance}`;
    if (currentPace) context += `\nCurrent Pace: ${currentPace}`;
    if (age) context += `\nAge: ${age}`;
    if (gender) context += `\nGender: ${gender}`;

    const activityName = activityType === 'walk' ? 'Walking' : activityType === 'run' ? 'Running' : 'Cycling';

    const systemPrompt = `You are an elite endurance coach. Create a comprehensive 12-week ${activityName.toLowerCase()} programme.

Programme Structure:
- Phase 1 (Weeks 1-4): Base Building - establish aerobic foundation, build consistency
- Phase 2 (Weeks 5-8): Development - increase intensity and volume progressively
- Phase 3 (Weeks 9-11): Peak Performance - optimize speed and endurance
- Phase 4 (Week 12): Taper/Race Prep - reduce volume, maintain intensity

Return ONLY this JSON structure (no markdown):
{
  "programName": "string",
  "overview": "2-3 sentences about the programme",
  "activityType": "${activityType}",
  "weeklySchedule": [{"day": "Monday", "focus": "Easy ${activityName}", "type": "${activityType}|cross_training|rest|active_recovery"}],
  "phases": [{"name": "Base Building", "weeks": "1-4", "focus": "string", "notes": "string"}],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "Base Building",
      "totalDistance": "15km",
      "sessions": [
        {
          "day": "Monday",
          "sessionType": "Easy ${activityName}",
          "duration": "30 mins",
          "distance": "3-4km",
          "intensity": "Zone 2 - conversational pace",
          "warmup": "5 min easy walk",
          "mainSession": [
            {"segment": "Easy ${activityType}", "duration": "25 min", "notes": "Stay in Zone 2"}
          ],
          "cooldown": "5 min walk + stretching",
          "notes": "Focus on form and breathing"
        }
      ]
    }
  ],
  "progressionRules": ["Increase weekly distance by 10% max", "Add intervals after 4 weeks"],
  "recoveryTips": ["Sleep 7-9 hours", "Stay hydrated"],
  "nutritionTips": ["Fuel before longer sessions"]
}`;

    const userPrompt = `Create a 12-week ${activityName.toLowerCase()} programme:

ACTIVITY: ${activityName}
GOAL: ${goal}
LEVEL: ${currentLevel}
SESSIONS/WEEK: ${sessionsPerWeek}
SESSION LENGTH: ${sessionLength} minutes
${context}

Create a progressive 12-week programme with ${sessionsPerWeek} sessions per week, each around ${sessionLength} minutes. Include variety: easy sessions, tempo work, intervals (if appropriate for level), and recovery. Be specific with distances, paces, and intensity zones. Generate ALL 12 weeks with proper periodization.`;

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let response: Response | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
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

      if (response.ok) break;

      const errorText = await response.text();
      console.error(`Gateway error (attempt ${attempt + 1}):`, response.status, errorText);

      if (response.status === 429) continue;
      
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

    // Clean and parse JSON
    let cleanedContent = content.trim();
    
    if (cleanedContent.includes("```json")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```json") + 7);
    } else if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(cleanedContent.indexOf("```") + 3);
    }
    if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.substring(0, cleanedContent.lastIndexOf("```"));
    }
    cleanedContent = cleanedContent.trim();
    
    const jsonStart = cleanedContent.indexOf("{");
    const jsonEnd = cleanedContent.lastIndexOf("}");
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error("No valid JSON found in response:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse programme data - no JSON found");
    }
    
    cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);

    let program;
    try {
      program = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse response:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse programme data");
    }

    return new Response(
      JSON.stringify({ program }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-cardio-program error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate programme" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
