"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { generateLivePrice } from "@/lib/stockApi";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export function LiveStockTicker() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTopStocks() {
      try {
        const symbols = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT", "AXISBANK", "WIPRO"];
        const response = await fetch(`/api/stocks/quote?symbols=${symbols.join(",")}`);
        const data = await response.json();
        
        if (data.quotes && data.quotes.length > 0) {
          setStocks(data.quotes.map((q: { symbol: string; name: string; price: number; changePercent: number }) => ({
            symbol: q.symbol,
            name: q.name,
            price: q.price,
            change: q.changePercent,
          })));
        }
      } catch {
        setStocks([
          { symbol: "RELIANCE", name: "Reliance", price: 2890, change: 1.2 },
          { symbol: "TCS", name: "TCS", price: 4150, change: -0.5 },
          { symbol: "HDFCBANK", name: "HDFC Bank", price: 1650, change: 0.8 },
          { symbol: "INFY", name: "Infosys", price: 1780, change: -0.3 },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopStocks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev =>
        prev.map(stock => {
          const newPrice = generateLivePrice(stock.price);
          const priceChange = ((newPrice - stock.price) / stock.price) * 100;
          return {
            ...stock,
            price: newPrice,
            change: stock.change + priceChange,
          };
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const duplicatedStocks = [...stocks, ...stocks];

  if (isLoading || stocks.length === 0) {
    return (
      <div className="fixed top-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-sm border-b border-orange-500/20 overflow-hidden">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3 flex items-center gap-2 shrink-0 z-10">
            <span className="text-white font-bold text-sm">NSE/BSE</span>
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          </div>
          <div className="py-3 px-4 text-gray-400 text-sm">Loading live prices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-sm border-b border-orange-500/20 overflow-hidden">
      <div className="flex items-center">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3 flex items-center gap-2 shrink-0 z-10">
          <span className="text-white font-bold text-sm">NSE/BSE</span>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
        <motion.div
          ref={tickerRef}
          className="flex gap-8 py-3 px-4"
          animate={{ x: [0, -100 * stocks.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 50,
              ease: "linear",
            },
          }}
        >
          {duplicatedStocks.map((stock, i) => (
            <div key={`${stock.symbol}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
              <span className="font-bold text-white text-sm">{stock.symbol}</span>
              <span className="text-gray-300 font-mono text-sm">₹{stock.price.toFixed(2)}</span>
              <span
                className={`font-mono text-sm ${
                  stock.change >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
