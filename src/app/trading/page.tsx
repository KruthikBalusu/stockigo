"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  sector: string;
  data: TimeSeriesData[];
}

const SECTORS = ["All", "Banking", "IT", "Pharma", "FMCG", "Automobile", "Energy", "Metal", "Finance", "Power", "Cement", "Infrastructure", "Consumer", "Telecom", "Chemicals", "Insurance", "Healthcare", "Industrial", "Real Estate", "Retail"];

export default function TradingPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [visibleCount, setVisibleCount] = useState(20);

  const initializeStocks = useCallback(() => {
    setIsLoading(true);
    const stockData = INDIAN_STOCKS.map((stock) => {
      const volatility = (Math.random() - 0.5) * 0.04;
      const price = stock.basePrice * (1 + volatility);
      const change = price - stock.basePrice;
      const changePercent = (change / stock.basePrice) * 100;
      
      return {
        symbol: stock.symbol.replace(".BSE", ""),
        name: stock.name,
        price,
        change,
        changePercent,
        high: price * (1 + Math.random() * 0.02),
        low: price * (1 - Math.random() * 0.02),
        volume: Math.floor(Math.random() * 10000000) + 100000,
        sector: stock.sector || "Other",
        data: generateMiniChartData(price),
      };
    });
    
    setStocks(stockData);
    if (stockData.length > 0) setSelectedStock(stockData[0]);
    setIsLoading(false);
  }, []);

  function generateMiniChartData(basePrice: number): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    let price = basePrice * (0.98 + Math.random() * 0.04);
    
    for (let i = 0; i < 20; i++) {
      const change = (Math.random() - 0.48) * price * 0.01;
      price = Math.max(price * 0.95, Math.min(price * 1.05, price + change));
      
      data.push({
        timestamp: new Date().toISOString(),
        open: price,
        high: price * 1.002,
        low: price * 0.998,
        close: price,
        volume: Math.floor(Math.random() * 100000),
      });
    }
    return data;
  }

  useEffect(() => {
    initializeStocks();
  }, [initializeStocks]);

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

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = searchQuery === "" || 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === "All" || stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [stocks, searchQuery, selectedSector]);

  const visibleStocks = useMemo(() => {
    return filteredStocks.slice(0, visibleCount);
  }, [filteredStocks, visibleCount]);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 20, filteredStocks.length));
  };

  const MiniChart = ({ data, isPositive }: { data: TimeSeriesData[], isPositive: boolean }) => {
    if (data.length === 0) return <div className="w-16 h-6 bg-white/5 rounded" />;
    
    const prices = data.map(d => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 60;
      const y = 24 - ((d.close - min) / range) * 20;
      return `${x},${y}`;
    }).join(" ");
    
    return (
      <svg width="60" height="24" className="overflow-visible">
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
            className="mb-6"
          >
            <h1 className="text-3xl font-bold mb-2">Live Trading</h1>
            <p className="text-gray-400">
              {filteredStocks.length} stocks available • Real-time prices from NSE/BSE
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/40 rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Market Watch</h2>
                    <span className="text-sm text-gray-500">
                      Showing {visibleStocks.length} of {filteredStocks.length}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by symbol or company name..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setVisibleCount(20);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map(sector => (
                      <button
                        key={sector}
                        onClick={() => {
                          setSelectedSector(sector);
                          setVisibleCount(20);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedSector === sector
                            ? "bg-orange-500 text-white"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading market data...</div>
                ) : filteredStocks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No stocks found matching your search.</div>
                ) : (
                  <>
                    <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                      <AnimatePresence>
                        {visibleStocks.map((stock, i) => (
                          <motion.div
                            key={stock.symbol}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.02 }}
                            onClick={() => setSelectedStock(stock)}
                            className={`p-3 cursor-pointer transition-all hover:bg-white/5 ${
                              selectedStock?.symbol === stock.symbol ? "bg-orange-500/10 border-l-2 border-orange-500" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400/20 to-orange-600/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-orange-400 font-bold text-[10px]">{stock.symbol.slice(0, 3)}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-white text-sm truncate">{stock.symbol}</p>
                                  <p className="text-gray-500 text-xs truncate">{stock.name}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-2">
                                <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 hidden sm:block">
                                  {stock.sector}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 ml-2">
                                <div className="hidden sm:block">
                                  <MiniChart data={stock.data} isPositive={stock.change >= 0} />
                                </div>
                                <div className="text-right min-w-[90px]">
                                  <p className="font-mono font-semibold text-white text-sm">₹{stock.price.toFixed(2)}</p>
                                  <p className={`font-mono text-xs ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    {visibleCount < filteredStocks.length && (
                      <div className="p-4 border-t border-white/10">
                        <button
                          onClick={loadMore}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 transition-all"
                        >
                          Load More ({filteredStocks.length - visibleCount} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>

            <div className="space-y-4">
              {selectedStock && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/40 rounded-xl border border-white/10 p-6 sticky top-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <span className="text-white font-bold">{selectedStock.symbol.slice(0, 3)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl truncate">{selectedStock.symbol}</h3>
                      <p className="text-gray-500 text-sm truncate">{selectedStock.name}</p>
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

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Day High</p>
                      <p className="text-emerald-400 font-mono text-sm">₹{selectedStock.high.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Day Low</p>
                      <p className="text-red-400 font-mono text-sm">₹{selectedStock.low.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Sector</p>
                      <p className="text-white font-medium text-sm">{selectedStock.sector}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Volume</p>
                      <p className="text-white font-mono text-sm">{(selectedStock.volume / 1000000).toFixed(2)}M</p>
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
