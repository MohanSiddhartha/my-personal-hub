import { useState, useEffect } from "react";
import { Newspaper, Bookmark, BookmarkCheck, ExternalLink, RefreshCw, Loader2, Heart, MessageCircle, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  reading_time?: number;
  tags?: string[];
  reactions?: number;
  comments?: number;
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

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-emerald-400" />
            <GlitchText className="text-2xl font-bold font-display" as="h1">
              Tech Feed
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
            New Feed
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Fresh tech articles every time you hit refresh. Save the ones you love.
        </p>
      </ScrollReveal>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-mono">Fetching fresh articles...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No articles found. Try refreshing.</p>
        </div>
      ) : (
        <ScrollReveal delay={100}>
          {/* Featured first article */}
          {articles.length > 0 && (
            <div className="mb-6">
              {(() => {
                const article = articles[0];
                const isSaved = savedUrls.has(article.url);
                return (
                  <div className="group rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm overflow-hidden card-hover">
                    <div className="grid md:grid-cols-2 gap-0">
                      {article.image_url && (
                        <div className="h-56 md:h-full overflow-hidden">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                              Featured
                            </span>
                            {article.reading_time && (
                              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {article.reading_time} min
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold leading-tight mb-2">{article.title}</h3>
                          {article.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{article.description}</p>
                          )}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {article.tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground flex items-center gap-0.5">
                                  <Hash className="h-2.5 w-2.5" />{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/10">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">
                              {article.source} · {timeAgo(article.published_at)}
                            </span>
                            {(article.reactions !== undefined && article.reactions > 0) && (
                              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                                <Heart className="h-3 w-3 text-red-400" /> {article.reactions}
                              </span>
                            )}
                            {(article.comments !== undefined && article.comments > 0) && (
                              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" /> {article.comments}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => saveArticle(article)}
                              disabled={savingUrl === article.url}
                            >
                              {isSaved ? <BookmarkCheck className="h-4 w-4 text-emerald-400" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline font-medium">
                              Read <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Rest of articles */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.slice(1).map((article, i) => {
              const isSaved = savedUrls.has(article.url);
              return (
                <div
                  key={i}
                  className="group rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm overflow-hidden card-hover flex flex-col"
                >
                  {article.image_url && (
                    <div className="h-36 overflow-hidden">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                        {article.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-7 w-7"
                        onClick={() => saveArticle(article)}
                        disabled={savingUrl === article.url}
                      >
                        {isSaved ? <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />}
                      </Button>
                    </div>
                    {article.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.description}</p>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/10">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground/60">
                          {article.source} · {timeAgo(article.published_at)}
                        </span>
                        {article.reading_time && (
                          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> {article.reading_time}m
                          </span>
                        )}
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary flex items-center gap-1 hover:underline font-medium"
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
