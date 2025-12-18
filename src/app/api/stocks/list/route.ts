import { NextResponse } from "next/server";

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

export interface ListedStock {
  symbol: string;
  name: string;
  exchange: string;
  assetType: string;
  ipoDate: string;
  status: string;
}

let cachedStocks: ListedStock[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exchange = searchParams.get("exchange") || "NSE";
  const forceRefresh = searchParams.get("refresh") === "true";

  const now = Date.now();
  if (!forceRefresh && cachedStocks.length > 0 && now - cacheTimestamp < CACHE_DURATION) {
    const filtered = exchange === "ALL" ? cachedStocks : cachedStocks.filter(s => s.exchange === exchange);
    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
      source: "cache",
      lastUpdated: new Date(cacheTimestamp).toISOString(),
    });
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${API_KEY}`,
      { next: { revalidate: 86400 } }
    );

    const csvText = await response.text();

    if (csvText.includes("Note") || csvText.includes("Error") || csvText.includes("limit")) {
      return NextResponse.json({
        success: false,
        error: "API rate limit reached",
        data: getIndianStocksFallback(),
        source: "fallback",
      });
    }

    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",");

    const stocks: ListedStock[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      if (values.length >= 6) {
        stocks.push({
          symbol: values[0],
          name: values[1],
          exchange: values[2],
          assetType: values[3],
          ipoDate: values[4],
          status: values[5],
        });
      }
    }

    cachedStocks = stocks;
    cacheTimestamp = now;

    const filtered = exchange === "ALL" ? stocks : stocks.filter(s => s.exchange === exchange);

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
      totalCount: stocks.length,
      source: "live",
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching listing status:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch listing status",
      data: getIndianStocksFallback(),
      source: "fallback",
    });
  }
}

function getIndianStocksFallback(): ListedStock[] {
  return [
    { symbol: "RELIANCE.BSE", name: "Reliance Industries Limited", exchange: "BSE", assetType: "Stock", ipoDate: "1977-01-01", status: "Active" },
    { symbol: "TCS.BSE", name: "Tata Consultancy Services Limited", exchange: "BSE", assetType: "Stock", ipoDate: "2004-08-25", status: "Active" },
    { symbol: "HDFCBANK.BSE", name: "HDFC Bank Limited", exchange: "BSE", assetType: "Stock", ipoDate: "1995-01-01", status: "Active" },
    { symbol: "INFY.BSE", name: "Infosys Limited", exchange: "BSE", assetType: "Stock", ipoDate: "1993-06-14", status: "Active" },
    { symbol: "ICICIBANK.BSE", name: "ICICI Bank Limited", exchange: "BSE", assetType: "Stock", ipoDate: "1997-09-17", status: "Active" },
  ];
}
