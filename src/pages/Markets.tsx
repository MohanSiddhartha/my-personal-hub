import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Loader2, BarChart3, Coins, Landmark, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/GlitchText";
import { ScrollReveal } from "@/components/ScrollReveal";
import { toast } from "sonner";

type MarketItem = {
  symbol: string;
  name: string;
  type: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
};

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  index: { label: "Indices", icon: BarChart3, color: "text-primary" },
  commodity: { label: "Commodities", icon: Coins, color: "text-amber-400" },
  stock: { label: "Stocks", icon: Landmark, color: "text-cyan" },
  forex: { label: "Forex", icon: ArrowRightLeft, color: "text-emerald-400" },
};

export default function Markets() {
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-markets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();
      setMarkets(data.markets || []);
      setLastUpdated(new Date());
    } catch {
      toast.error("Failed to fetch market data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const grouped = markets.reduce<Record<string, MarketItem[]>>((acc, m) => {
    (acc[m.type] = acc[m.type] || []).push(m);
    return acc;
  }, {});

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-orange-400" />
            <GlitchText className="text-2xl font-bold font-display" as="h1">
              Indian Markets
            </GlitchText>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[10px] font-mono text-muted-foreground/50">
                Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMarkets}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Live Indian market data — NIFTY, SENSEX, Gold, Silver, top stocks & USD/INR.
        </p>
      </ScrollReveal>

      {loading && markets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No market data available. Try refreshing.</p>
        </div>
      ) : (
        Object.entries(typeConfig).map(([type, config]) => {
          const items = grouped[type];
          if (!items?.length) return null;
          const Icon = config.icon;
          return (
            <ScrollReveal key={type} delay={100}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <h2 className="text-sm font-mono uppercase tracking-[0.15em] text-muted-foreground">
                  {config.label}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                {items.map((m) => {
                  const isUp = m.change >= 0;
                  return (
                    <div
                      key={m.symbol}
                      className="rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm p-4 card-hover"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-semibold">{m.name}</h3>
                          <span className="text-[10px] font-mono text-muted-foreground/50">
                            {m.symbol}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full ${
                            isUp
                              ? "text-emerald-400 bg-emerald-400/10"
                              : "text-red-400 bg-red-400/10"
                          }`}
                        >
                          {isUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {isUp ? "+" : ""}
                          {m.changePercent}%
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-xl font-bold font-mono">
                          {formatPrice(m.price)}
                        </span>
                        <span
                          className={`text-xs font-mono ${
                            isUp ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {isUp ? "+" : ""}
                          {m.change}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          );
        })
      )}
    </div>
  );
}
