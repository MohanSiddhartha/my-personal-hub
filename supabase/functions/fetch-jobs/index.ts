import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query = "software developer", location = "India" } = await req.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let jobs: any[] = [];

    try {
      // Use Remotive API (free, no key needed) for remote tech jobs
      const searchQuery = encodeURIComponent(query);
      const res = await fetch(
        `https://remotive.com/api/remote-jobs?search=${searchQuery}&limit=20`,
        { signal: controller.signal }
      );
      const data = await res.json();
      jobs = (data.jobs || []).map((j: any) => ({
        title: j.title,
        company: j.company_name,
        location: j.candidate_required_location || "Remote",
        type: j.job_type || "Full-time",
        url: j.url,
        description: j.description?.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
        salary: j.salary || null,
        tags: j.tags || [],
        published_at: j.publication_date,
        company_logo: j.company_logo || null,
        category: j.category || "Software Development",
      }));
    } finally {
      clearTimeout(timeout);
    }

    return new Response(JSON.stringify({ jobs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=600" },
    });
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch jobs", jobs: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
