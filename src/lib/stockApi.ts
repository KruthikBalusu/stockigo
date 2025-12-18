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

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  try {
    const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}&market=IN`);
    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export async function fetchStockData(symbol: string): Promise<{
  success: boolean;
  data?: TimeSeriesData[];
  name?: string;
  meta?: {
    regularMarketPrice?: number;
    previousClose?: number;
    currency?: string;
  };
}> {
  try {
    const response = await fetch(`/api/stocks?symbol=${encodeURIComponent(symbol)}`);
    return await response.json();
  } catch {
    return { success: false };
  }
}

export async function fetchLiveQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(`/api/stocks/quote?symbols=${encodeURIComponent(symbol)}`);
    const data = await response.json();
    if (data.quotes && data.quotes.length > 0) {
      return data.quotes[0];
    }
    return null;
  } catch {
    return null;
  }
}

export function generateLivePrice(currentPrice: number): number {
  const change = (Math.random() - 0.48) * currentPrice * 0.001;
  return currentPrice + change;
}
