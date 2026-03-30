import { StickyNote, Code2, Briefcase, Brain, Clock, Zap, ArrowRight, Sparkles, Activity, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CyberCard } from "@/components/CyberCard";
import { GlitchText } from "@/components/GlitchText";
import { useAuth } from "@/contexts/AuthContext";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ScrollReveal } from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts", user?.id],
    queryFn: async () => {
      if (!user) return { notes: 0, snippets: 0, projects: 0, quizzes: 0 };
      const [n, s, p, q] = await Promise.all([
        supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("snippets").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("portfolio_projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quiz_results").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      return {
        notes: n.count ?? 0,
        snippets: s.count ?? 0,
        projects: p.count ?? 0,
        quizzes: q.count ?? 0,
      };
    },
    enabled: !!user,
  });

  const stats = [
    { label: "Notes", value: String(counts?.notes ?? 0), icon: StickyNote, color: "primary" as const },
    { label: "Snippets", value: String(counts?.snippets ?? 0), icon: Code2, color: "cyan" as const },
    { label: "Projects", value: String(counts?.projects ?? 0), icon: Briefcase, color: "accent" as const },
    { label: "Quizzes", value: String(counts?.quizzes ?? 0), icon: Brain, color: "amber" as const },
  ];

  const colorClasses = {
    primary: "text-primary",
    cyan: "text-cyan",
    accent: "text-accent",
    amber: "text-amber",
    rose: "text-rose",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 relative">
      {/* Hero */}
      <ScrollReveal>
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <StatusIndicator status="online" label="online" />
            <span className="text-xs font-mono text-muted-foreground/40">|</span>
            <span className="text-xs font-mono text-muted-foreground/60">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </div>
          <GlitchText className="text-4xl md:text-5xl font-bold tracking-tight font-display" as="h1">
            {`${greeting}, ${profile?.display_name || user?.email?.split("@")[0] || "Developer"}`}
          </GlitchText>
          <p className="text-lg text-muted-foreground">
            Welcome back to <span className="text-gradient-primary font-semibold">SIRA</span>
            <span className="inline-block w-[2px] h-5 bg-primary ml-1 align-middle" style={{ animation: "typing-cursor 1s step-end infinite" }} />
          </p>
        </div>
      </ScrollReveal>

      {/* Live stats strip */}
      <ScrollReveal delay={100}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="group relative rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm p-4 flex items-center gap-3 card-hover overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-current opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 ${colorClasses[stat.color]}`} />
              <div className="rounded-lg bg-secondary/50 p-2.5 relative">
                <stat.icon className={`h-4 w-4 ${colorClasses[stat.color]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Feature cards */}
      <ScrollReveal delay={200}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-muted-foreground">Command Center</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CyberCard glowColor="primary" onClick={() => navigate("/notes")}>
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Notes & Knowledge</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Capture ideas, tag them, find them instantly.</p>
            <div className="flex items-center gap-1 text-xs text-primary font-mono group/arrow">
              <span>OPEN</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover/arrow:translate-x-1" />
            </div>
          </CyberCard>

          <CyberCard glowColor="cyan" onClick={() => navigate("/snippets")}>
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-4 w-4 text-cyan" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Code Snippets</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Your reusable code library. Angular, .NET, SQL & more.</p>
            <div className="flex items-center gap-1 text-xs text-cyan font-mono">
              <span>OPEN</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CyberCard>

          <CyberCard glowColor="accent" onClick={() => navigate("/portfolio")}>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Portfolio & Resume</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Manage your career profile and generate resumes.</p>
            <div className="flex items-center gap-1 text-xs text-accent font-mono">
              <span>OPEN</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CyberCard>

          <CyberCard glowColor="amber" onClick={() => navigate("/quiz")}>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-amber" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Quiz & Prep</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">MCQs, flashcards, and timed practice sessions.</p>
            <div className="flex items-center gap-1 text-xs text-amber font-mono">
              <span>OPEN</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CyberCard>

          <CyberCard glowColor="rose" onClick={() => navigate("/facts")}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-rose" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Tech Facts</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Discover fascinating tech & science facts daily.</p>
            <div className="flex items-center gap-1 text-xs text-rose font-mono group/arrow">
              <span>EXPLORE</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover/arrow:translate-x-1" />
            </div>
          </CyberCard>

          <CyberCard glowColor="primary">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Today's Focus</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <span className="text-lg text-primary font-mono font-bold">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </CyberCard>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Dashboard;
