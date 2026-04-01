import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query = "software developer" } = await req.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let jobs: any[] = [];

    try {
      // Use Remotive API for remote jobs, filtered for India
      const searchQuery = encodeURIComponent(query);
      const res = await fetch(
        `https://remotive.com/api/remote-jobs?search=${searchQuery}&limit=30`,
        { signal: controller.signal }
      );
      const data = await res.json();

      // Filter for India-compatible jobs and convert salary to INR
      const allJobs = data.jobs || [];
      jobs = allJobs
        .filter((j: any) => {
          const loc = (j.candidate_required_location || "").toLowerCase();
          return (
            loc.includes("india") ||
            loc.includes("asia") ||
            loc.includes("anywhere") ||
            loc.includes("worldwide") ||
            loc === "" ||
            loc.includes("apac")
          );
        })
        .slice(0, 20)
        .map((j: any) => {
          // Convert USD salary to INR (approximate rate)
          let salaryINR: string | null = null;
          if (j.salary) {
            const usdMatch = j.salary.match(/[\d,]+/g);
            if (usdMatch) {
              const nums = usdMatch.map((n: string) => parseInt(n.replace(/,/g, ""), 10));
              if (nums.length >= 2) {
                salaryINR = `₹${(nums[0] * 85).toLocaleString("en-IN")} - ₹${(nums[1] * 85).toLocaleString("en-IN")}`;
              } else if (nums.length === 1) {
                salaryINR = `₹${(nums[0] * 85).toLocaleString("en-IN")}`;
              }
            }
            if (!salaryINR) salaryINR = j.salary;
          }

          return {
            title: j.title,
            company: j.company_name,
            location: j.candidate_required_location || "India (Remote)",
            type: j.job_type || "Full-time",
            url: j.url,
            description: j.description?.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
            salary: salaryINR,
            tags: j.tags || [],
            published_at: j.publication_date,
            company_logo: j.company_logo || null,
            category: j.category || "Software Development",
          };
        });
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
