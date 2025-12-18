"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { INDIAN_STOCKS, generateLivePrice } from "@/lib/stockApi";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const initialStocks: Stock[] = INDIAN_STOCKS.map(stock => ({
  symbol: stock.symbol.replace(".BSE", ""),
  name: stock.name,
  price: stock.basePrice,
  change: (Math.random() - 0.5) * 4,
}));

export function LiveStockTicker() {
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const tickerRef = useRef<HTMLDivElement>(null);

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
          animate={{ x: [0, -80 * stocks.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
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
