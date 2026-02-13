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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Fetch all public recipes from the library to use as source
    const { data: libraryRecipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, name, category, pack, calories_per_serving, protein_g, carbs_g, fat_g, dietary_tags, prep_time_minutes, cook_time_minutes, servings')
      .eq('is_public', true)
      .order('name');

    if (recipesError) {
      console.error("Failed to fetch recipes:", recipesError);
    }

    // Compact recipe catalogue — name,category,macros,ID only to minimize tokens
    const recipeCatalogue = (libraryRecipes || []).map(r => 
      `${r.name}|${r.category}|${r.calories_per_serving}kcal|P${r.protein_g}C${r.carbs_g}F${r.fat_g}|${r.id}`
    ).join('\n');

    const systemPrompt = `UNBREAKABLE NUTRITION COACH. Build meal plans using ONLY recipes from the library below. Do NOT invent meals — pick from library. Include recipe ID for every selection.

RECIPE LIBRARY (format: Name|Category|Cals|Macros|ID):
${recipeCatalogue}

Rules: Prioritize library recipes. Adjust cals for training vs rest days. Higher carbs on training days.

Return ONLY JSON:
{"planName":"string","overview":"string","weeklyCalories":0,"weeklyProtein":0,"days":[{"dayNumber":1,"dayName":"Monday","isTrainingDay":true,"totalCalories":0,"totalProtein":0,"totalCarbs":0,"totalFat":0,"meals":{"breakfast":{"name":"string","recipeId":"uuid","calories":0,"protein":0,"carbs":0,"fat":0,"prepNotes":"string"},"lunch":{"name":"string","recipeId":"uuid","calories":0,"protein":0,"carbs":0,"fat":0,"prepNotes":"string"},"dinner":{"name":"string","recipeId":"uuid","calories":0,"protein":0,"carbs":0,"fat":0,"prepNotes":"string"},"snacks":[{"name":"string","recipeId":"uuid","calories":0,"protein":0,"carbs":0,"fat":0}]}}],"shoppingList":["string"],"mealPrepTips":["string"],"coachNotes":"string"}`;

    // Build context
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

    const outputInstruction = requestType === 'suggestions' 
      ? 'Provide helpful meal suggestions in a conversational format. Reference specific recipes from the library by name. Be specific and practical.'
      : 'Generate a complete meal plan in the JSON format specified above. Use library recipes where possible. Respond ONLY with valid JSON.';

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

    // Save meal plan items with recipe_id links
    const planItems = [];
    for (const day of mealPlan.days || []) {
      const dayIndex = day.dayNumber - 1;
      
      const addMeal = (meal: any, mealType: string) => {
        if (!meal) return;
        planItems.push({
          user_id: userContext.userId,
          meal_plan_id: savedPlan.id,
          day_of_week: dayIndex,
          meal_type: mealType,
          food_name: meal.name,
          recipe_id: meal.recipeId || null,
          calories: meal.calories,
          protein_g: meal.protein,
          carbs_g: meal.carbs,
          fat_g: meal.fat,
          notes: meal.prepNotes || null,
        });
      };

      addMeal(day.meals?.breakfast, 'breakfast');
      addMeal(day.meals?.lunch, 'lunch');
      addMeal(day.meals?.dinner, 'dinner');
      
      if (day.meals?.snacks) {
        for (const snack of day.meals.snacks) {
          addMeal(snack, 'snack');
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
      message: `Your "${mealPlan.planName}" meal plan is ready in your Fuel hub! Review and confirm the suggested recipes.`,
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
