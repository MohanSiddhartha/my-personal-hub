import { useState } from "react";
import { Plus, Search, Copy, Trash2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useToast } from "@/hooks/use-toast";

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
}

const LANGUAGES = ["Angular", "TypeScript", "C#", ".NET", "SQL", "HTML/CSS", "JavaScript", "Python"];

const SnippetsPage = () => {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<Snippet[]>([
    {
      id: "1",
      title: "Angular Reactive Form",
      code: `this.form = this.fb.group({\n  name: ['', Validators.required],\n  email: ['', [Validators.required, Validators.email]]\n});`,
      language: "Angular",
      tags: ["forms", "reactive"],
    },
    {
      id: "2",
      title: "SQL Window Function",
      code: `SELECT name, salary,\n  ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) as rank\nFROM employees;`,
      language: "SQL",
      tags: ["window", "ranking"],
    },
  ]);
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSnippet, setNewSnippet] = useState({ title: "", code: "", language: "TypeScript", tags: "" });

  const filtered = snippets.filter((s) => {
    const matchSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    const matchLang = !selectedLang || s.language === selectedLang;
    return matchSearch && matchLang;
  });

  const handleCreate = () => {
    if (!newSnippet.title.trim() || !newSnippet.code.trim()) return;
    setSnippets((prev) => [
      {
        id: Date.now().toString(),
        title: newSnippet.title,
        code: newSnippet.code,
        language: newSnippet.language,
        tags: newSnippet.tags.split(",").map((t) => t.trim()).filter(Boolean),
      },
      ...prev,
    ]);
    setNewSnippet({ title: "", code: "", language: "TypeScript", tags: "" });
    setIsCreating(false);
    toast({ title: "Snippet saved" });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Code Snippets</h1>
            <p className="text-sm text-muted-foreground">{snippets.length} snippets</p>
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
            <Input placeholder="Search snippets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border/50" />
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
        <div className="rounded-lg border border-primary/30 bg-card p-5 space-y-3 glow-primary">
          <Input placeholder="Snippet title" value={newSnippet.title} onChange={(e) => setNewSnippet((p) => ({ ...p, title: e.target.value }))} className="bg-secondary border-border/50" />
          <Textarea placeholder="Paste your code here..." value={newSnippet.code} onChange={(e) => setNewSnippet((p) => ({ ...p, code: e.target.value }))} className="bg-secondary border-border/50 min-h-[150px] font-mono text-sm" />
          <div className="flex gap-3">
            <Input placeholder="Tags (comma separated)" value={newSnippet.tags} onChange={(e) => setNewSnippet((p) => ({ ...p, tags: e.target.value }))} className="bg-secondary border-border/50 flex-1" />
            <select value={newSnippet.language} onChange={(e) => setNewSnippet((p) => ({ ...p, language: e.target.value }))} className="rounded-md bg-secondary border border-border/50 px-3 text-sm text-foreground">
              {LANGUAGES.map((l) => (<option key={l} value={l}>{l}</option>))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button variant="glow" onClick={handleCreate}>Save</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((snippet, i) => (
          <ScrollReveal key={snippet.id} delay={i * 60}>
            <div className="rounded-lg border border-border/50 bg-card overflow-hidden hover:border-border transition-colors group">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{snippet.language}</Badge>
                  <h3 className="font-medium text-sm">{snippet.title}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyToClipboard(snippet.code)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setSnippets((p) => p.filter((s) => s.id !== snippet.id)); toast({ title: "Deleted" }); }} className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-secondary-foreground overflow-x-auto bg-muted/30">
                <code>{snippet.code}</code>
              </pre>
              {snippet.tags.length > 0 && (
                <div className="px-4 py-2 border-t border-border/30 flex gap-2">
                  {snippet.tags.map((t) => (<span key={t} className="text-xs text-muted-foreground font-mono">#{t}</span>))}
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Code2 className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p>No snippets found.</p>
        </div>
      )}
    </div>
  );
};

export default SnippetsPage;
