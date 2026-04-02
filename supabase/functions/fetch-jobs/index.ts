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

const INDIA_KEYWORDS = ["india", "bangalore", "bengaluru", "hyderabad", "mumbai", "delhi", "pune", "chennai", "kolkata", "noida", "gurgaon", "gurugram", "ahmedabad", "jaipur", "kochi", "thiruvananthapuram", "indore", "chandigarh", "lucknow", "nagpur", "coimbatore", "vadodara", "bhubaneswar", "visakhapatnam", "mangalore"];

function isIndiaJob(location: string): boolean {
  const loc = location.toLowerCase();
  return INDIA_KEYWORDS.some(kw => loc.includes(kw));
}

function isOpenToIndia(location: string): boolean {
  const loc = location.toLowerCase();
  // "anywhere", "worldwide", empty = could be India
  return loc === "" || loc.includes("anywhere") || loc.includes("worldwide");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query = "software developer" } = await req.json();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let jobs: any[] = [];

    try {
      // Fetch from multiple queries to maximize India results
      const searches = [
        `${query} india`,
        query,
      ];

      const allJobs = new Map<string, any>();

      for (const searchQuery of searches) {
        const encoded = encodeURIComponent(searchQuery);
        const res = await fetch(
          `https://remotive.com/api/remote-jobs?search=${encoded}&limit=50`,
          { signal: controller.signal }
        );
        const data = await res.json();
        for (const j of (data.jobs || [])) {
          if (!allJobs.has(j.id)) {
            allJobs.set(j.id, j);
          }
        }
      }

      // Strictly filter: only India-located or worldwide/anywhere jobs
      const indianCities = ["Bangalore", "Hyderabad", "Mumbai", "Delhi NCR", "Pune", "Chennai", "Kolkata", "Noida", "Gurugram"];

      for (const j of allJobs.values()) {
        const loc = j.candidate_required_location || "";
        const explicitIndia = isIndiaJob(loc);
        const openToIndia = isOpenToIndia(loc);

        if (explicitIndia || openToIndia) {
          // Assign a proper India location label
          let displayLocation: string;
          if (explicitIndia) {
            displayLocation = loc; // already mentions India city
          } else {
            // For "anywhere"/"worldwide", label as Remote India
            displayLocation = "Remote - India 🇮🇳";
          }

          jobs.push({
            title: j.title,
            company: j.company_name,
            location: displayLocation.includes("🇮🇳") ? displayLocation : displayLocation + " 🇮🇳",
            type: j.job_type || "Full-time",
            url: j.url,
            description: j.description?.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
            salary: convertSalaryToINR(j.salary),
            tags: j.tags || [],
            published_at: j.publication_date,
            company_logo: j.company_logo || null,
            category: j.category || "Software Development",
          });
        }
      }

      // Sort: explicit India jobs first, then worldwide
      jobs.sort((a, b) => {
        const aIndia = INDIA_KEYWORDS.some(kw => a.location.toLowerCase().includes(kw)) ? 0 : 1;
        const bIndia = INDIA_KEYWORDS.some(kw => b.location.toLowerCase().includes(kw)) ? 0 : 1;
        return aIndia - bIndia;
      });

      // Cap at 30
      jobs = jobs.slice(0, 30);
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
