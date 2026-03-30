import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { category } = await req.json().catch(() => ({ category: "tech" }));

    const categoryPrompts: Record<string, string> = {
      tech: "technology, programming, software engineering, computers, internet, AI, and gadgets",
      science: "science, physics, chemistry, biology, space, and nature",
      history: "history of technology, computing history, and inventions",
      random: "any interesting topic including tech, science, history, psychology, and world records",
    };

    const topic = categoryPrompts[category] || categoryPrompts.random;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a facts generator. Generate exactly 12 unique, fascinating, and ACCURATE facts about ${topic}. 
Each fact must be true, verified, and interesting. Include a mix of well-known and obscure facts.

Return ONLY a valid JSON array, no markdown, no code fences. Each element:
{
  "fact": "The actual fact text, 1-2 sentences",
  "category": "Tech" | "Science" | "History" | "Fun",
  "source": "Brief source or context, e.g. 'IEEE Research' or 'NASA' or 'Computer History Museum'",
  "year": "Year if applicable, or null"
}

Make facts concise but complete. Vary the categories. Ensure every fact is accurate and verifiable.`
          },
          {
            role: "user",
            content: `Generate 12 fascinating facts now. Make them unique and different from typical lists.`
          }
        ],
        temperature: 1.0,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Failed to generate facts");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "[]";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const facts = JSON.parse(content);

    return new Response(JSON.stringify({ facts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-facts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
