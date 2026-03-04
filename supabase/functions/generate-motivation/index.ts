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
      sign_in: "The athlete just signed into the app.",
      session_complete: "The athlete just completed a training session.",
      habits_logged: "The athlete just completed their Daily 5 habits.",
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
            content: `You are the Unbreakable Coach — a gritty, no-nonsense motivational voice. Generate ONE powerful, unique motivational message.

RULES:
- Maximum 2 sentences. Punchy, raw, real.
- Match the tone to the trigger moment.
- Mix styles: sometimes poetic, sometimes blunt, sometimes warrior-like, sometimes philosophical.
- Never generic. Never cliché "you got this" energy. Think David Goggins meets Marcus Aurelius.
- Include one relevant emoji at the start.
- End with #UNBREAKABLE

Return ONLY the quote text, nothing else.`
          },
          {
            role: "user",
            content: `${triggerContext}${context ? ` Additional context: ${context}` : ''}\n\nGenerate a unique motivational message.`
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
    // Fallback quotes so the popup still works
    const fallbacks = [
      "🔥 The pain you feel today is the strength you'll carry tomorrow. Keep showing up. #UNBREAKABLE",
      "⚔️ Champions aren't built in comfort zones. You chose this path — now own it. #UNBREAKABLE",
      "🧱 Every rep, every step, every choice — you're building something they can't break. #UNBREAKABLE",
      "💀 Weakness is a choice. You didn't come here to be average. #UNBREAKABLE",
      "🔱 The world breaks everyone, but some grow strongest at the broken places. #UNBREAKABLE",
    ];
    const quote = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return new Response(JSON.stringify({ quote }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
