const API_KEY = "demo";
const BASE_URL = "https://www.alphavantage.co/query";

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export interface TimeSeriesData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const INDIAN_STOCKS = [
  { symbol: "RELIANCE.BSE", name: "Reliance Industries", basePrice: 2450 },
  { symbol: "TCS.BSE", name: "Tata Consultancy", basePrice: 3850 },
  { symbol: "HDFCBANK.BSE", name: "HDFC Bank", basePrice: 1650 },
  { symbol: "INFY.BSE", name: "Infosys", basePrice: 1480 },
  { symbol: "ICICIBANK.BSE", name: "ICICI Bank", basePrice: 1050 },
  { symbol: "HINDUNILVR.BSE", name: "Hindustan Unilever", basePrice: 2580 },
  { symbol: "SBIN.BSE", name: "State Bank of India", basePrice: 620 },
  { symbol: "BHARTIARTL.BSE", name: "Bharti Airtel", basePrice: 1180 },
  { symbol: "ITC.BSE", name: "ITC Limited", basePrice: 435 },
  { symbol: "KOTAKBANK.BSE", name: "Kotak Mahindra Bank", basePrice: 1780 },
  { symbol: "LT.BSE", name: "Larsen & Toubro", basePrice: 3420 },
  { symbol: "AXISBANK.BSE", name: "Axis Bank", basePrice: 1120 },
];

export async function fetchIntradayData(symbol: string): Promise<TimeSeriesData[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`
    );
    const data = await response.json();
    
    if (data["Time Series (5min)"]) {
      const timeSeries = data["Time Series (5min)"];
      return Object.entries(timeSeries)
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
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchGlobalQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await response.json();
    
    if (data["Global Quote"]) {
      const quote = data["Global Quote"];
      const stock = INDIAN_STOCKS.find(s => s.symbol === symbol);
      return {
        symbol: quote["01. symbol"],
        name: stock?.name || symbol,
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
        high: parseFloat(quote["03. high"]),
        low: parseFloat(quote["04. low"]),
        volume: parseInt(quote["06. volume"]),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function generateRealisticStockData(basePrice: number, points: number = 60): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  let price = basePrice;
  const now = new Date();
  
  for (let i = points - 1; i >= 0; i--) {
    const volatility = 0.002;
    const drift = 0.0001;
    const randomWalk = (Math.random() - 0.5) * 2 * volatility * price;
    const trend = drift * price;
    
    price = Math.max(basePrice * 0.95, Math.min(basePrice * 1.05, price + randomWalk + trend));
    
    const high = price * (1 + Math.random() * 0.005);
    const low = price * (1 - Math.random() * 0.005);
    const open = low + Math.random() * (high - low);
    
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
    
    data.push({
      timestamp: timestamp.toISOString(),
      open,
      high,
      low,
      close: price,
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });
  }
  
  return data;
}

export function generateLivePrice(currentPrice: number): number {
  const change = (Math.random() - 0.48) * currentPrice * 0.001;
  return currentPrice + change;
}
