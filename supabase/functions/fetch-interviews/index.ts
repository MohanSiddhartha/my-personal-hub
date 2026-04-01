import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic = "React", difficulty = "intermediate", count = 5 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            content: `You are a senior tech interviewer. Generate exactly ${count} interview questions for a ${difficulty} level candidate on the topic "${topic}". 
Return ONLY a valid JSON array. Each element must be an object with these fields:
- "question": the interview question (string)
- "type": one of "conceptual", "coding", "behavioral", "system-design" (string)
- "hint": a brief hint to help answer (string)
- "ideal_answer": a concise model answer in 2-4 sentences (string)
- "difficulty": "${difficulty}" (string)
- "follow_up": a good follow-up question (string)

Make questions realistic, specific, and commonly asked in real interviews. Include a mix of types. No markdown, no explanation — just the JSON array.`,
          },
          { role: "user", content: `Generate ${count} ${difficulty} interview questions about ${topic}.` },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    let raw = aiData.choices?.[0]?.message?.content || "[]";
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const questions = JSON.parse(raw);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Interview prep error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate interview questions", questions: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
