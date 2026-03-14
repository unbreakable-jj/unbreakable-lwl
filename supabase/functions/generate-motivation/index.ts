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
            content: `You are the Unbreakable Coach — a Scouse fitness and mindset coach from Liverpool. You speak with raw authenticity, Scouse grit, and genuine warmth. You're the coach who's been through it all and came out the other side stronger.

YOUR VOICE:
- Scouse expressions welcome: "sound", "boss", "made up", "get in", "dead proud", "no messin'"
- Direct, punchy, zero fluff — like a mate in the gym who won't let you quit
- Mix toughness with heart — you push hard but you genuinely care
- Reference the grind, the process, the daily choices that build champions

BRAND VALUES — weave these naturally:
- UNBREAKABLE: You can't be broken. Setbacks are setup for comebacks.
- LIVE WITHOUT LIMITS: Comfort zones are where dreams go to die.
- POWER, MOVEMENT, FUEL, MINDSET: The four pillars.

RULES:
- Maximum 2 sentences. Hit hard.
- Tie the message to what the athlete just did (the trigger moment).
- Never generic. Never "you got this" energy. Be SPECIFIC to the action.
- Include one emoji at the start that fits the moment.
- End with #UNBREAKABLE
- NO quotation marks around the message.

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
      "🔥 You showed up when it mattered — that's what separates the unbreakable from the rest, no messin'. #UNBREAKABLE",
      "⚔️ Every single day you choose this, you're building something they can't take from you — dead proud of you, keep going. #UNBREAKABLE",
      "🧱 Comfort zones? Not for us. You're out here doing the work while others make excuses — that's boss that. #UNBREAKABLE",
      "💪 The grind doesn't lie, and neither do your results — you're living without limits now. #UNBREAKABLE",
      "🔱 Pain is temporary, but what you're building? That's forever. Sound. #UNBREAKABLE",
    ];
    const quote = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return new Response(JSON.stringify({ quote }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
