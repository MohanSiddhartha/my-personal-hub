import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json() as Record<string, unknown>;
    const query = (body.query as string || "").toLowerCase().trim();
    
    console.log(`🔍 Jobs query: ${query}`);

    let jobs: any[] = [];

    // 1. Try RemoteOK API - real remote jobs
    try {
      console.log("📡 Fetching from RemoteOK...");
      const res = await fetch("https://remoteok.io/api");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        jobs = jobs.concat(
          data
            .filter((job: any) => 
              !job.id || 
              JSON.stringify(job).toLowerCase().includes(query)
            )
            .slice(0, 5)
            .map((job: any) => ({
              id: job.id || Math.random(),
              title: job.title || "Job",
              company: job.company || "Company",
              location: job.location || "Remote",
              type: "Full-time",
              description: job.description || "",
              salary: job.salary_min ? `${job.salary_min}-${job.salary_max}` : null,
              tags: [],
              published_at: job.published_at || new Date().toISOString(),
              company_logo: null,
              category: query || "general",
              url: job.apply_url || job.url || "#",
            }))
        );
        console.log(`✅ Got ${jobs.length} from RemoteOK`);
      }
    } catch (e) {
      console.log("❌ RemoteOK failed:", e);
    }

    // 2. Try GitHub Jobs API
    try {
      console.log("📡 Fetching from GitHub...");
      const res = await fetch("https://api.github.com/search/repositories?q=" + encodeURIComponent(query) + "&sort=stars&per_page=5", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const data = await res.json();
      
      if (data.items) {
        jobs = jobs.concat(
          data.items.map((repo: any) => ({
            id: repo.id,
            title: `Contribute to ${repo.name}`,
            company: repo.owner?.login || "Open Source",
            location: "Remote",
            type: "Open Source",
            description: repo.description || "",
            salary: null,
            tags: ["open-source"],
            published_at: repo.updated_at || new Date().toISOString(),
            company_logo: repo.owner?.avatar_url,
            category: query || "general",
            url: repo.html_url,
          }))
        );
        console.log(`✅ Got ${data.items.length} from GitHub`);
      }
    } catch (e) {
      console.log("❌ GitHub failed:", e);
    }

    // 3. Try Hacker News Jobs
    try {
      console.log("📡 Fetching from Hacker News...");
      const idsRes = await fetch("https://hacker-news.firebaseio.com/v0/jobstories.json");
      const jobIds = await idsRes.json();
      
      const jobPromises = jobIds.slice(0, 5).map((id: number) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
      );
      
      const hnJobs = await Promise.all(jobPromises);
      jobs = jobs.concat(
        hnJobs
          .filter((j: any) => j && j.title)
          .map((j: any) => ({
            id: j.id,
            title: j.title || "Job",
            company: j.by || "HN User",
            location: "Remote",
            type: "Full-time",
            description: "",
            salary: null,
            tags: [],
            published_at: new Date().toISOString(),
            company_logo: null,
            category: query || "general",
            url: j.url || "#",
          }))
      );
      console.log(`✅ Got HN jobs`);
    } catch (e) {
      console.log("❌ Hacker News failed:", e);
    }

    // Remove duplicates
    const uniqueJobs = Array.from(
      new Map(jobs.map(j => [j.title + j.company, j])).values()
    ).slice(0, 10);

    console.log(`📊 Returning ${uniqueJobs.length} jobs`);

    return new Response(JSON.stringify({ jobs: uniqueJobs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-jobs error:", e);
    return new Response(
      JSON.stringify({ jobs: [], error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
