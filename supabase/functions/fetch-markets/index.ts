import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // First fetch USD/INR rate for conversion
    let usdToInr = 83.5; // fallback rate
    try {
      const fxRes = await fetch(
        "https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X?range=1d&interval=1d",
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      const fxData = await fxRes.json();
      const fxMeta = fxData?.chart?.result?.[0]?.meta;
      if (fxMeta?.regularMarketPrice) usdToInr = fxMeta.regularMarketPrice;
    } catch { /* use fallback */ }

    const symbols = [
      { symbol: "^NSEI", name: "NIFTY 50", type: "index", convertToInr: false },
      { symbol: "^BSESN", name: "SENSEX", type: "index", convertToInr: false },
      { symbol: "^NSEBANK", name: "BANK NIFTY", type: "index", convertToInr: false },
      { symbol: "GC=F", name: "Gold (per 10g)", type: "commodity", convertToInr: true, goldConvert: true },
      { symbol: "SI=F", name: "Silver (per kg)", type: "commodity", convertToInr: true, silverConvert: true },
      { symbol: "CL=F", name: "Crude Oil (per bbl)", type: "commodity", convertToInr: true },
      { symbol: "RELIANCE.NS", name: "Reliance", type: "stock", convertToInr: false },
      { symbol: "TCS.NS", name: "TCS", type: "stock", convertToInr: false },
      { symbol: "INFY.NS", name: "Infosys", type: "stock", convertToInr: false },
      { symbol: "HDFCBANK.NS", name: "HDFC Bank", type: "stock", convertToInr: false },
      { symbol: "ICICIBANK.NS", name: "ICICI Bank", type: "stock", convertToInr: false },
      { symbol: "USDINR=X", name: "USD/INR", type: "forex", convertToInr: false },
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

          let price = meta.regularMarketPrice ?? 0;
          let prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;

          if (s.convertToInr) {
            // Convert USD prices to INR
            price = price * usdToInr;
            prevClose = prevClose * usdToInr;

            if ((s as any).goldConvert) {
              // Gold: USD/troy oz → INR per 10 grams
              // 1 troy oz = 31.1035g, so 10g = 10/31.1035 troy oz
              price = price * (10 / 31.1035);
              prevClose = prevClose * (10 / 31.1035);
            }
            if ((s as any).silverConvert) {
              // Silver: USD/troy oz → INR per kg
              // 1 troy oz = 31.1035g, so 1kg = 1000/31.1035 troy oz
              price = price * (1000 / 31.1035);
              prevClose = prevClose * (1000 / 31.1035);
            }
          }

          const change = price - prevClose;
          const changePercent = prevClose ? (change / prevClose) * 100 : 0;

          return {
            symbol: s.symbol,
            name: s.name,
            type: s.type,
            price: Number(price.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            currency: "INR",
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
