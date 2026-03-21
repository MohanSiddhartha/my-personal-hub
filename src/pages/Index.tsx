import { StickyNote, Code2, Briefcase, Brain, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "@/components/DashboardCard";
import { ScrollReveal } from "@/components/ScrollReveal";

const Dashboard = () => {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <ScrollReveal>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, <span className="text-gradient-primary">Developer</span>
          </h1>
          <p className="text-muted-foreground">
            Your personal command center. Build, learn, grow.
          </p>
        </div>
      </ScrollReveal>

      {/* Stats row */}
      <ScrollReveal delay={100}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Notes", value: "—", icon: StickyNote, color: "primary" as const },
            { label: "Snippets", value: "—", icon: Code2, color: "cyan" as const },
            { label: "Projects", value: "—", icon: Briefcase, color: "accent" as const },
            { label: "Quizzes", value: "—", icon: Brain, color: "amber" as const },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/50 bg-card p-4 flex items-center gap-3"
            >
              <div className="rounded-md bg-secondary p-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Feature cards */}
      <ScrollReveal delay={200}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            title="Notes & Knowledge"
            icon={<StickyNote className="h-4 w-4" />}
            accentColor="primary"
            onClick={() => navigate("/notes")}
          >
            <p className="text-sm text-muted-foreground mb-3">
              Capture ideas, tag them, find them instantly.
            </p>
            <span className="text-xs text-primary font-medium">Open →</span>
          </DashboardCard>

          <DashboardCard
            title="Code Snippets"
            icon={<Code2 className="h-4 w-4" />}
            accentColor="cyan"
            onClick={() => navigate("/snippets")}
          >
            <p className="text-sm text-muted-foreground mb-3">
              Your reusable code library. Angular, .NET, SQL & more.
            </p>
            <span className="text-xs text-cyan font-medium">Open →</span>
          </DashboardCard>

          <DashboardCard
            title="Portfolio & Resume"
            icon={<Briefcase className="h-4 w-4" />}
            accentColor="accent"
            onClick={() => navigate("/portfolio")}
          >
            <p className="text-sm text-muted-foreground mb-3">
              Manage your career profile and generate resumes.
            </p>
            <span className="text-xs text-accent font-medium">Open →</span>
          </DashboardCard>

          <DashboardCard
            title="Quiz & Interview Prep"
            icon={<Brain className="h-4 w-4" />}
            accentColor="amber"
            onClick={() => navigate("/quiz")}
          >
            <p className="text-sm text-muted-foreground mb-3">
              MCQs, flashcards, and timed practice sessions.
            </p>
            <span className="text-xs text-amber font-medium">Open →</span>
          </DashboardCard>

          <DashboardCard
            title="Quick Actions"
            icon={<Zap className="h-4 w-4" />}
            accentColor="rose"
          >
            <p className="text-sm text-muted-foreground mb-3">
              More features coming soon: feeds, AI helper, locker.
            </p>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </DashboardCard>

          <DashboardCard
            title="Today's Focus"
            icon={<Clock className="h-4 w-4" />}
            accentColor="primary"
          >
            <p className="text-sm text-muted-foreground mb-3">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <span className="text-xs text-primary font-mono">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </DashboardCard>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Dashboard;
