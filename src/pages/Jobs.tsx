import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Briefcase, RefreshCw, ExternalLink, MapPin, Clock, Tag,
  Building2, Loader2, Search,
} from "lucide-react";
import { GlitchText } from "@/components/GlitchText";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Job {
  title: string;
  company: string;
  location: string;
  type: string;
  url: string;
  description: string;
  salary: string | null;
  tags: string[];
  published_at: string;
  company_logo: string | null;
  category: string;
}

const searchPresets = [
  "React Developer", "Full Stack", "Backend Engineer", "Frontend",
  "Python Developer", "DevOps", "Data Scientist", "Mobile Developer",
];

export default function Jobs() {
  const [query, setQuery] = useState("software developer India");
  const [customQuery, setCustomQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: jobs, isLoading, isFetching } = useQuery({
    queryKey: ["jobs", query, refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-jobs", {
        body: { query },
      });
      if (error) throw error;
      return (data?.jobs || []) as Job[];
    },
  });

  const loading = isLoading || isFetching;

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuery.trim()) {
      setQuery(customQuery.trim());
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-accent" />
            <GlitchText className="text-2xl font-bold font-display" as="h1">
              Job Board
            </GlitchText>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Remote tech jobs from around the world, updated live.
        </p>
      </ScrollReveal>

      {/* Search */}
      <ScrollReveal delay={50}>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Search jobs... e.g. React, Python, DevOps"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border/30 bg-card/40 text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>Search</Button>
        </form>

        <div className="flex flex-wrap gap-2 mt-3">
          {searchPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => { setQuery(preset); setCustomQuery(preset); setRefreshKey((k) => k + 1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                query === preset
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "bg-card/40 text-muted-foreground border-border/20 hover:border-border/40"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Jobs list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-mono">Searching jobs...</span>
        </div>
      ) : jobs && jobs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No jobs found. Try a different search.</p>
        </div>
      ) : (
        <ScrollReveal delay={100}>
          <div className="space-y-3">
            {jobs?.map((job, i) => (
              <div
                key={i}
                className="group rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm p-4 transition-all duration-300 hover:border-border/40 hover:shadow-lg hover:shadow-black/10"
              >
                <div className="flex items-start gap-4">
                  {/* Company logo */}
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-muted/30 border border-border/20 flex items-center justify-center overflow-hidden">
                    {job.company_logo ? (
                      <img src={job.company_logo} alt={job.company} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold leading-tight mb-1">{job.title}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{job.company}</p>
                      </div>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          Apply <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(job.published_at)}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">{job.type}</Badge>
                      {job.salary && (
                        <span className="text-[10px] font-mono text-emerald-400">{job.salary}</span>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    )}

                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.tags.slice(0, 5).map((tag) => (
                          <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground flex items-center gap-0.5">
                            <Tag className="h-2 w-2" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
