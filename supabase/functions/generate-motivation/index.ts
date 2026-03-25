import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { trigger, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing configuration");

    const triggerDescriptions: Record<string, string> = {
      sign_in: "The athlete just opened the app for a new session.",
      session_complete: "The athlete just finished a training session.",
      habits_logged: "The athlete just smashed all 5 daily habits.",
      programme_complete: "The athlete just completed an entire training programme.",
    };

    const triggerContext = triggerDescriptions[trigger] || "The athlete is using the app.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are the Unbreakable Coach — part drill sergeant, part best mate, part philosopher who deadlifts. Your voice is raw, real, and occasionally funny. You make people feel ALIVE.

YOUR VOICE:
- Punchy, vivid, slightly unhinged energy — like a coach who headbutts the whiteboard before a team talk
- Mix savage honesty with genuine warmth and wit
- Use unexpected metaphors, dark humour, or visceral imagery that sticks in people's heads
- Occasionally be poetic or philosophical — then snap back to reality

BRAND PILLARS — weave these naturally:
- POWER: Strength, force, breaking barriers, iron therapy
- MOVEMENT: Cardio, endurance, chasing greatness (or the ice cream van)
- FUEL: Nutrition, energy, feeding the machine properly
- MINDSET: Mental toughness, resilience, the war between your ears

RULES:
- Maximum 2 sentences. Make every word earn its place.
- Tie the message to what the athlete just did (the trigger moment).
- Be SPECIFIC and CREATIVE — never generic motivational poster energy.
- Include one emoji at the start that fits the vibe.
- End with #UNBREAKABLE
- NO quotation marks around the message.
- Vary your tone: sometimes fierce, sometimes funny, sometimes deep. Never boring.
- Examples of good energy: "Your muscles don't know it's Tuesday, but your excuses do.", "Gravity just filed a complaint — you're lifting too heavy for its liking.", "The version of you that quit is watching from the couch. Wave goodbye."

Return ONLY the motivational message text, nothing else.`
          },
          {
            role: "user",
            content: `${triggerContext}${context ? ` Context: ${context}` : ''}\n\nGenerate a unique, branded Unbreakable motivational message.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI service unavailable");
    }

    const aiResponse = await response.json();
    const quote = aiResponse.choices?.[0]?.message?.content?.trim();
    if (!quote) throw new Error("No response");

    return new Response(JSON.stringify({ quote }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-motivation error:", e);
    const fallbacks = [
      "🦍 Somewhere out there, the old you is watching from the sofa — make them jealous. #UNBREAKABLE",
      "🔥 Your alarm went off and you chose war instead of snooze — that's a different breed. #UNBREAKABLE",
      "⚡ Gravity just filed a complaint about you — keep lifting, let it cry. #UNBREAKABLE",
      "🧠 The battle between your ears is the hardest fight you'll ever win, and you're winning it right now. #UNBREAKABLE",
      "🥩 You didn't come this far to eat beige food and live a beige life — fuel the machine. #UNBREAKABLE",
      "🏴 Nobody's coming to save you, and that's the best news you'll hear all day. #UNBREAKABLE",
      "💀 Comfort zones are where dreams go to decompose — you chose to build instead. #UNBREAKABLE",
      "🫀 Your heart pumps the same blood as every champion who ever lived — act like it. #UNBREAKABLE",
    ];
    const quote = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return new Response(JSON.stringify({ quote }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
