import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UserContext {
  userId: string;
  goals?: {
    dailyCalories?: number;
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
  };
  dietaryPreferences?: string[];
  restrictions?: string[];
  trainingLoad?: {
    weeklyWorkouts?: number;
    avgDuration?: number;
    nextWorkoutType?: string;
  };
  chatContext?: string;
}

const systemPrompt = `You are the UNBREAKABLE NUTRITION COACH. Generate bespoke meal plans tailored to each athlete's unique needs.

WHEN GENERATING MEAL PLANS:
1. Create a 7-day meal plan with breakfast, lunch, dinner, and snacks
2. Each meal must include: name, calories, protein, carbs, fat, and brief prep notes
3. Consider the athlete's training load and adjust calories/macros accordingly
4. Training days = higher carbs and calories
5. Rest days = slightly lower calories, maintain protein
6. Include practical, real-food options that can be prepped in batches

OUTPUT FORMAT (JSON):
{
  "planName": "string",
  "overview": "string describing the plan",
  "weeklyCalories": number,
  "weeklyProtein": number,
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Monday",
      "isTrainingDay": boolean,
      "totalCalories": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFat": number,
      "meals": {
        "breakfast": { "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "prepNotes": "string" },
        "lunch": { "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "prepNotes": "string" },
        "dinner": { "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "prepNotes": "string" },
        "snacks": [{ "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number }]
      }
    }
  ],
  "shoppingList": ["string array of key ingredients"],
  "mealPrepTips": ["string array of batch cooking tips"],
  "coachNotes": "string with personalized coaching advice"
}

NEVER generate generic plans. Each plan MUST be unique to this athlete's context.`;

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

    const { userContext, prompt, requestType } = await req.json() as {
      userContext: UserContext;
      prompt: string;
      requestType: 'full_plan' | 'suggestions' | 'chat_request';
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Build context for AI
    let contextMessage = `ATHLETE CONTEXT:\n`;
    
    if (userContext.goals) {
      contextMessage += `- Daily Targets: ${userContext.goals.dailyCalories || 2000} kcal, ${userContext.goals.dailyProtein || 150}g protein\n`;
    }
    
    if (userContext.dietaryPreferences?.length) {
      contextMessage += `- Dietary Preferences: ${userContext.dietaryPreferences.join(', ')}\n`;
    }
    
    if (userContext.restrictions?.length) {
      contextMessage += `- Restrictions: ${userContext.restrictions.join(', ')}\n`;
    }
    
    if (userContext.trainingLoad) {
      contextMessage += `- Training: ${userContext.trainingLoad.weeklyWorkouts || 4} sessions/week\n`;
      if (userContext.trainingLoad.nextWorkoutType) {
        contextMessage += `- Next session: ${userContext.trainingLoad.nextWorkoutType}\n`;
      }
    }

    if (userContext.chatContext) {
      contextMessage += `\nRECENT CHAT CONTEXT:\n${userContext.chatContext}\n`;
    }

    contextMessage += `\nREQUEST: ${prompt}`;

    // Determine if we need full JSON or conversational response
    const outputInstruction = requestType === 'suggestions' 
      ? 'Provide helpful meal suggestions in a conversational format. Be specific and practical.'
      : 'Generate a complete meal plan in the JSON format specified above. Respond ONLY with valid JSON.';

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
          { role: "user", content: `${contextMessage}\n\n${outputInstruction}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service unavailable");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // For suggestions, return text directly
    if (requestType === 'suggestions') {
      return new Response(JSON.stringify({ 
        type: 'suggestions',
        content 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For full plans, parse JSON and save to database
    let mealPlan;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      mealPlan = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(JSON.stringify({ 
        type: 'suggestions',
        content,
        parseError: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save the meal plan to database
    const { data: savedPlan, error: saveError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: userContext.userId,
        name: mealPlan.planName || 'AI Generated Plan',
        description: mealPlan.overview,
        is_active: false,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      throw new Error("Failed to save meal plan");
    }

    // Save meal plan items for each day
    const planItems = [];
    for (const day of mealPlan.days || []) {
      const dayIndex = day.dayNumber - 1;
      
      if (day.meals?.breakfast) {
        planItems.push({
          user_id: userContext.userId,
          meal_plan_id: savedPlan.id,
          day_of_week: dayIndex,
          meal_type: 'breakfast',
          food_name: day.meals.breakfast.name,
          calories: day.meals.breakfast.calories,
          protein_g: day.meals.breakfast.protein,
          carbs_g: day.meals.breakfast.carbs,
          fat_g: day.meals.breakfast.fat,
          notes: day.meals.breakfast.prepNotes,
        });
      }
      
      if (day.meals?.lunch) {
        planItems.push({
          user_id: userContext.userId,
          meal_plan_id: savedPlan.id,
          day_of_week: dayIndex,
          meal_type: 'lunch',
          food_name: day.meals.lunch.name,
          calories: day.meals.lunch.calories,
          protein_g: day.meals.lunch.protein,
          carbs_g: day.meals.lunch.carbs,
          fat_g: day.meals.lunch.fat,
          notes: day.meals.lunch.prepNotes,
        });
      }
      
      if (day.meals?.dinner) {
        planItems.push({
          user_id: userContext.userId,
          meal_plan_id: savedPlan.id,
          day_of_week: dayIndex,
          meal_type: 'dinner',
          food_name: day.meals.dinner.name,
          calories: day.meals.dinner.calories,
          protein_g: day.meals.dinner.protein,
          carbs_g: day.meals.dinner.carbs,
          fat_g: day.meals.dinner.fat,
          notes: day.meals.dinner.prepNotes,
        });
      }
      
      if (day.meals?.snacks) {
        for (const snack of day.meals.snacks) {
          planItems.push({
            user_id: userContext.userId,
            meal_plan_id: savedPlan.id,
            day_of_week: dayIndex,
            meal_type: 'snack',
            food_name: snack.name,
            calories: snack.calories,
            protein_g: snack.protein,
            carbs_g: snack.carbs,
            fat_g: snack.fat,
          });
        }
      }
    }

    if (planItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('meal_plan_items')
        .insert(planItems);

      if (itemsError) {
        console.error("Items save error:", itemsError);
      }
    }

    return new Response(JSON.stringify({
      type: 'plan',
      plan: mealPlan,
      savedToHub: true,
      planId: savedPlan.id,
      message: `Your "${mealPlan.planName}" meal plan is ready in your Fuel hub!`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-meal-plan error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Failed to generate meal plan" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
