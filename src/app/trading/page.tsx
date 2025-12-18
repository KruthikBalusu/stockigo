"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { INDIAN_STOCKS, generateLivePrice, TimeSeriesData } from "@/lib/stockApi";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  data: TimeSeriesData[];
}

export default function TradingPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const fetchAllStocks = useCallback(async () => {
    setIsLoading(true);
    const stockDataPromises = INDIAN_STOCKS.slice(0, 8).map(async (stock) => {
      try {
        const response = await fetch(`/api/stocks?symbol=${stock.symbol}&interval=5min`);
        const result = await response.json();
        
        if (result.success && result.data?.length > 0) {
          const data = result.data;
          const firstPrice = data[0]?.open || stock.basePrice;
          const lastPrice = data[data.length - 1]?.close || stock.basePrice;
          const high = Math.max(...data.map((d: TimeSeriesData) => d.high));
          const low = Math.min(...data.map((d: TimeSeriesData) => d.low));
          const volume = data.reduce((sum: number, d: TimeSeriesData) => sum + d.volume, 0);
          
          return {
            symbol: stock.symbol.replace(".BSE", ""),
            name: stock.name,
            price: lastPrice,
            change: lastPrice - firstPrice,
            changePercent: ((lastPrice - firstPrice) / firstPrice) * 100,
            high,
            low,
            volume,
            data,
          };
        }
      } catch (e) {
        console.error(`Failed to fetch ${stock.symbol}:`, e);
      }
      
      return {
        symbol: stock.symbol.replace(".BSE", ""),
        name: stock.name,
        price: stock.basePrice,
        change: 0,
        changePercent: 0,
        high: stock.basePrice * 1.02,
        low: stock.basePrice * 0.98,
        volume: Math.floor(Math.random() * 10000000),
        data: [],
      };
    });

    const results = await Promise.all(stockDataPromises);
    setStocks(results);
    if (results.length > 0) setSelectedStock(results[0]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllStocks();
  }, [fetchAllStocks]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        const newPrice = generateLivePrice(stock.price);
        const priceChange = newPrice - (stock.price - stock.change);
        return {
          ...stock,
          price: newPrice,
          change: priceChange,
          changePercent: (priceChange / (stock.price - stock.change)) * 100,
        };
      }));
      
      if (selectedStock) {
        setSelectedStock(prev => {
          if (!prev) return prev;
          const newPrice = generateLivePrice(prev.price);
          return { ...prev, price: newPrice };
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const MiniChart = ({ data, isPositive }: { data: TimeSeriesData[], isPositive: boolean }) => {
    if (data.length === 0) return <div className="w-20 h-8 bg-white/5 rounded" />;
    
    const prices = data.map(d => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 80;
      const y = 32 - ((d.close - min) / range) * 28;
      return `${x},${y}`;
    }).join(" ");
    
    return (
      <svg width="80" height="32" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-lg">Stock Market</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/analysis" className="text-gray-400 hover:text-white transition-colors">Analysis</Link>
            <span className="text-orange-400 font-medium">Trading</span>
          </div>
        </div>
      </nav>

      <main className="pt-20 px-4 pb-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Live Trading</h1>
            <p className="text-gray-400">Real-time stock prices from NSE/BSE</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/40 rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="p-4 border-b border-white/10">
                  <h2 className="font-semibold">Market Watch</h2>
                </div>
                
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading market data...</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {stocks.map((stock, i) => (
                      <motion.div
                        key={stock.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedStock(stock)}
                        className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                          selectedStock?.symbol === stock.symbol ? "bg-orange-500/10 border-l-2 border-orange-500" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400/20 to-orange-600/20 flex items-center justify-center">
                              <span className="text-orange-400 font-bold text-xs">{stock.symbol.slice(0, 3)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-white">{stock.symbol}</p>
                              <p className="text-gray-500 text-sm">{stock.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <MiniChart data={stock.data} isPositive={stock.change >= 0} />
                            <div className="text-right min-w-[100px]">
                              <p className="font-mono font-semibold text-white">₹{stock.price.toFixed(2)}</p>
                              <p className={`font-mono text-sm ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            <div className="space-y-4">
              {selectedStock && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/40 rounded-xl border border-white/10 p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <span className="text-white font-bold">{selectedStock.symbol.slice(0, 3)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{selectedStock.symbol}</h3>
                      <p className="text-gray-500 text-sm">{selectedStock.name}</p>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <motion.p
                      key={selectedStock.price}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      className="text-4xl font-bold font-mono"
                    >
                      ₹{selectedStock.price.toFixed(2)}
                    </motion.p>
                    <p className={`font-mono ${selectedStock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {selectedStock.change >= 0 ? "▲" : "▼"} {Math.abs(selectedStock.changePercent).toFixed(2)}%
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Day High</p>
                      <p className="text-emerald-400 font-mono">₹{selectedStock.high.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Day Low</p>
                      <p className="text-red-400 font-mono">₹{selectedStock.low.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 col-span-2">
                      <p className="text-gray-500 text-xs">Volume</p>
                      <p className="text-white font-mono">{(selectedStock.volume / 1000000).toFixed(2)}M</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setOrderType("buy")}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        orderType === "buy"
                          ? "bg-emerald-500 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setOrderType("sell")}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        orderType === "sell"
                          ? "bg-red-500 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      Sell
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="text-gray-500 text-sm mb-2 block">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-center font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Value</span>
                      <span className="font-mono font-semibold">₹{(selectedStock.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      orderType === "buy"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90"
                        : "bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
                    }`}
                  >
                    {orderType === "buy" ? "Place Buy Order" : "Place Sell Order"}
                  </button>

                  {orderPlaced && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center"
                    >
                      <p className="text-emerald-400 font-medium">Order placed successfully!</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
