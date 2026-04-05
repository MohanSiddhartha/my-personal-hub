import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category = "technology" } = await req.json();
    
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(category)}&format=json&origin=*`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch facts");
    
    const data = await response.json();
    
    const facts = (data.query?.search || []).slice(0, 5).map((item: any) => ({
      fact: item.snippet.replace(/<[^>]*>/g, '').substring(0, 200),
      category: category,
      source: "Wikipedia",
      year: null,
    }));

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
