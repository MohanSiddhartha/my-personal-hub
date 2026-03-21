import { useState } from "react";
import { Plus, Search, Tag, Trash2, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const CATEGORIES = ["General", "Angular", ".NET", "SQL", "DevOps", "Career", "Ideas"];

const NotesPage = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Angular Signals Pattern",
      content:
        "Signals provide a reactive primitive for managing state. Use computed() for derived state and effect() for side effects.",
      tags: ["angular", "signals", "state"],
      category: "Angular",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: ".NET Middleware Order",
      content:
        "Middleware executes in the order added to the pipeline. UseAuthentication() must come before UseAuthorization().",
      tags: [".net", "middleware", "pipeline"],
      category: ".NET",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "", category: "General" });

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      !search ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = !selectedCategory || note.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreate = () => {
    if (!newNote.title.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      category: newNote.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote({ title: "", content: "", tags: "", category: "General" });
    setIsCreating(false);
    toast({ title: "Note created", description: note.title });
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Note deleted" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notes & Knowledge Vault</h1>
            <p className="text-sm text-muted-foreground">
              {notes.length} notes saved
            </p>
          </div>
          <Button variant="glow" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>
      </ScrollReveal>

      {/* Search & filters */}
      <ScrollReveal delay={80}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Create form */}
      {isCreating && (
        <ScrollReveal>
          <div className="rounded-lg border border-primary/30 bg-card p-5 space-y-3 glow-primary">
            <Input
              placeholder="Note title"
              value={newNote.title}
              onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))}
              className="bg-secondary border-border/50 text-lg font-medium"
            />
            <Textarea
              placeholder="Write your note..."
              value={newNote.content}
              onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))}
              className="bg-secondary border-border/50 min-h-[120px]"
            />
            <div className="flex gap-3">
              <Input
                placeholder="Tags (comma separated)"
                value={newNote.tags}
                onChange={(e) => setNewNote((p) => ({ ...p, tags: e.target.value }))}
                className="bg-secondary border-border/50 flex-1"
              />
              <select
                value={newNote.category}
                onChange={(e) => setNewNote((p) => ({ ...p, category: e.target.value }))}
                className="rounded-md bg-secondary border border-border/50 px-3 text-sm text-foreground"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button variant="glow" onClick={handleCreate}>
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Notes grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredNotes.map((note, i) => (
          <ScrollReveal key={note.id} delay={i * 60}>
            <div className="rounded-lg border border-border/50 bg-card p-4 space-y-2 hover:border-border transition-colors group">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-foreground">{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {note.content}
              </p>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <Badge variant="secondary" className="text-xs">
                  {note.category}
                </Badge>
                {note.tags.map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <StickyNote className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p>No notes found. Create your first one!</p>
        </div>
      )}
    </div>
  );
};

// Need this import for the empty state icon
import { StickyNote } from "lucide-react";

export default NotesPage;
