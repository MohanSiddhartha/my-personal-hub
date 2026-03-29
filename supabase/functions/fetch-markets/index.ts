import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch Indian market data from free APIs
    // Using Yahoo Finance unofficial API for Indian stocks/commodities
    const symbols = [
      { symbol: "^NSEI", name: "NIFTY 50", type: "index" },
      { symbol: "^BSESN", name: "SENSEX", type: "index" },
      { symbol: "^NSEBANK", name: "BANK NIFTY", type: "index" },
      { symbol: "GC=F", name: "Gold (USD/oz)", type: "commodity" },
      { symbol: "SI=F", name: "Silver (USD/oz)", type: "commodity" },
      { symbol: "CL=F", name: "Crude Oil", type: "commodity" },
      { symbol: "RELIANCE.NS", name: "Reliance", type: "stock" },
      { symbol: "TCS.NS", name: "TCS", type: "stock" },
      { symbol: "INFY.NS", name: "Infosys", type: "stock" },
      { symbol: "HDFCBANK.NS", name: "HDFC Bank", type: "stock" },
      { symbol: "ICICIBANK.NS", name: "ICICI Bank", type: "stock" },
      { symbol: "USDINR=X", name: "USD/INR", type: "forex" },
    ];

    const results = await Promise.allSettled(
      symbols.map(async (s) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${s.symbol}?range=1d&interval=5m`;
          const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (!meta) return null;

          const price = meta.regularMarketPrice ?? 0;
          const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
          const change = price - prevClose;
          const changePercent = prevClose ? (change / prevClose) * 100 : 0;

          return {
            symbol: s.symbol,
            name: s.name,
            type: s.type,
            price: Number(price.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            currency: meta.currency || "INR",
          };
        } catch {
          return null;
        }
      })
    );

    const markets = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r: any) => r.value);

    return new Response(JSON.stringify({ markets }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching markets:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch market data", markets: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
