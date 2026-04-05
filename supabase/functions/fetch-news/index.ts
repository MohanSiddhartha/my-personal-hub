import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  source: { name: string };
  publishedAt: string;
  url: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic = "technology" } = await req.json() as Record<string, unknown>;
    
    // Using NewsAPI free tier - 100 requests/day free
    const url = `https://newsapi.org/v2/everything?q=${topic}&sortBy=publishedAt&language=en&pageSize=5`;
    
    const headers: Record<string, string> = {
      "User-Agent": "supabase-edge-function",
    };
    
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Failed to fetch news");
    
    const data = await response.json() as { articles: NewsArticle[] };
    
    const articles = (data.articles || []).slice(0, 5).map((article: NewsArticle) => ({
      title: article.title,
      summary: article.description || article.content?.substring(0, 150) || "No summary available",
      source: article.source.name,
      date: new Date(article.publishedAt).toISOString().split('T')[0],
      url: article.url,
    }));

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    console.error("fetch-news error:", errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
