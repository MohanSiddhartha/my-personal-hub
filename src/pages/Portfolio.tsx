import { useState } from "react";
import { Edit3, Save, X, Plus, Trash2, Briefcase, GraduationCap, Award, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  link?: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

const PortfolioPage = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [skills] = useState([
    "Angular", "TypeScript", ".NET", "C#", "SQL Server", "PostgreSQL",
    "HTML/CSS", "JavaScript", "REST APIs", "Git", "Azure", "Docker",
  ]);

  const [experience, setExperience] = useState<Experience[]>([
    {
      id: "1",
      title: "Full Stack Developer",
      company: "Tech Corp",
      period: "2022 – Present",
      description: "Building enterprise web applications with Angular and .NET. Leading frontend architecture decisions.",
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "DevVault",
      description: "Personal productivity platform for developers",
      techStack: ["React", "TypeScript", "Supabase"],
    },
  ]);

  const [education] = useState<Education[]>([
    { id: "1", degree: "B.Tech in Computer Science", institution: "University", year: "2022" },
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Portfolio & Resume</h1>
            <p className="text-sm text-muted-foreground">Your career profile</p>
          </div>
          <Button variant={isEditing ? "glow" : "outline"} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <><Save className="h-4 w-4" /> Done</> : <><Edit3 className="h-4 w-4" /> Edit</>}
          </Button>
        </div>
      </ScrollReveal>

      <Tabs defaultValue="experience">
        <ScrollReveal delay={80}>
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
        </ScrollReveal>

        <TabsContent value="experience" className="space-y-4 mt-4">
          {experience.map((exp, i) => (
            <ScrollReveal key={exp.id} delay={i * 60}>
              <div className="rounded-lg border border-border/50 bg-card p-5 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company} · {exp.period}</p>
                  </div>
                  <Briefcase className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm text-secondary-foreground leading-relaxed">{exp.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 mt-4">
          {projects.map((proj, i) => (
            <ScrollReveal key={proj.id} delay={i * 60}>
              <div className="rounded-lg border border-border/50 bg-card p-5 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{proj.name}</h3>
                  <Code2 className="h-4 w-4 text-cyan" />
                </div>
                <p className="text-sm text-secondary-foreground">{proj.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {proj.techStack.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </TabsContent>

        <TabsContent value="education" className="space-y-4 mt-4">
          {education.map((edu, i) => (
            <ScrollReveal key={edu.id} delay={i * 60}>
              <div className="rounded-lg border border-border/50 bg-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.institution} · {edu.year}</p>
                  </div>
                  <GraduationCap className="h-4 w-4 text-amber" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <ScrollReveal>
            <div className="rounded-lg border border-border/50 bg-card p-5">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="py-1.5 px-3">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioPage;
