import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, RefreshCw, Sparkles, Clock, Beaker, Cpu, BookOpen } from "lucide-react";
import { GlitchText } from "@/components/GlitchText";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Fact {
  fact: string;
  category: string;
  source: string;
  year: string | null;
}

const categories = [
  { id: "tech", label: "Tech", icon: Cpu },
  { id: "science", label: "Science", icon: Beaker },
  { id: "history", label: "History", icon: BookOpen },
  { id: "random", label: "Random", icon: Sparkles },
];

const categoryColors: Record<string, string> = {
  Tech: "bg-primary/10 text-primary border-primary/20",
  Science: "bg-cyan/10 text-cyan border-cyan/20",
  History: "bg-amber/10 text-amber border-amber/20",
  Fun: "bg-rose/10 text-rose border-rose/20",
};

export default function Facts() {
  const [activeCategory, setActiveCategory] = useState("tech");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: facts, isLoading, isFetching } = useQuery({
    queryKey: ["facts", activeCategory, refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-facts", {
        body: { category: activeCategory },
      });
      if (error) throw error;
      return (data?.facts || []) as Fact[];
    },
  });

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <GlitchText className="text-3xl font-bold font-display tracking-tight" as="h1">
              Tech Facts
            </GlitchText>
            <p className="text-muted-foreground mt-1">Fascinating facts fetched fresh for you</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            className="gap-2 border-border/30 hover:border-primary/50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            New Facts
          </Button>
        </div>
      </ScrollReveal>

      {/* Category tabs */}
      <ScrollReveal delay={100}>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setRefreshKey((k) => k + 1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-mono transition-all duration-300 border ${
                activeCategory === cat.id
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card/40 text-muted-foreground border-border/20 hover:border-border/40"
              }`}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Facts grid */}
      {isLoading || isFetching ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/20 bg-card/40 p-5 animate-pulse">
              <div className="h-4 bg-secondary/50 rounded w-16 mb-3" />
              <div className="h-4 bg-secondary/30 rounded w-full mb-2" />
              <div className="h-4 bg-secondary/30 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <ScrollReveal delay={150}>
          <div className="grid md:grid-cols-2 gap-4">
            {facts?.map((fact, i) => (
              <div
                key={i}
                className="group relative rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm p-5 transition-all duration-300 hover:border-border/40 hover:shadow-lg hover:shadow-black/10 overflow-hidden"
              >
                {/* Glow */}
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-all duration-500" />

                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] font-mono ${categoryColors[fact.category] || categoryColors.Fun}`}>
                        {fact.category}
                      </Badge>
                      {fact.year && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-mono">
                          <Clock className="h-2.5 w-2.5" />
                          {fact.year}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{fact.fact}</p>
                    <p className="text-[10px] text-muted-foreground/50 font-mono mt-2">
                      Source: {fact.source}
                    </p>
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
