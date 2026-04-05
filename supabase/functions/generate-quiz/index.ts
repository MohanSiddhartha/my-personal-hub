import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Category name to Open Trivia Database ID mapping
const categoryMap: Record<string, number> = {
  "react": 18,
  "angular": 18,
  "vue": 18,
  "vue.js": 18,
  "svelte": 18,
  "ember": 18,
  "python": 18,
  "java": 18,
  "javascript": 18,
  "typescript": 18,
  "c++": 18,
  "c#": 18,
  "go": 18,
  "rust": 18,
  "php": 18,
  "ruby": 18,
  "swift": 18,
  "kotlin": 18,
  "node.js": 18,
  "express": 18,
  "nest": 18,
  "flask": 18,
  "django": 18,
  "spring": 18,
  "sql": 17,
  "mysql": 17,
  "postgres": 17,
  "postgresql": 17,
  "mongodb": 17,
  "redis": 17,
  "docker": 18,
  "kubernetes": 18,
  "aws": 18,
  "azure": 18,
  "gcp": 18,
  "devops": 18,
  "system design": 25,
  "data structures": 18,
};

function decodeHtml(html: string): string {
  const map: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'",
    '&nbsp;': ' ', '&#8217;': "'", '&#8220;': '"', '&#8221;': '"',
    '&hellip;': '...', '&mdash;': '—', '&ndash;': '–',
  };
  return html.replace(/&[a-zA-Z0-9#]+;/g, (ent) => map[ent] || ent);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json() as Record<string, unknown>;
    let category = (body.category as string || "").toLowerCase().trim();
    const count = Math.min((body.count as number) || 5, 10);

    console.log(`📝 Quiz request: category="${category}", count=${count}`);

    // Split if multiple categories (e.g., "React, Python, Java")
    if (category.includes(",")) {
      category = category.split(",")[0].trim();
    }

    // Map to Open Trivia ID
    const triviaCategoryId = categoryMap[category] || 18;
    
    console.log(`✅ Mapped "${category}" to OpenTrivia ID: ${triviaCategoryId}`);

    // Fetch from Open Trivia Database
    const url = `https://opentdb.com/api.php?amount=${count}&category=${triviaCategoryId}&type=multiple`;
    console.log(`🔗 Fetching: ${url}`);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`OpenTrivia responded with ${response.status}`);

    const data = await response.json() as any;
    
    if (!data.results || data.results.length === 0) {
      console.log("⚠️ No questions from OpenTrivia, returning defaults");
      return new Response(JSON.stringify({
        questions: [
          {
            question: "What is the primary advantage of using version control?",
            options: ["Track code changes", "Compile faster", "Run tests", "Deploy apps"],
            correct: 0,
            difficulty: "basic",
            category: "General",
            explanation: "Version control tracks changes, enables collaboration, and maintains history."
          }
        ]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const questions = data.results.map((q: any) => {
      const correct = decodeHtml(q.correct_answer);
      const options = [
        correct,
        ...q.incorrect_answers.map((a: any) => decodeHtml(a))
      ].sort(() => Math.random() - 0.5);

      return {
        question: decodeHtml(q.question),
        options,
        correct: options.indexOf(correct),
        difficulty: q.difficulty,
        category: decodeHtml(q.category),
        explanation: `This is a ${q.difficulty} question about ${decodeHtml(q.category)}.`
      };
    });

    console.log(`✅ Generated ${questions.length} questions for category: ${category}`);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(
      JSON.stringify({
        questions: [
          {
            question: "What does API stand for?",
            options: ["Application Programming Interface", "Advanced Programming Integration", "Application Process", "Other"],
            correct: 0,
            difficulty: "basic",
            category: "General",
            explanation: "API = Application Programming Interface"
          }
        ],
        error: e instanceof Error ? e.message : "Unknown error"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
