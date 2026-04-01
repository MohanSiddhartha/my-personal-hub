import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain, RefreshCw, ChevronDown, ChevronUp, Lightbulb, CheckCircle2,
  MessageSquare, Code2, Users, Server, Loader2,
} from "lucide-react";
import { GlitchText } from "@/components/GlitchText";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Question {
  question: string;
  type: string;
  hint: string;
  ideal_answer: string;
  difficulty: string;
  follow_up: string;
}

const topics = [
  "React", "Node.js", "TypeScript", "Python", "System Design",
  "SQL", "JavaScript", "Data Structures", ".NET", "AWS",
];

const difficulties = ["beginner", "intermediate", "advanced"];

const typeIcons: Record<string, any> = {
  conceptual: Lightbulb,
  coding: Code2,
  behavioral: Users,
  "system-design": Server,
};

const typeColors: Record<string, string> = {
  conceptual: "bg-primary/10 text-primary border-primary/20",
  coding: "bg-cyan/10 text-cyan border-cyan/20",
  behavioral: "bg-amber/10 text-amber border-amber/20",
  "system-design": "bg-rose/10 text-rose border-rose/20",
};

export default function InterviewPrep() {
  const [topic, setTopic] = useState("React");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<Set<number>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: questions, isLoading, isFetching } = useQuery({
    queryKey: ["interview", topic, difficulty, refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-interviews", {
        body: { topic, difficulty, count: 8 },
      });
      if (error) throw error;
      return (data?.questions || []) as Question[];
    },
  });

  const toggleHint = (i: number) => {
    setShowHint((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const loading = isLoading || isFetching;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <GlitchText className="text-2xl font-bold font-display" as="h1">
              Interview Prep
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
            New Questions
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated interview questions — practice like a real interview.
        </p>
      </ScrollReveal>

      {/* Filters */}
      <ScrollReveal delay={50}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => { setTopic(t); setRefreshKey((k) => k + 1); setExpandedIdx(null); setShowHint(new Set()); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  topic === t
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-card/40 text-muted-foreground border-border/20 hover:border-border/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => { setDifficulty(d); setRefreshKey((k) => k + 1); setExpandedIdx(null); setShowHint(new Set()); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all border ${
                  difficulty === d
                    ? "bg-accent/10 text-accent border-accent/30"
                    : "bg-card/40 text-muted-foreground border-border/20 hover:border-border/40"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Questions */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-mono">Generating {topic} questions...</span>
        </div>
      ) : (
        <ScrollReveal delay={100}>
          <div className="space-y-3">
            {questions?.map((q, i) => {
              const Icon = typeIcons[q.type] || MessageSquare;
              const isExpanded = expandedIdx === i;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-border/40"
                >
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : i)}
                    className="w-full text-left p-4 flex items-start gap-3"
                  >
                    <div className="rounded-lg bg-primary/10 p-2 mt-0.5 shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] font-mono ${typeColors[q.type] || ""}`}>
                          {q.type}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground/60 capitalize">{q.difficulty}</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                    </div>
                    <div className="shrink-0 mt-1">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border/10 pt-3 ml-12">
                      {/* Hint */}
                      <div>
                        <button
                          onClick={() => toggleHint(i)}
                          className="text-xs font-mono text-primary flex items-center gap-1.5 hover:underline"
                        >
                          <Lightbulb className="h-3 w-3" />
                          {showHint.has(i) ? "Hide Hint" : "Show Hint"}
                        </button>
                        {showHint.has(i) && (
                          <p className="text-xs text-muted-foreground mt-1.5 pl-4 border-l-2 border-primary/20">
                            {q.hint}
                          </p>
                        )}
                      </div>

                      {/* Ideal answer */}
                      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-xs font-mono text-emerald-400">Model Answer</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{q.ideal_answer}</p>
                      </div>

                      {/* Follow-up */}
                      <div className="rounded-lg bg-muted/30 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Follow-up</span>
                        </div>
                        <p className="text-xs text-foreground/70">{q.follow_up}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
