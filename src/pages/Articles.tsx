import { useState, useEffect } from "react";
import { Newspaper, Bookmark, BookmarkCheck, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlitchText } from "@/components/GlitchText";
import { ScrollReveal } from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Article = {
  title: string;
  description: string | null;
  url: string;
  source: string | null;
  image_url: string | null;
  published_at: string | null;
};

export default function Articles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [savingUrl, setSavingUrl] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-news`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "technology" }),
        }
      );
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      toast.error("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_articles")
      .select("url")
      .eq("user_id", user.id);
    if (data) setSavedUrls(new Set(data.map((d: any) => d.url)));
  };

  useEffect(() => {
    fetchArticles();
    fetchSaved();
  }, [user]);

  const saveArticle = async (article: Article) => {
    if (!user) return;
    setSavingUrl(article.url);
    try {
      if (savedUrls.has(article.url)) {
        await supabase
          .from("saved_articles")
          .delete()
          .eq("user_id", user.id)
          .eq("url", article.url);
        setSavedUrls((prev) => {
          const next = new Set(prev);
          next.delete(article.url);
          return next;
        });
        toast.success("Article removed");
      } else {
        await supabase.from("saved_articles").insert({
          user_id: user.id,
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source,
          image_url: article.image_url,
          published_at: article.published_at,
        });
        setSavedUrls((prev) => new Set(prev).add(article.url));
        toast.success("Article saved!");
      }
    } catch {
      toast.error("Failed to save article");
    } finally {
      setSavingUrl(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-emerald-400" />
            <GlitchText className="text-2xl font-bold font-display" as="h1">
              Tech Articles
            </GlitchText>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchArticles}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Latest tech news from around the web. Bookmark articles to save them.
        </p>
      </ScrollReveal>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No articles found. Try refreshing.</p>
        </div>
      ) : (
        <ScrollReveal delay={100}>
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article, i) => {
              const isSaved = savedUrls.has(article.url);
              return (
                <div
                  key={i}
                  className="group rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm overflow-hidden card-hover"
                >
                  {article.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                        {article.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8"
                        onClick={() => saveArticle(article)}
                        disabled={savingUrl === article.url}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {article.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">
                        {article.source}
                        {article.published_at &&
                          ` · ${new Date(article.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                      </span>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                      >
                        Read <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
