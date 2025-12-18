"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Stock {
  symbol: string;
  price: number;
  change: number;
}

const initialStocks: Stock[] = [
  { symbol: "AAPL", price: 178.52, change: 2.34 },
  { symbol: "GOOGL", price: 141.80, change: -0.89 },
  { symbol: "MSFT", price: 378.91, change: 4.12 },
  { symbol: "AMZN", price: 178.25, change: 1.56 },
  { symbol: "NVDA", price: 875.28, change: 12.45 },
  { symbol: "TSLA", price: 248.50, change: -3.21 },
  { symbol: "META", price: 505.95, change: 7.82 },
  { symbol: "BRK.B", price: 408.32, change: 0.98 },
  { symbol: "JPM", price: 195.42, change: 1.23 },
  { symbol: "V", price: 279.85, change: 2.01 },
];

export function LiveStockTicker() {
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev =>
        prev.map(stock => ({
          ...stock,
          price: Math.max(1, stock.price + (Math.random() - 0.5) * 2),
          change: stock.change + (Math.random() - 0.5) * 0.5,
        }))
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const duplicatedStocks = [...stocks, ...stocks];

  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-sm border-b border-emerald-500/20 overflow-hidden">
      <motion.div
        ref={tickerRef}
        className="flex gap-8 py-3 px-4"
        animate={{ x: [0, -50 * stocks.length] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {duplicatedStocks.map((stock, i) => (
          <div key={`${stock.symbol}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
            <span className="font-bold text-white text-sm">{stock.symbol}</span>
            <span className="text-gray-300 font-mono text-sm">${stock.price.toFixed(2)}</span>
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
  );
}
