import { corsHeaders } from "../_shared/cors.ts";

const USD_TO_INR = 85;

function convertSalaryToINR(salary: string | null): string | null {
  if (!salary) return null;
  const usdMatch = salary.match(/[\d,]+/g);
  if (!usdMatch) return salary;
  const nums = usdMatch.map((n: string) => parseInt(n.replace(/,/g, ""), 10)).filter((n: number) => !isNaN(n) && n > 0);
  if (nums.length >= 2) {
    return `₹${(nums[0] * USD_TO_INR).toLocaleString("en-IN")} - ₹${(nums[1] * USD_TO_INR).toLocaleString("en-IN")} /yr`;
  } else if (nums.length === 1) {
    return `₹${(nums[0] * USD_TO_INR).toLocaleString("en-IN")} /yr`;
  }
  return salary;
}

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
      const searchQuery = encodeURIComponent(query);
      const res = await fetch(
        `https://remotive.com/api/remote-jobs?search=${searchQuery}&limit=25`,
        { signal: controller.signal }
      );
      const data = await res.json();
      jobs = (data.jobs || []).map((j: any) => {
        const loc = (j.candidate_required_location || "").toLowerCase();
        // Determine if explicitly India-friendly
        const indiaFriendly = loc.includes("india") || loc.includes("asia") || loc.includes("anywhere") || loc.includes("worldwide") || loc.includes("apac") || loc === "";
        return {
          title: j.title,
          company: j.company_name,
          location: indiaFriendly ? (j.candidate_required_location || "Remote") + " 🇮🇳" : j.candidate_required_location || "Remote",
          type: j.job_type || "Full-time",
          url: j.url,
          description: j.description?.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
          salary: convertSalaryToINR(j.salary),
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
