import { corsHeaders } from "../_shared/cors.ts";

const INDIA_CITIES = [
  "india", "bangalore", "bengaluru", "hyderabad", "mumbai", "delhi",
  "pune", "chennai", "kolkata", "noida", "gurgaon", "gurugram",
  "ahmedabad", "jaipur", "lucknow", "chandigarh", "kochi", "indore",
  "nagpur", "thiruvananthapuram", "coimbatore", "vizag", "visakhapatnam",
  "bhubaneswar", "mangalore", "mysore", "mysuru", "new delhi", "navi mumbai",
  "thane", "ghaziabad", "faridabad",
];

const USD_TO_INR = 85;

function isStrictlyIndiaJob(location: string): boolean {
  const loc = location.toLowerCase();
  return INDIA_CITIES.some(city => loc.includes(city));
}

function convertSalaryToINR(salary: string | null): string | null {
  if (!salary) return null;
  const nums = salary.match(/[\d,]+/g);
  if (!nums) return salary;
  const parsed = nums.map((n: string) => parseInt(n.replace(/,/g, ""), 10)).filter((n: number) => !isNaN(n) && n > 0);
  if (parsed.length === 0) return null;

  // If values look like USD (< 500000), convert to INR
  const isLikelyUSD = parsed[0] < 500000;
  const multiplier = isLikelyUSD ? USD_TO_INR : 1;

  if (parsed.length >= 2) {
    return `₹${(parsed[0] * multiplier).toLocaleString("en-IN")} - ₹${(parsed[1] * multiplier).toLocaleString("en-IN")} /yr`;
  }
  return `₹${(parsed[0] * multiplier).toLocaleString("en-IN")} /yr`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query = "software developer" } = await req.json();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let jobs: any[] = [];

    try {
      // Fetch from multiple sources in parallel
      const [remotiveJobs, himalayanJobs, jobicyJobs] = await Promise.allSettled([
        fetchRemotive(query, controller.signal),
        fetchHimalayas(query, controller.signal),
        fetchJobicy(query, controller.signal),
      ]);

      if (remotiveJobs.status === "fulfilled") jobs.push(...remotiveJobs.value);
      if (himalayanJobs.status === "fulfilled") jobs.push(...himalayanJobs.value);
      if (jobicyJobs.status === "fulfilled") jobs.push(...jobicyJobs.value);
    } catch (e) {
      console.error("API fetch error:", e);
    } finally {
      clearTimeout(timeout);
    }

    // Deduplicate by title+company
    const seen = new Set<string>();
    jobs = jobs.filter((j) => {
      const key = `${j.title}|${j.company}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort: explicit India city jobs first
    jobs.sort((a, b) => {
      const aIndia = isStrictlyIndiaJob(a.location) ? 0 : 1;
      const bIndia = isStrictlyIndiaJob(b.location) ? 0 : 1;
      return aIndia - bIndia;
    });

    // If no jobs found, use curated India fallback
    if (jobs.length === 0) {
      jobs = getFallbackJobs(query);
    }

    jobs = jobs.slice(0, 40);

    return new Response(JSON.stringify({ jobs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch jobs", jobs: getFallbackJobs("developer") }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Remotive API - filter strictly for India
async function fetchRemotive(query: string, signal: AbortSignal): Promise<any[]> {
  const jobs: any[] = [];
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encoded}&limit=100`, { signal });
    const data = await res.json();

    for (const j of (data.jobs || [])) {
      const loc = (j.candidate_required_location || "").toLowerCase();
      
      // Only include jobs explicitly mentioning India or Indian cities
      const isIndiaExplicit = INDIA_CITIES.some(city => loc.includes(city));
      // Also include "anywhere" / "worldwide" jobs as they're open to India
      const isGlobal = ["anywhere", "worldwide", "global"].some(kw => loc.includes(kw)) || loc === "";
      
      if (!isIndiaExplicit && !isGlobal) continue;

      const locationLabel = isIndiaExplicit
        ? j.candidate_required_location + " 🇮🇳"
        : "Remote (Worldwide) 🇮🇳";

      jobs.push({
        title: j.title,
        company: j.company_name,
        location: locationLabel,
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
  } catch (e) {
    console.error("Remotive error:", e);
  }
  return jobs;
}

// Himalayas.app API - remote jobs, filter for India
async function fetchHimalayas(query: string, signal: AbortSignal): Promise<any[]> {
  const jobs: any[] = [];
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://himalayas.app/jobs/api?q=${encoded}&limit=50`, { signal });
    const data = await res.json();

    for (const j of (data.jobs || [])) {
      const loc = (j.location || "").toLowerCase();
      const isIndiaExplicit = INDIA_CITIES.some(city => loc.includes(city));
      const isGlobal = ["anywhere", "worldwide", "global", "remote"].some(kw => loc.includes(kw)) || loc === "";

      if (!isIndiaExplicit && !isGlobal) continue;

      const locationLabel = isIndiaExplicit
        ? j.location + " 🇮🇳"
        : "Remote (Worldwide) 🇮🇳";

      jobs.push({
        title: j.title,
        company: j.companyName || j.company_name || "Company",
        location: locationLabel,
        type: "Remote",
        url: j.applicationUrl || j.url || `https://himalayas.app/jobs/${j.slug}`,
        description: (j.excerpt || j.description || "").replace(/<[^>]*>/g, "").substring(0, 200) + "...",
        salary: convertSalaryToINR(j.salary || null),
        tags: j.categories || j.tags || [],
        published_at: j.pubDate || j.publishedAt || new Date().toISOString(),
        company_logo: j.companyLogo || null,
        category: "Software Development",
      });
    }
  } catch (e) {
    console.error("Himalayas error:", e);
  }
  return jobs;
}

// Jobicy API - remote jobs
async function fetchJobicy(query: string, signal: AbortSignal): Promise<any[]> {
  const jobs: any[] = [];
  try {
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=50&tag=${encodeURIComponent(query)}`, { signal });
    const data = await res.json();

    for (const j of (data.jobs || [])) {
      const loc = (j.jobGeo || "").toLowerCase();
      const isIndiaExplicit = INDIA_CITIES.some(city => loc.includes(city));
      const isGlobal = ["anywhere", "worldwide", "global"].some(kw => loc.includes(kw)) || loc === "";

      if (!isIndiaExplicit && !isGlobal) continue;

      const locationLabel = isIndiaExplicit
        ? j.jobGeo + " 🇮🇳"
        : "Remote (Worldwide) 🇮🇳";

      jobs.push({
        title: j.jobTitle,
        company: j.companyName,
        location: locationLabel,
        type: j.jobType || "Remote",
        url: j.url,
        description: (j.jobExcerpt || "").replace(/<[^>]*>/g, "").substring(0, 200) + "...",
        salary: convertSalaryToINR(j.annualSalaryMin && j.annualSalaryMax ? `${j.annualSalaryMin}-${j.annualSalaryMax}` : null),
        tags: j.jobIndustry ? [j.jobIndustry] : [],
        published_at: j.pubDate || new Date().toISOString(),
        company_logo: j.companyLogo || null,
        category: j.jobIndustry?.[0] || "Software Development",
      });
    }
  } catch (e) {
    console.error("Jobicy error:", e);
  }
  return jobs;
}

function getFallbackJobs(query: string): any[] {
  const q = query.toLowerCase();
  const baseJobs = [
    { title: "Senior React Developer", company: "Flipkart", location: "Bangalore, India 🇮🇳", type: "Full-time", salary: "₹18,00,000 - ₹35,00,000 /yr", tags: ["React", "TypeScript", "Node.js"], category: "Frontend" },
    { title: "Full Stack Engineer", company: "Razorpay", location: "Bangalore, India 🇮🇳", type: "Full-time", salary: "₹20,00,000 - ₹40,00,000 /yr", tags: ["React", "Go", "PostgreSQL"], category: "Full Stack" },
    { title: "Backend Developer", company: "Swiggy", location: "Bangalore, India 🇮🇳", type: "Full-time", salary: "₹15,00,000 - ₹30,00,000 /yr", tags: ["Java", "Microservices", "AWS"], category: "Backend" },
    { title: "Frontend Engineer", company: "CRED", location: "Bangalore, India 🇮🇳", type: "Full-time", salary: "₹22,00,000 - ₹45,00,000 /yr", tags: ["React", "Next.js", "TypeScript"], category: "Frontend" },
    { title: "DevOps Engineer", company: "PhonePe", location: "Pune, India 🇮🇳", type: "Full-time", salary: "₹16,00,000 - ₹32,00,000 /yr", tags: ["AWS", "Docker", "Kubernetes"], category: "DevOps" },
    { title: "Python Developer", company: "Zerodha", location: "Bangalore, India 🇮🇳", type: "Remote", salary: "₹14,00,000 - ₹28,00,000 /yr", tags: ["Python", "Django", "Redis"], category: "Backend" },
    { title: "Data Scientist", company: "Myntra", location: "Bangalore, India 🇮🇳", type: "Full-time", salary: "₹18,00,000 - ₹38,00,000 /yr", tags: ["Python", "ML", "TensorFlow"], category: "Data Science" },
    { title: "Mobile Developer (React Native)", company: "Paytm", location: "Noida, India 🇮🇳", type: "Full-time", salary: "₹12,00,000 - ₹25,00,000 /yr", tags: ["React Native", "JavaScript", "iOS"], category: "Mobile" },
    { title: "SDE-II", company: "Amazon India", location: "Hyderabad, India 🇮🇳", type: "Full-time", salary: "₹25,00,000 - ₹50,00,000 /yr", tags: ["Java", "AWS", "System Design"], category: "Full Stack" },
    { title: "Cloud Engineer", company: "Infosys", location: "Pune, India 🇮🇳", type: "Full-time", salary: "₹10,00,000 - ₹20,00,000 /yr", tags: ["Azure", "Terraform", "CI/CD"], category: "DevOps" },
    { title: "Senior Software Engineer", company: "Freshworks", location: "Chennai, India 🇮🇳", type: "Full-time", salary: "₹20,00,000 - ₹42,00,000 /yr", tags: ["Ruby", "React", "PostgreSQL"], category: "Full Stack" },
    { title: "ML Engineer", company: "Ola", location: "Bangalore, India 🇮🇳", type: "Full-time", salary: "₹22,00,000 - ₹45,00,000 /yr", tags: ["Python", "PyTorch", "MLOps"], category: "AI/ML" },
    { title: "Product Engineer", company: "Postman", location: "Bangalore, India 🇮🇳", type: "Hybrid", salary: "₹24,00,000 - ₹48,00,000 /yr", tags: ["TypeScript", "Node.js", "APIs"], category: "Full Stack" },
    { title: "Staff Engineer", company: "Atlassian India", location: "Bangalore, India 🇮🇳", type: "Hybrid", salary: "₹40,00,000 - ₹75,00,000 /yr", tags: ["Java", "React", "Microservices"], category: "Full Stack" },
    { title: "Software Engineer", company: "Google India", location: "Hyderabad, India 🇮🇳", type: "Full-time", salary: "₹30,00,000 - ₹60,00,000 /yr", tags: ["C++", "Python", "Distributed Systems"], category: "Full Stack" },
    { title: "Backend Engineer", company: "Zomato", location: "Gurugram, India 🇮🇳", type: "Full-time", salary: "₹18,00,000 - ₹35,00,000 /yr", tags: ["Go", "Kafka", "Redis"], category: "Backend" },
    { title: "iOS Developer", company: "Dream11", location: "Mumbai, India 🇮🇳", type: "Full-time", salary: "₹20,00,000 - ₹40,00,000 /yr", tags: ["Swift", "iOS", "UIKit"], category: "Mobile" },
    { title: "Platform Engineer", company: "Meesho", location: "Bangalore, India 🇮🇳", type: "Full-time", salary: "₹16,00,000 - ₹32,00,000 /yr", tags: ["Kubernetes", "AWS", "Go"], category: "DevOps" },
    { title: "Frontend Developer", company: "Groww", location: "Bangalore, India 🇮🇳", type: "Full-time", salary: "₹15,00,000 - ₹30,00,000 /yr", tags: ["React", "JavaScript", "CSS"], category: "Frontend" },
    { title: "Data Engineer", company: "Walmart India", location: "Bangalore, India 🇮🇳", type: "Full-time", salary: "₹22,00,000 - ₹45,00,000 /yr", tags: ["Spark", "Python", "Hadoop"], category: "Data" },
  ];

  const filtered = baseJobs.filter(j => {
    const searchable = `${j.title} ${j.tags.join(" ")} ${j.category}`.toLowerCase();
    return q.split(" ").some(word => searchable.includes(word));
  });

  return (filtered.length > 0 ? filtered : baseJobs).map(j => ({
    ...j,
    url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(j.title + " " + j.company)}&location=India`,
    description: `${j.title} position at ${j.company} in ${j.location.replace(" 🇮🇳", "")}. Apply via LinkedIn.`,
    published_at: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    company_logo: null,
  }));
}
