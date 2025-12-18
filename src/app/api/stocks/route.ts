import { NextResponse } from "next/server";

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";
const BASE_URL = "https://www.alphavantage.co/query";

const INDIAN_STOCK_MAP: Record<string, string> = {
  "RELIANCE": "RELIANCE.BSE",
  "TCS": "TCS.BSE",
  "HDFCBANK": "HDFCBANK.BSE",
  "INFY": "INFY.BSE",
  "ICICIBANK": "ICICIBANK.BSE",
  "HINDUNILVR": "HINDUNILVR.BSE",
  "SBIN": "SBIN.BSE",
  "BHARTIARTL": "BHARTIARTL.BSE",
  "ITC": "ITC.BSE",
  "KOTAKBANK": "KOTAKBANK.BSE",
  "LT": "LT.BSE",
  "AXISBANK": "AXISBANK.BSE",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get("symbol") || "RELIANCE.BSE";
  const interval = searchParams.get("interval") || "5min";

  if (INDIAN_STOCK_MAP[symbol]) {
    symbol = INDIAN_STOCK_MAP[symbol];
  }

  try {
    const response = await fetch(
      `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`,
      { next: { revalidate: 60 } }
    );

    const data = await response.json();

    if (data["Time Series (5min)"]) {
      const timeSeries = data["Time Series (5min)"];
      const formattedData = Object.entries(timeSeries)
        .slice(0, 60)
        .map(([timestamp, values]: [string, unknown]) => {
          const v = values as Record<string, string>;
          return {
            timestamp,
            open: parseFloat(v["1. open"]),
            high: parseFloat(v["2. high"]),
            low: parseFloat(v["3. low"]),
            close: parseFloat(v["4. close"]),
            volume: parseInt(v["5. volume"]),
          };
        })
        .reverse();

      return NextResponse.json({ 
        success: true, 
        data: formattedData,
        symbol,
        market: "NSE/BSE"
      });
    }

    if (data["Time Series (Daily)"]) {
      const timeSeries = data["Time Series (Daily)"];
      const formattedData = Object.entries(timeSeries)
        .slice(0, 60)
        .map(([timestamp, values]: [string, unknown]) => {
          const v = values as Record<string, string>;
          return {
            timestamp,
            open: parseFloat(v["1. open"]),
            high: parseFloat(v["2. high"]),
            low: parseFloat(v["3. low"]),
            close: parseFloat(v["4. close"]),
            volume: parseInt(v["5. volume"]),
          };
        })
        .reverse();

      return NextResponse.json({ 
        success: true, 
        data: formattedData,
        symbol,
        market: "NSE/BSE"
      });
    }

    if (data["Note"] || data["Information"]) {
      return NextResponse.json({
        success: false,
        error: "API rate limit reached",
        message: data["Note"] || data["Information"],
      });
    }

    return NextResponse.json({ success: false, error: "No data available", raw: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
