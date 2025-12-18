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

function generateDemoData(basePrice: number, count: number = 60) {
  const data = [];
  let price = basePrice;
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
    const change = (Math.random() - 0.5) * basePrice * 0.01;
    price = Math.max(price + change, basePrice * 0.9);
    
    const high = price * (1 + Math.random() * 0.005);
    const low = price * (1 - Math.random() * 0.005);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);

    data.push({
      timestamp: timestamp.toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });
  }

  return data;
}

const DEMO_BASE_PRICES: Record<string, number> = {
  "RELIANCE.BSE": 2890,
  "TCS.BSE": 4150,
  "HDFCBANK.BSE": 1520,
  "INFY.BSE": 1780,
  "ICICIBANK.BSE": 1120,
  "HINDUNILVR.BSE": 2450,
  "SBIN.BSE": 780,
  "BHARTIARTL.BSE": 1680,
  "ITC.BSE": 465,
  "KOTAKBANK.BSE": 1780,
  "LT.BSE": 3420,
  "AXISBANK.BSE": 1150,
  "IBM": 180,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get("symbol") || "RELIANCE.BSE";
  const interval = searchParams.get("interval") || "5min";

  if (INDIAN_STOCK_MAP[symbol]) {
    symbol = INDIAN_STOCK_MAP[symbol];
  }

  const isDaily = interval === "daily";
  const isWeekly = interval === "weekly";
  
  let apiFunction = "TIME_SERIES_INTRADAY";
  let timeSeriesKey = `Time Series (${interval})`;
  
  if (isDaily) {
    apiFunction = "TIME_SERIES_DAILY";
    timeSeriesKey = "Time Series (Daily)";
  } else if (isWeekly) {
    apiFunction = "TIME_SERIES_WEEKLY";
    timeSeriesKey = "Weekly Time Series";
  }
  
  const apiUrl = isDaily || isWeekly 
    ? `${BASE_URL}?function=${apiFunction}&symbol=${symbol}&apikey=${API_KEY}`
    : `${BASE_URL}?function=${apiFunction}&symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`;

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 60 } });
    const data = await response.json();

    const timeSeries = data[timeSeriesKey] || data["Time Series (5min)"] || data["Time Series (Daily)"] || data["Weekly Time Series"];
    
    if (timeSeries) {
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
        interval,
        market: "NSE/BSE",
        source: "live"
      });
    }

    if (data["Note"] || data["Information"] || data["Error Message"]) {
      const basePrice = DEMO_BASE_PRICES[symbol] || 1000;
      const demoData = generateDemoData(basePrice, 60);
      
      return NextResponse.json({
        success: true,
        data: demoData,
        symbol,
        market: "NSE/BSE",
        source: "demo",
        message: "Using demo data - API rate limit reached"
      });
    }

    const basePrice = DEMO_BASE_PRICES[symbol] || 1000;
    const demoData = generateDemoData(basePrice, 60);
    
    return NextResponse.json({ 
      success: true, 
      data: demoData,
      symbol,
      market: "NSE/BSE",
      source: "demo"
    });
  } catch (error) {
    const basePrice = DEMO_BASE_PRICES[symbol] || 1000;
    const demoData = generateDemoData(basePrice, 60);
    
    return NextResponse.json({ 
      success: true, 
      data: demoData,
      symbol,
      market: "NSE/BSE",
      source: "demo",
      error: String(error)
    });
  }
}
