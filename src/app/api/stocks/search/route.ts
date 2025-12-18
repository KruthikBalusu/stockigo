import { NextResponse } from "next/server";

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

async function searchYahoo(query: string, market: string) {
  const searchQuery = market === "IN" ? `${query}.NS ${query}.BO` : query;
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(searchQuery)}&quotesCount=30&newsCount=0&enableFuzzyQuery=true&quotesQueryId=tss_match_phrase_query`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Yahoo search error: ${response.status}`);
  }

  return response.json();
}

async function searchAlphaVantage(query: string) {
  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_KEY}`;

  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Alpha Vantage search error: ${response.status}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const market = searchParams.get("market") || "IN";

  if (!query || query.length < 1) {
    return NextResponse.json({ success: false, error: "Query required", data: [] });
  }

  try {
    const yahooData = await searchYahoo(query, market);
    const quotes = yahooData?.quotes || [];

    const results = quotes
      .filter((q: { exchange?: string; quoteType?: string; symbol?: string }) => {
        if (market === "IN") {
          return (
            q.symbol?.endsWith(".NS") ||
            q.symbol?.endsWith(".BO") ||
            q.exchange === "NSI" ||
            q.exchange === "BSE" ||
            q.exchange === "NSE" ||
            q.exchange === "BOM"
          );
        }
        return q.quoteType === "EQUITY";
      })
      .map((q: { symbol?: string; shortname?: string; longname?: string; exchange?: string; quoteType?: string }) => ({
        symbol: q.symbol?.replace(".NS", "").replace(".BO", "") || "",
        name: q.shortname || q.longname || q.symbol?.replace(".NS", "").replace(".BO", "") || "",
        exchange: q.symbol?.endsWith(".NS") ? "NSE" : q.symbol?.endsWith(".BO") ? "BSE" : q.exchange === "NSI" ? "NSE" : q.exchange || "NSE",
        type: q.quoteType || "Stock",
      }))

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      source: "yahoo",
    });
  } catch (yahooError) {
    console.log("Yahoo search failed, trying Alpha Vantage:", yahooError);

    try {
      const avData = await searchAlphaVantage(query);
      const matches = avData?.bestMatches || [];

      const results = matches
        .filter((m: { "4. region"?: string }) => market === "IN" ? m["4. region"] === "India" : true)
        .map((m: { "1. symbol"?: string; "2. name"?: string; "4. region"?: string; "3. type"?: string }) => ({
          symbol: m["1. symbol"]?.split(".")[0] || "",
          name: m["2. name"] || "",
          exchange: m["4. region"] === "India" ? "NSE" : m["4. region"] || "",
          type: m["3. type"] || "Stock",
        }));

      return NextResponse.json({
        success: true,
        data: results,
        count: results.length,
        source: "alpha_vantage",
      });
    } catch (avError) {
      console.log("Alpha Vantage search also failed:", avError);
      return NextResponse.json({
        success: false,
        error: "Search failed",
        data: [],
      });
    }
  }
}
