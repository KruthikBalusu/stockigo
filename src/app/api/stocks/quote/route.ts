import { NextResponse } from "next/server";

async function fetchYahooQuote(symbol: string) {
  const nseSymbol = symbol.includes(".") ? symbol : `${symbol}.NS`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${nseSymbol}?interval=1d&range=1d`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    next: { revalidate: 10 },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance error: ${response.status}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols") || "";
  const symbols = symbolsParam.split(",").filter(Boolean).slice(0, 50);

  if (symbols.length === 0) {
    return NextResponse.json({ success: false, error: "No symbols provided" });
  }

  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      try {
        const data = await fetchYahooQuote(symbol);
        const result = data?.chart?.result?.[0];
        const meta = result?.meta;

        if (meta?.regularMarketPrice) {
          return {
            symbol: symbol.replace(".NS", "").replace(".BSE", ""),
            price: meta.regularMarketPrice,
            previousClose: meta.previousClose || meta.regularMarketPrice,
            change: meta.regularMarketPrice - (meta.previousClose || meta.regularMarketPrice),
            changePercent: ((meta.regularMarketPrice - (meta.previousClose || meta.regularMarketPrice)) / (meta.previousClose || meta.regularMarketPrice)) * 100,
            high: meta.regularMarketDayHigh || meta.regularMarketPrice * 1.01,
            low: meta.regularMarketDayLow || meta.regularMarketPrice * 0.99,
            volume: meta.regularMarketVolume || 0,
            currency: meta.currency || "INR",
            source: "live",
          };
        }
        throw new Error("No price data");
      } catch {
        return {
          symbol: symbol.replace(".NS", "").replace(".BSE", ""),
          error: "Failed to fetch",
        };
      }
    })
  );

  const quotes = results
    .filter((r): r is PromiseFulfilledResult<Record<string, unknown>> => r.status === "fulfilled")
    .map((r) => r.value);

  return NextResponse.json({
    success: true,
    data: quotes,
    count: quotes.length,
  });
}
