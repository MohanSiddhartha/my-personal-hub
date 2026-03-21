import { useState, useEffect } from "react";
import { Edit3, Save, Plus, Trash2, Briefcase, GraduationCap, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CyberCard } from "@/components/CyberCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PortfolioPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New item forms
  const [newExp, setNewExp] = useState({ title: "", company: "", period: "", description: "" });
  const [newProj, setNewProj] = useState({ name: "", description: "", tech_stack: "", link: "" });
  const [newEdu, setNewEdu] = useState({ degree: "", institution: "", year: "" });
  const [newSkill, setNewSkill] = useState("");

  const fetchAll = async () => {
    if (!user) return;
    const [expRes, projRes, eduRes, skillRes] = await Promise.all([
      supabase.from("experiences").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("portfolio_projects").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("education").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("skills").select("*").eq("user_id", user.id).order("name"),
    ]);
    setExperiences(expRes.data || []);
    setProjects(projRes.data || []);
    setEducation(eduRes.data || []);
    setSkills(skillRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const addExperience = async () => {
    if (!newExp.title || !user) return;
    await supabase.from("experiences").insert({ user_id: user.id, ...newExp });
    setNewExp({ title: "", company: "", period: "", description: "" });
    fetchAll();
    toast({ title: "Experience added" });
  };

  const addProject = async () => {
    if (!newProj.name || !user) return;
    const tech = newProj.tech_stack.split(",").map((t) => t.trim()).filter(Boolean);
    await supabase.from("portfolio_projects").insert({ user_id: user.id, name: newProj.name, description: newProj.description, tech_stack: tech, link: newProj.link || null });
    setNewProj({ name: "", description: "", tech_stack: "", link: "" });
    fetchAll();
    toast({ title: "Project added" });
  };

  const addEducation = async () => {
    if (!newEdu.degree || !user) return;
    await supabase.from("education").insert({ user_id: user.id, ...newEdu });
    setNewEdu({ degree: "", institution: "", year: "" });
    fetchAll();
    toast({ title: "Education added" });
  };

  const addSkill = async () => {
    if (!newSkill || !user) return;
    await supabase.from("skills").insert({ user_id: user.id, name: newSkill });
    setNewSkill("");
    fetchAll();
    toast({ title: "Skill added" });
  };

  const deleteItem = async (table: "experiences" | "portfolio_projects" | "education" | "skills", id: string) => {
    await supabase.from(table).delete().eq("id", id);
    fetchAll();
    toast({ title: "Deleted" });
  };

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
          <TabsList className="bg-card/60 border border-border/30 backdrop-blur-sm">
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
        </ScrollReveal>

        <TabsContent value="experience" className="space-y-4 mt-4">
          {isEditing && (
            <CyberCard glowColor="accent">
              <div className="space-y-3">
                <Input placeholder="Job title" value={newExp.title} onChange={(e) => setNewExp((p) => ({ ...p, title: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <div className="flex gap-3">
                  <Input placeholder="Company" value={newExp.company} onChange={(e) => setNewExp((p) => ({ ...p, company: e.target.value }))} className="bg-secondary/50 border-border/30" />
                  <Input placeholder="Period" value={newExp.period} onChange={(e) => setNewExp((p) => ({ ...p, period: e.target.value }))} className="bg-secondary/50 border-border/30" />
                </div>
                <Textarea placeholder="Description" value={newExp.description} onChange={(e) => setNewExp((p) => ({ ...p, description: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <Button variant="glow" size="sm" onClick={addExperience}><Plus className="h-4 w-4" /> Add</Button>
              </div>
            </CyberCard>
          )}
          {experiences.map((exp, i) => (
            <ScrollReveal key={exp.id} delay={i * 60}>
              <CyberCard glowColor="accent">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company} · {exp.period}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-accent" />
                    {isEditing && (
                      <button onClick={() => deleteItem("experiences", exp.id)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-secondary-foreground leading-relaxed mt-2">{exp.description}</p>
              </CyberCard>
            </ScrollReveal>
          ))}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 mt-4">
          {isEditing && (
            <CyberCard glowColor="cyan">
              <div className="space-y-3">
                <Input placeholder="Project name" value={newProj.name} onChange={(e) => setNewProj((p) => ({ ...p, name: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <Textarea placeholder="Description" value={newProj.description} onChange={(e) => setNewProj((p) => ({ ...p, description: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <div className="flex gap-3">
                  <Input placeholder="Tech stack (comma separated)" value={newProj.tech_stack} onChange={(e) => setNewProj((p) => ({ ...p, tech_stack: e.target.value }))} className="bg-secondary/50 border-border/30 flex-1" />
                  <Input placeholder="Link (optional)" value={newProj.link} onChange={(e) => setNewProj((p) => ({ ...p, link: e.target.value }))} className="bg-secondary/50 border-border/30" />
                </div>
                <Button variant="glow" size="sm" onClick={addProject}><Plus className="h-4 w-4" /> Add</Button>
              </div>
            </CyberCard>
          )}
          {projects.map((proj, i) => (
            <ScrollReveal key={proj.id} delay={i * 60}>
              <CyberCard glowColor="cyan">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{proj.name}</h3>
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-cyan" />
                    {isEditing && (
                      <button onClick={() => deleteItem("portfolio_projects", proj.id)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-secondary-foreground mt-1">{proj.description}</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {(proj.tech_stack || []).map((t: string) => (
                    <Badge key={t} variant="secondary" className="font-mono text-xs">{t}</Badge>
                  ))}
                </div>
              </CyberCard>
            </ScrollReveal>
          ))}
        </TabsContent>

        <TabsContent value="education" className="space-y-4 mt-4">
          {isEditing && (
            <CyberCard glowColor="amber">
              <div className="space-y-3">
                <Input placeholder="Degree" value={newEdu.degree} onChange={(e) => setNewEdu((p) => ({ ...p, degree: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <div className="flex gap-3">
                  <Input placeholder="Institution" value={newEdu.institution} onChange={(e) => setNewEdu((p) => ({ ...p, institution: e.target.value }))} className="bg-secondary/50 border-border/30" />
                  <Input placeholder="Year" value={newEdu.year} onChange={(e) => setNewEdu((p) => ({ ...p, year: e.target.value }))} className="bg-secondary/50 border-border/30 w-32" />
                </div>
                <Button variant="glow" size="sm" onClick={addEducation}><Plus className="h-4 w-4" /> Add</Button>
              </div>
            </CyberCard>
          )}
          {education.map((edu, i) => (
            <ScrollReveal key={edu.id} delay={i * 60}>
              <CyberCard glowColor="amber">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.institution} · {edu.year}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-amber" />
                    {isEditing && (
                      <button onClick={() => deleteItem("education", edu.id)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </CyberCard>
            </ScrollReveal>
          ))}
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <ScrollReveal>
            <CyberCard glowColor="primary">
              {isEditing && (
                <div className="flex gap-2 mb-4">
                  <Input placeholder="Add a skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="bg-secondary/50 border-border/30" onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                  <Button variant="glow" size="sm" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill.id} variant="outline" className="py-1.5 px-3 group">
                    {skill.name}
                    {isEditing && (
                      <button onClick={() => deleteItem("skills", skill.id)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    )}
                  </Badge>
                ))}
                {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet. Click Edit to add some.</p>}
              </div>
            </CyberCard>
          </ScrollReveal>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioPage;