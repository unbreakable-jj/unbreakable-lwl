import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("Coaching service is temporarily unavailable");
    }

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
          ...messages,
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
