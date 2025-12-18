import { NextResponse } from "next/server";

const STOCK_SYMBOLS: Record<string, { nse: string; name: string; basePrice: number }> = {
  "RELIANCE": { nse: "RELIANCE.NS", name: "Reliance Industries", basePrice: 2890 },
  "RELIANCE.BSE": { nse: "RELIANCE.NS", name: "Reliance Industries", basePrice: 2890 },
  "TCS": { nse: "TCS.NS", name: "Tata Consultancy", basePrice: 4150 },
  "TCS.BSE": { nse: "TCS.NS", name: "Tata Consultancy", basePrice: 4150 },
  "HDFCBANK": { nse: "HDFCBANK.NS", name: "HDFC Bank", basePrice: 1520 },
  "HDFCBANK.BSE": { nse: "HDFCBANK.NS", name: "HDFC Bank", basePrice: 1520 },
  "INFY": { nse: "INFY.NS", name: "Infosys", basePrice: 1780 },
  "INFY.BSE": { nse: "INFY.NS", name: "Infosys", basePrice: 1780 },
  "ICICIBANK": { nse: "ICICIBANK.NS", name: "ICICI Bank", basePrice: 1120 },
  "ICICIBANK.BSE": { nse: "ICICIBANK.NS", name: "ICICI Bank", basePrice: 1120 },
  "HINDUNILVR": { nse: "HINDUNILVR.NS", name: "Hindustan Unilever", basePrice: 2450 },
  "HINDUNILVR.BSE": { nse: "HINDUNILVR.NS", name: "Hindustan Unilever", basePrice: 2450 },
  "SBIN": { nse: "SBIN.NS", name: "State Bank of India", basePrice: 780 },
  "SBIN.BSE": { nse: "SBIN.NS", name: "State Bank of India", basePrice: 780 },
  "BHARTIARTL": { nse: "BHARTIARTL.NS", name: "Bharti Airtel", basePrice: 1680 },
  "BHARTIARTL.BSE": { nse: "BHARTIARTL.NS", name: "Bharti Airtel", basePrice: 1680 },
  "ITC": { nse: "ITC.NS", name: "ITC Limited", basePrice: 465 },
  "ITC.BSE": { nse: "ITC.NS", name: "ITC Limited", basePrice: 465 },
  "KOTAKBANK": { nse: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", basePrice: 1780 },
  "KOTAKBANK.BSE": { nse: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", basePrice: 1780 },
  "LT": { nse: "LT.NS", name: "Larsen & Toubro", basePrice: 3420 },
  "LT.BSE": { nse: "LT.NS", name: "Larsen & Toubro", basePrice: 3420 },
  "AXISBANK": { nse: "AXISBANK.NS", name: "Axis Bank", basePrice: 1150 },
  "AXISBANK.BSE": { nse: "AXISBANK.NS", name: "Axis Bank", basePrice: 1150 },
};

async function fetchYahooFinanceData(symbol: string) {
  const nseSymbol = STOCK_SYMBOLS[symbol]?.nse || `${symbol}.NS`;
  
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - 7 * 24 * 60 * 60;
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${nseSymbol}?period1=${period1}&period2=${period2}&interval=5m&includePrePost=false`;
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    next: { revalidate: 30 },
  });
  
  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }
  
  return response.json();
}

async function fetchYahooQuote(symbol: string) {
  const nseSymbol = STOCK_SYMBOLS[symbol]?.nse || `${symbol}.NS`;
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${nseSymbol}?interval=1d&range=1d`;
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    next: { revalidate: 15 },
  });
  
  if (!response.ok) {
    throw new Error(`Yahoo Finance Quote error: ${response.status}`);
  }
  
  return response.json();
}

function generateDynamicData(basePrice: number, count: number = 60) {
  const data = [];
  let price = basePrice;
  const now = new Date();
  const marketVariation = Math.sin(Date.now() / 100000) * 0.02;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
    const timeVariation = Math.sin(i / 10) * 0.005;
    const randomChange = (Math.random() - 0.5) * basePrice * 0.008;
    const trendBias = marketVariation * basePrice * 0.1;
    
    price = price + randomChange + trendBias * 0.01 + timeVariation * basePrice;
    price = Math.max(basePrice * 0.95, Math.min(basePrice * 1.05, price));
    
    const volatility = 0.003 + Math.random() * 0.002;
    const high = price * (1 + volatility);
    const low = price * (1 - volatility);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);

    data.push({
      timestamp: timestamp.toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 2000000) + 500000,
    });
  }

  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get("symbol") || "RELIANCE";
  const interval = searchParams.get("interval") || "5min";
  
  symbol = symbol.replace(".BSE", "").replace(".NS", "");
  
  const stockInfo = STOCK_SYMBOLS[symbol] || STOCK_SYMBOLS[`${symbol}.BSE`];
  const basePrice = stockInfo?.basePrice || 1000;

  try {
    const yahooData = await fetchYahooFinanceData(symbol);
    const result = yahooData?.chart?.result?.[0];
    
    if (result && result.timestamp && result.indicators?.quote?.[0]) {
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];
      const meta = result.meta;
      
      const formattedData = timestamps
        .map((ts: number, i: number) => {
          if (!quote.open[i] && !quote.close[i]) return null;
          return {
            timestamp: new Date(ts * 1000).toISOString(),
            open: quote.open[i] || quote.close[i] || 0,
            high: quote.high[i] || quote.close[i] || 0,
            low: quote.low[i] || quote.close[i] || 0,
            close: quote.close[i] || quote.open[i] || 0,
            volume: quote.volume[i] || 0,
          };
        })
        .filter(Boolean)
        .slice(-100);

      return NextResponse.json({
        success: true,
        data: formattedData,
        symbol,
        name: stockInfo?.name || symbol,
        interval,
        market: "NSE",
        source: "yahoo_finance",
        meta: {
          regularMarketPrice: meta?.regularMarketPrice,
          previousClose: meta?.previousClose,
          currency: meta?.currency || "INR",
        },
      });
    }
    
    throw new Error("Invalid Yahoo Finance response");
  } catch (error) {
    console.log("Yahoo Finance error, using dynamic data:", error);
    
    try {
      const quoteData = await fetchYahooQuote(symbol);
      const meta = quoteData?.chart?.result?.[0]?.meta;
      
      if (meta?.regularMarketPrice) {
        const livePrice = meta.regularMarketPrice;
        const dynamicData = generateDynamicData(livePrice, 60);
        
        return NextResponse.json({
          success: true,
          data: dynamicData,
          symbol,
          name: stockInfo?.name || symbol,
          interval,
          market: "NSE",
          source: "yahoo_quote_with_dynamic",
          meta: {
            regularMarketPrice: meta.regularMarketPrice,
            previousClose: meta.previousClose,
            currency: meta.currency || "INR",
          },
        });
      }
    } catch {
      console.log("Quote fetch also failed, using fully dynamic data");
    }
    
    const dynamicData = generateDynamicData(basePrice, 60);
    
    return NextResponse.json({
      success: true,
      data: dynamicData,
      symbol,
      name: stockInfo?.name || symbol,
      interval,
      market: "NSE",
      source: "dynamic",
    });
  }
}
