import { useState, useEffect } from "react";
import { StickyNote } from "lucide-react";
import { Plus, Search, Trash2, Save, X, Pin, PinOff, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CyberCard } from "@/components/CyberCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = ["General", "Angular", ".NET", "SQL", "DevOps", "Career", "Ideas", "Data Engineering", "Data Science", "Gen AI"];

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  is_pinned: boolean;
  created_at: string;
}

const NotesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "", category: "General" });

  const fetchNotes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading notes", description: error.message, variant: "destructive" });
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchNotes(); }, [user]);

  const handleCreate = async () => {
    if (!newNote.title.trim() || !user) return;
    const tags = newNote.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      title: newNote.title,
      content: newNote.content,
      tags,
      category: newNote.category.toLowerCase(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewNote({ title: "", content: "", tags: "", category: "General" });
      setIsCreating(false);
      toast({ title: "Note created" });
      fetchNotes();
    }
  };

  const handleUpdate = async (id: string) => {
    if (!newNote.title.trim() || !user) return;
    const tags = newNote.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase.from("notes").update({
      title: newNote.title,
      content: newNote.content,
      tags,
      category: newNote.category.toLowerCase(),
    }).eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewNote({ title: "", content: "", tags: "", category: "General" });
      setIsEditing(null);
      toast({ title: "Note updated" });
      fetchNotes();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast({ title: "Note deleted" });
    }
  };

  const togglePin = async (id: string, current: boolean) => {
    await supabase.from("notes").update({ is_pinned: !current }).eq("id", id);
    fetchNotes();
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = !search ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = !selectedCategory || note.category === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Learning Journal</h1>
            <p className="text-sm text-muted-foreground font-mono">Personal insights, learnings & thoughts • {notes.length} notes</p>
          </div>
          <Button variant="glow" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notes, tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/60 border-border/30" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Badge key={cat} variant={selectedCategory === cat ? "default" : "outline"} className="cursor-pointer transition-colors" onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}>
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {isCreating && (
        <ScrollReveal>
          <div className="rounded-xl border border-primary/30 bg-card/60 backdrop-blur-sm p-5 space-y-3 glow-primary">
            <Input placeholder="Note title" value={newNote.title} onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))} className="bg-secondary/50 border-border/30 text-lg font-medium" />
            <Textarea placeholder="Write your note..." value={newNote.content} onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))} className="bg-secondary/50 border-border/30 min-h-[120px]" />
            <div className="flex gap-3">
              <Input placeholder="Tags (comma separated)" value={newNote.tags} onChange={(e) => setNewNote((p) => ({ ...p, tags: e.target.value }))} className="bg-secondary/50 border-border/30 flex-1" />
              <select value={newNote.category} onChange={(e) => setNewNote((p) => ({ ...p, category: e.target.value }))} className="rounded-md bg-secondary/50 border border-border/30 px-3 text-sm text-foreground">
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setIsCreating(false)}><X className="h-4 w-4" /> Cancel</Button>
              <Button variant="glow" onClick={handleCreate}><Save className="h-4 w-4" /> Save</Button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {isEditing && (
        <ScrollReveal>
          <div className="rounded-xl border border-primary/30 bg-card/60 backdrop-blur-sm p-5 space-y-3 glow-primary">
            <Input placeholder="Note title" value={newNote.title} onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))} className="bg-secondary/50 border-border/30 text-lg font-medium" />
            <Textarea placeholder="Write your note..." value={newNote.content} onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))} className="bg-secondary/50 border-border/30 min-h-[120px]" />
            <div className="flex gap-3">
              <Input placeholder="Tags (comma separated)" value={newNote.tags} onChange={(e) => setNewNote((p) => ({ ...p, tags: e.target.value }))} className="bg-secondary/50 border-border/30 flex-1" />
              <select value={newNote.category} onChange={(e) => setNewNote((p) => ({ ...p, category: e.target.value }))} className="rounded-md bg-secondary/50 border border-border/30 px-3 text-sm text-foreground">
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setIsEditing(null); setNewNote({ title: "", content: "", tags: "", category: "General" }); }}><X className="h-4 w-4" /> Cancel</Button>
              <Button variant="glow" onClick={() => handleUpdate(isEditing)}><Save className="h-4 w-4" /> Update</Button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border/20 bg-card/30 p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredNotes.map((note, i) => (
            <ScrollReveal key={note.id} delay={i * 60}>
              <CyberCard glowColor="primary">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">{note.title}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => togglePin(note.id, note.is_pinned)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                      {note.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => { setIsEditing(note.id); setNewNote({ title: note.title, content: note.content, tags: note.tags.join(", "), category: note.category }); }} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-2">{note.content}</p>
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <Badge variant="secondary" className="text-xs">{note.category}</Badge>
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground font-mono">#{tag}</span>
                  ))}
                </div>
              </CyberCard>
            </ScrollReveal>
          ))}
        </div>
      )}

      {!loading && filteredNotes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-mono text-sm">No notes found. Create your first one!</p>
        </div>
      )}
    </div>
  );
};

export default NotesPage;