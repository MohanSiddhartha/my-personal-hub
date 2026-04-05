import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message = "" } = await req.json();
    
    // Try using Hugging Face Inference API (free tier available)
    const hfToken = Deno.env.get("HF_API_KEY");
    
    if (!hfToken) {
      // Fallback smart responses based on keywords
      const smartResponses: Record<string, string> = {
        "quiz": "I can help you generate quizzes! Click the Quiz section to get started with technical questions.",
        "jobs": "Looking for tech jobs? Check the Jobs section to find available positions.",
        "facts": "Want to learn interesting facts? Head to the Facts section for daily insights.",
        "interview": "Preparing for interviews? The Interview Prep section has resources and tips.",
        "hello": "Hi! I'm SIRA, your learning assistant. How can I help you today?",
        "help": "I can help with quizzes, facts, jobs, interviews, and more!",
      };
      
      let response = "I'm SIRA, your learning assistant. Ask me about quizzes, facts, jobs, interviews, or any tech topic!";
      
      for (const [key, value] of Object.entries(smartResponses)) {
        if (message.toLowerCase().includes(key)) {
          response = value;
          break;
        }
      }
      
      return new Response(JSON.stringify({ reply: response }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Use Hugging Face Inference for real AI responses
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `You are SIRA, a helpful learning assistant for programming and tech topics. Answer this: ${message}`,
        parameters: { max_new_tokens: 100 },
      }),
    });
    
    const data = await response.json();
    const reply = data[0]?.generated_text || "I'm here to help with your learning!";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ reply: "I'm SIRA, your learning assistant. Ask me anything about tech!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
