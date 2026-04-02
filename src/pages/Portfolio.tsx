import { useState, useRef } from "react";
import { 
  FileText, Download, Eye, Edit3, Plus, Trash2, GripVertical,
  Briefcase, GraduationCap, Code2, Mail, Phone, MapPin, Globe, Linkedin, Github
} from "lucide-react";
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
import { useEffect } from "react";

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  experiences: any[];
  education: any[];
  skills: any[];
  projects: any[];
}

const PortfolioPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("edit");
  const resumeRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Resume header info
  const [profile, setProfile] = useState({
    fullName: "", email: "", phone: "", location: "",
    linkedin: "", github: "", website: "", summary: "",
  });

  // Portfolio data
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);

  // New item forms
  const [newExp, setNewExp] = useState({ title: "", company: "", period: "", description: "" });
  const [newProj, setNewProj] = useState({ name: "", description: "", tech_stack: "", link: "" });
  const [newEdu, setNewEdu] = useState({ degree: "", institution: "", year: "" });
  const [newSkill, setNewSkill] = useState("");

  const fetchAll = async () => {
    if (!user) return;
    const [expRes, projRes, eduRes, skillRes, profileRes] = await Promise.all([
      supabase.from("experiences").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("portfolio_projects").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("education").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("skills").select("*").eq("user_id", user.id).order("name"),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);
    setExperiences(expRes.data || []);
    setProjects(projRes.data || []);
    setEducation(eduRes.data || []);
    setSkills(skillRes.data || []);
    if (profileRes.data) {
      setProfile(p => ({
        ...p,
        fullName: profileRes.data.display_name || user.email?.split("@")[0] || "",
        email: user.email || "",
        summary: profileRes.data.bio || "",
      }));
    }
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

  const handleDownloadPDF = () => {
    if (!resumeRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Please allow popups to download your resume", variant: "destructive" });
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${profile.fullName || "Resume"} - Resume</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; line-height: 1.5; padding: 40px 50px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; color: #111; }
          h2 { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #333; border-bottom: 2px solid #333; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
          h3 { font-size: 14px; font-weight: 600; color: #222; }
          p, li, span { font-size: 12px; color: #444; }
          .header-contact { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; font-size: 11px; color: #555; }
          .header-contact span { display: flex; align-items: center; gap: 3px; }
          .summary { margin-top: 8px; font-size: 12px; color: #444; line-height: 1.6; }
          .exp-item { margin-bottom: 14px; }
          .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
          .exp-company { font-size: 12px; color: #555; font-style: italic; }
          .exp-period { font-size: 11px; color: #666; }
          .exp-desc { font-size: 12px; color: #444; margin-top: 4px; line-height: 1.5; }
          .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
          .skill-tag { font-size: 11px; padding: 2px 10px; border: 1px solid #ccc; border-radius: 3px; color: #333; }
          .proj-tech { font-size: 10px; color: #666; margin-top: 2px; }
          .edu-item { margin-bottom: 10px; }
          ul { padding-left: 16px; }
          li { margin-bottom: 2px; }
          @media print { body { padding: 20px 30px; } }
        </style>
      </head>
      <body>
        ${resumeRef.current.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  // ATS Resume Preview
  const ResumePreview = () => (
    <div ref={resumeRef} className="bg-white text-black p-8 rounded-lg max-w-[800px] mx-auto" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-wide">{profile.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap justify-center gap-3 mt-1.5 text-xs text-gray-600">
          {profile.email && <span>✉ {profile.email}</span>}
          {profile.phone && <span>☎ {profile.phone}</span>}
          {profile.location && <span>📍 {profile.location}</span>}
          {profile.linkedin && <span>🔗 {profile.linkedin}</span>}
          {profile.github && <span>💻 {profile.github}</span>}
          {profile.website && <span>🌐 {profile.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[1.5px] text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Professional Summary</h2>
          <p className="text-xs text-gray-700 leading-relaxed">{profile.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[1.5px] text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Experience</h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold text-gray-900">{exp.title}</h3>
                <span className="text-[11px] text-gray-500">{exp.period}</span>
              </div>
              <p className="text-xs text-gray-600 italic">{exp.company}</p>
              {exp.description && <p className="text-xs text-gray-700 mt-1 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[1.5px] text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{proj.name}</h3>
              {proj.description && <p className="text-xs text-gray-700 mt-0.5">{proj.description}</p>}
              {proj.tech_stack?.length > 0 && (
                <p className="text-[10px] text-gray-500 mt-0.5">Tech: {proj.tech_stack.join(", ")}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[1.5px] text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold text-gray-900">{edu.degree}</h3>
                <span className="text-[11px] text-gray-500">{edu.year}</span>
              </div>
              <p className="text-xs text-gray-600 italic">{edu.institution}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[1.5px] text-gray-800 border-b-2 border-gray-800 pb-1 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span key={s.id} className="text-[11px] px-2.5 py-0.5 border border-gray-300 rounded text-gray-700">{s.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-accent" />
              ATS Resume Builder
            </h1>
            <p className="text-sm text-muted-foreground">Build an ATS-friendly resume. Edit → Preview → Download PDF</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("preview")} className="gap-1.5">
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button variant="glow" size="sm" onClick={handleDownloadPDF} className="gap-1.5">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>
      </ScrollReveal>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollReveal delay={80}>
          <TabsList className="bg-card/60 border border-border/30 backdrop-blur-sm">
            <TabsTrigger value="edit"><Edit3 className="h-3.5 w-3.5 mr-1" />Edit</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="h-3.5 w-3.5 mr-1" />Preview</TabsTrigger>
          </TabsList>
        </ScrollReveal>

        {/* ===== EDIT TAB ===== */}
        <TabsContent value="edit" className="space-y-5 mt-4">
          {/* Personal Info */}
          <ScrollReveal>
            <CyberCard glowColor="primary">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Full Name" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <Input placeholder="Email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <Input placeholder="Phone" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <Input placeholder="Location (e.g. Bangalore, India)" value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <Input placeholder="LinkedIn URL" value={profile.linkedin} onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <Input placeholder="GitHub URL" value={profile.github} onChange={e => setProfile(p => ({ ...p, github: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <Input placeholder="Website (optional)" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} className="bg-secondary/50 border-border/30 sm:col-span-2" />
              </div>
              <Textarea placeholder="Professional Summary - Write 2-3 sentences about your expertise..." value={profile.summary} onChange={e => setProfile(p => ({ ...p, summary: e.target.value }))} className="bg-secondary/50 border-border/30 mt-3" rows={3} />
            </CyberCard>
          </ScrollReveal>

          {/* Experience */}
          <ScrollReveal delay={60}>
            <CyberCard glowColor="accent">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4 text-accent" /> Work Experience</h2>
              <div className="space-y-3 mb-3">
                <Input placeholder="Job Title (e.g. Senior Software Engineer)" value={newExp.title} onChange={e => setNewExp(p => ({ ...p, title: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <div className="flex gap-3">
                  <Input placeholder="Company" value={newExp.company} onChange={e => setNewExp(p => ({ ...p, company: e.target.value }))} className="bg-secondary/50 border-border/30" />
                  <Input placeholder="Period (e.g. Jan 2022 - Present)" value={newExp.period} onChange={e => setNewExp(p => ({ ...p, period: e.target.value }))} className="bg-secondary/50 border-border/30" />
                </div>
                <Textarea placeholder="Key responsibilities & achievements (use bullet points for ATS)" value={newExp.description} onChange={e => setNewExp(p => ({ ...p, description: e.target.value }))} className="bg-secondary/50 border-border/30" rows={3} />
                <Button variant="glow" size="sm" onClick={addExperience}><Plus className="h-4 w-4" /> Add Experience</Button>
              </div>
              {experiences.map((exp) => (
                <div key={exp.id} className="flex items-start justify-between py-2 border-t border-border/20">
                  <div>
                    <p className="text-sm font-medium">{exp.title}</p>
                    <p className="text-xs text-muted-foreground">{exp.company} · {exp.period}</p>
                    {exp.description && <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{exp.description}</p>}
                  </div>
                  <button onClick={() => deleteItem("experiences", exp.id)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {experiences.length === 0 && <p className="text-xs text-muted-foreground mt-2">No experience added yet.</p>}
            </CyberCard>
          </ScrollReveal>

          {/* Projects */}
          <ScrollReveal delay={120}>
            <CyberCard glowColor="cyan">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Code2 className="h-4 w-4 text-cyan" /> Projects</h2>
              <div className="space-y-3 mb-3">
                <Input placeholder="Project Name" value={newProj.name} onChange={e => setNewProj(p => ({ ...p, name: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <Textarea placeholder="Description - what you built, impact, etc." value={newProj.description} onChange={e => setNewProj(p => ({ ...p, description: e.target.value }))} className="bg-secondary/50 border-border/30" rows={2} />
                <div className="flex gap-3">
                  <Input placeholder="Tech stack (comma separated)" value={newProj.tech_stack} onChange={e => setNewProj(p => ({ ...p, tech_stack: e.target.value }))} className="bg-secondary/50 border-border/30 flex-1" />
                  <Input placeholder="Link (optional)" value={newProj.link} onChange={e => setNewProj(p => ({ ...p, link: e.target.value }))} className="bg-secondary/50 border-border/30" />
                </div>
                <Button variant="glow" size="sm" onClick={addProject}><Plus className="h-4 w-4" /> Add Project</Button>
              </div>
              {projects.map((proj) => (
                <div key={proj.id} className="flex items-start justify-between py-2 border-t border-border/20">
                  <div>
                    <p className="text-sm font-medium">{proj.name}</p>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      {(proj.tech_stack || []).map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-[10px] font-mono">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteItem("portfolio_projects", proj.id)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {projects.length === 0 && <p className="text-xs text-muted-foreground mt-2">No projects added yet.</p>}
            </CyberCard>
          </ScrollReveal>

          {/* Education */}
          <ScrollReveal delay={180}>
            <CyberCard glowColor="amber">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-amber" /> Education</h2>
              <div className="space-y-3 mb-3">
                <Input placeholder="Degree (e.g. B.Tech in Computer Science)" value={newEdu.degree} onChange={e => setNewEdu(p => ({ ...p, degree: e.target.value }))} className="bg-secondary/50 border-border/30" />
                <div className="flex gap-3">
                  <Input placeholder="Institution" value={newEdu.institution} onChange={e => setNewEdu(p => ({ ...p, institution: e.target.value }))} className="bg-secondary/50 border-border/30" />
                  <Input placeholder="Year" value={newEdu.year} onChange={e => setNewEdu(p => ({ ...p, year: e.target.value }))} className="bg-secondary/50 border-border/30 w-32" />
                </div>
                <Button variant="glow" size="sm" onClick={addEducation}><Plus className="h-4 w-4" /> Add Education</Button>
              </div>
              {education.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between py-2 border-t border-border/20">
                  <div>
                    <p className="text-sm font-medium">{edu.degree}</p>
                    <p className="text-xs text-muted-foreground">{edu.institution} · {edu.year}</p>
                  </div>
                  <button onClick={() => deleteItem("education", edu.id)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {education.length === 0 && <p className="text-xs text-muted-foreground mt-2">No education added yet.</p>}
            </CyberCard>
          </ScrollReveal>

          {/* Skills */}
          <ScrollReveal delay={240}>
            <CyberCard glowColor="rose">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Code2 className="h-4 w-4 text-rose" /> Skills</h2>
              <div className="flex gap-2 mb-3">
                <Input placeholder="Add a skill (e.g. React, Python, AWS)" value={newSkill} onChange={e => setNewSkill(e.target.value)} className="bg-secondary/50 border-border/30" onKeyDown={e => e.key === "Enter" && addSkill()} />
                <Button variant="glow" size="sm" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill.id} variant="outline" className="py-1.5 px-3 group">
                    {skill.name}
                    <button onClick={() => deleteItem("skills", skill.id)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && <p className="text-xs text-muted-foreground">No skills added. Type above and press Enter.</p>}
              </div>
            </CyberCard>
          </ScrollReveal>

          {/* ATS Tips */}
          <ScrollReveal delay={300}>
            <CyberCard glowColor="primary">
              <h2 className="text-sm font-semibold mb-2">💡 ATS Resume Tips</h2>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Use standard section headings: Experience, Education, Skills, Projects</li>
                <li>Include relevant keywords from job descriptions in your experience</li>
                <li>Quantify achievements: "Improved API response time by 40%"</li>
                <li>Use simple formatting — ATS systems can't parse complex layouts</li>
                <li>List technical skills separately for easy ATS keyword matching</li>
                <li>Keep it to 1-2 pages for most roles</li>
              </ul>
            </CyberCard>
          </ScrollReveal>
        </TabsContent>

        {/* ===== PREVIEW TAB ===== */}
        <TabsContent value="preview" className="mt-4">
          <ScrollReveal>
            <div className="flex justify-end mb-4">
              <Button variant="glow" size="sm" onClick={handleDownloadPDF} className="gap-1.5">
                <Download className="h-4 w-4" /> Download as PDF
              </Button>
            </div>
            <div className="border border-border/30 rounded-xl overflow-hidden shadow-2xl">
              <ResumePreview />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              This is an ATS-optimized format. Click "Download as PDF" to save.
            </p>
          </ScrollReveal>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioPage;
