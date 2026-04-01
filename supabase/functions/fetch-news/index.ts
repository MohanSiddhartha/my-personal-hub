import { corsHeaders } from "../_shared/cors.ts";

const GNEWS_BASE = "https://gnews.io/api/v4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = "technology" } = await req.json();
    const apiKey = Deno.env.get("GNEWS_API_KEY");
    let articles = [];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      if (apiKey) {
        const url = `${GNEWS_BASE}/top-headlines?category=${category}&lang=en&country=in&max=12&apikey=${apiKey}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        articles = (data.articles || []).map((a: any) => ({
          title: a.title,
          description: a.description,
          url: a.url,
          source: a.source?.name || "Unknown",
          image_url: a.image,
          published_at: a.publishedAt,
        }));
      } else {
        const tags = ["technology", "webdev", "programming", "ai", "javascript", "react", "typescript"];
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        const page = Math.floor(Math.random() * 3) + 1;
        const res = await fetch(
          `https://dev.to/api/articles?per_page=12&page=${page}&tag=${randomTag}&top=7`,
          { signal: controller.signal }
        );
        const data = await res.json();
        articles = (data || []).map((a: any) => ({
          title: a.title,
          description: a.description,
          url: a.url,
          source: a.organization?.name || a.user?.name || "Dev.to",
          image_url: a.cover_image || a.social_image,
          published_at: a.published_at,
          reading_time: a.reading_time_minutes,
          tags: a.tag_list || [],
          reactions: a.positive_reactions_count || 0,
          comments: a.comments_count || 0,
        }));
      }
    } finally {
      clearTimeout(timeout);
    }

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch news", articles: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
