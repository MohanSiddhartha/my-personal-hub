import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category, difficulty, count } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const catPrompt = category && category !== "All" ? `Technologies/Topics: ${category}. Generate questions specifically about these technologies.` : "Categories: Angular, React, SQL, .NET, TypeScript, JavaScript, Python, System Design, DevOps, Data Structures";
    const diffPrompt = difficulty && difficulty !== "all" ? `Difficulty: ${difficulty}` : "Mix of basic, intermediate, and pro difficulty";
    const numQ = count || 10;

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
            content: `You are a technical quiz generator. Generate exactly ${numQ} high-quality multiple choice questions for developer interview preparation. Each question must be unique, challenging, and test real-world knowledge.

Return ONLY a valid JSON array, no markdown, no code fences. Each element:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correct": 0-3,
  "difficulty": "basic"|"intermediate"|"pro",
  "category": "...",
  "explanation": "1-2 sentence explanation"
}

${catPrompt}
${diffPrompt}

Make questions practical and relevant to real-world development. Include questions about best practices, common pitfalls, and latest features. Vary the correct answer position.`
          },
          {
            role: "user",
            content: `Generate ${numQ} technical interview MCQ questions now.`
          }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Failed to generate questions");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "[]";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const questions = JSON.parse(content);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
