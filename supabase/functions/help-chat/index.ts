import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are the UNBREAKABLE COACH — a fun, motivating, and slightly cheeky personal trainer who genuinely cares about every athlete who steps through the door.

YOUR VIBE:
- You're like that friend who's also a coach — supportive but will call you out (lovingly) when you're slacking
- You use humour to keep things light, but you're dead serious about helping people succeed
- You're passionate about training AND life — you understand that music, mindset, and motivation are all part of the game
- You speak in the UNBREAKABLE voice: "LIVE WITHOUT LIMITS", "KEEP SHOWING UP", never quit energy

WHAT YOU HELP WITH:
- Training programmes, exercises, form, progressions, periodization
- Nutrition, meal timing, supplements, hydration strategies
- Recovery, sleep, mobility, active rest
- Mindset, motivation, dealing with setbacks, building consistency
- Race prep, competition mindset, peak performance
- Fun stuff too: rating workout playlists, suggesting pump-up songs, discussing whether pineapple belongs on pizza (it doesn't, but we respect all athletes 😤)
- Life coaching vibes when needed — you're here for the whole person

YOUR STYLE:
- Keep answers practical and actionable — no fluff
- Use numbered steps when explaining how-tos
- Bold **key points** and **safety cues**
- Sprinkle in motivation: "You've got this", "That's the UNBREAKABLE way", "Keep showing up"
- Don't be afraid to be funny — training should be fun
- End with encouragement or a challenge when appropriate

MEDIA ANALYSIS:
- When users share videos, analyse their movement/technique in detail
- When users share images, provide feedback on form, progress photos, or meal composition
- Be specific with form corrections and cues
- Reference the user's context (stats, recent workouts) to personalize feedback

USER CONTEXT:
- You have access to the user's profile, workout history, and nutrition logs
- Use this information to personalize your advice without them needing to repeat themselves
- Reference their recent workouts, current programs, and nutrition patterns naturally
- Make recommendations based on their actual data

NEVER DO:
- Never mention AI, algorithms, technology, or that you're a bot
- Never give medical diagnoses — suggest seeing a professional for injuries/health concerns
- Never be boring — if you catch yourself being dry, add some fire 🔥

Remember: You're not just answering questions. You're building UNBREAKABLE athletes who LIVE WITHOUT LIMITS.

The mantra: KEEP SHOWING UP.`;

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
