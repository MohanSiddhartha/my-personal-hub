import { useState, useEffect } from "react";
import { Plus, Search, Copy, Trash2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CyberCard } from "@/components/CyberCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const LANGUAGES = ["Angular", "TypeScript", "C#", ".NET", "SQL", "HTML/CSS", "JavaScript", "Python"];

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  description: string;
}

const SnippetsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSnippet, setNewSnippet] = useState({ title: "", code: "", language: "TypeScript", tags: "", description: "" });

  const fetchSnippets = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("snippets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSnippets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSnippets(); }, [user]);

  const handleCreate = async () => {
    if (!newSnippet.title.trim() || !newSnippet.code.trim() || !user) return;
    const tags = newSnippet.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase.from("snippets").insert({
      user_id: user.id,
      title: newSnippet.title,
      code: newSnippet.code,
      language: newSnippet.language.toLowerCase(),
      tags,
      description: newSnippet.description,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewSnippet({ title: "", code: "", language: "TypeScript", tags: "", description: "" });
      setIsCreating(false);
      toast({ title: "Snippet saved" });
      fetchSnippets();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("snippets").delete().eq("id", id);
    setSnippets((p) => p.filter((s) => s.id !== id));
    toast({ title: "Deleted" });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard" });
  };

  const filtered = snippets.filter((s) => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchLang = !selectedLang || s.language === selectedLang.toLowerCase();
    return matchSearch && matchLang;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Code Snippets</h1>
            <p className="text-sm text-muted-foreground font-mono">{snippets.length} snippets</p>
          </div>
          <Button variant="glow" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" /> New Snippet
          </Button>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search snippets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/60 border-border/30" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map((lang) => (
              <Badge key={lang} variant={selectedLang === lang ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedLang(selectedLang === lang ? null : lang)}>
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {isCreating && (
        <div className="rounded-xl border border-primary/30 bg-card/60 backdrop-blur-sm p-5 space-y-3 glow-primary">
          <Input placeholder="Snippet title" value={newSnippet.title} onChange={(e) => setNewSnippet((p) => ({ ...p, title: e.target.value }))} className="bg-secondary/50 border-border/30" />
          <Textarea placeholder="Paste your code here..." value={newSnippet.code} onChange={(e) => setNewSnippet((p) => ({ ...p, code: e.target.value }))} className="bg-secondary/50 border-border/30 min-h-[150px] font-mono text-sm" />
          <div className="flex gap-3">
            <Input placeholder="Tags (comma separated)" value={newSnippet.tags} onChange={(e) => setNewSnippet((p) => ({ ...p, tags: e.target.value }))} className="bg-secondary/50 border-border/30 flex-1" />
            <select value={newSnippet.language} onChange={(e) => setNewSnippet((p) => ({ ...p, language: e.target.value }))} className="rounded-md bg-secondary/50 border border-border/30 px-3 text-sm text-foreground">
              {LANGUAGES.map((l) => (<option key={l} value={l}>{l}</option>))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button variant="glow" onClick={handleCreate}>Save</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/20 bg-card/30 h-40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((snippet, i) => (
            <ScrollReveal key={snippet.id} delay={i * 60}>
              <CyberCard glowColor="cyan">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">{snippet.language}</Badge>
                    <h3 className="font-medium text-sm">{snippet.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => copyToClipboard(snippet.code)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(snippet.id)} className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <pre className="p-3 rounded-lg text-sm font-mono text-secondary-foreground overflow-x-auto bg-muted/30 border border-border/20">
                  <code>{snippet.code}</code>
                </pre>
                {snippet.tags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {snippet.tags.map((t) => (<span key={t} className="text-xs text-muted-foreground font-mono">#{t}</span>))}
                  </div>
                )}
              </CyberCard>
            </ScrollReveal>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Code2 className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-mono text-sm">No snippets found.</p>
        </div>
      )}
    </div>
  );
};

export default SnippetsPage;