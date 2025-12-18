"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  exchange: string;
  source: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export default function TradingPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);

  const popularSymbols = [
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL",
    "ITC", "KOTAKBANK", "LT", "AXISBANK", "HINDUNILVR", "MARUTI", "SUNPHARMA",
    "TATAMOTORS", "WIPRO", "HCLTECH", "BAJFINANCE", "ASIANPAINT", "TITAN"
  ];

  const fetchLiveQuote = useCallback(async (symbol: string): Promise<StockData | null> => {
    try {
      const response = await fetch(`/api/stocks/quote?symbols=${symbol}`);
      const data = await response.json();
      
      if (data.success && data.data?.[0] && !data.data[0].error) {
        const quote = data.data[0];
        return {
          symbol: quote.symbol,
          name: quote.symbol,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          high: quote.high,
          low: quote.low,
          volume: quote.volume,
          exchange: "NSE",
          source: quote.source,
        };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const loadInitialStocks = useCallback(async () => {
    setIsLoading(true);
    
    const batchSize = 5;
    const loadedStocks: StockData[] = [];
    
    for (let i = 0; i < popularSymbols.length; i += batchSize) {
      const batch = popularSymbols.slice(i, i + batchSize);
      const symbols = batch.join(",");
      
      try {
        const response = await fetch(`/api/stocks/quote?symbols=${symbols}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          for (const quote of data.data) {
            if (!quote.error) {
              loadedStocks.push({
                symbol: quote.symbol,
                name: quote.symbol,
                price: quote.price,
                change: quote.change,
                changePercent: quote.changePercent,
                high: quote.high,
                low: quote.low,
                volume: quote.volume,
                exchange: "NSE",
                source: quote.source,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching batch:", error);
      }
      
      setStocks([...loadedStocks]);
      if (loadedStocks.length > 0 && !selectedStock) {
        setSelectedStock(loadedStocks[0]);
      }
    }
    
    setIsLoading(false);
  }, [selectedStock]);

  const searchStocks = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}&market=IN`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setSearchResults(data.data.slice(0, 10));
        setShowSearchDropdown(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
    setIsSearching(false);
  }, []);

  const addStockFromSearch = async (result: SearchResult) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    setLoadingSymbol(result.symbol);

    const existing = stocks.find(s => s.symbol === result.symbol);
    if (existing) {
      setSelectedStock(existing);
      setLoadingSymbol(null);
      return;
    }

    const quote = await fetchLiveQuote(result.symbol);
    if (quote) {
      quote.name = result.name || result.symbol;
      setStocks(prev => [quote, ...prev]);
      setSelectedStock(quote);
    }
    setLoadingSymbol(null);
  };

  useEffect(() => {
    loadInitialStocks();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchStocks(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchStocks]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (stocks.length === 0) return;
      
      const symbols = stocks.slice(0, 10).map(s => s.symbol).join(",");
      try {
        const response = await fetch(`/api/stocks/quote?symbols=${symbols}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setStocks(prev => prev.map(stock => {
            const updated = data.data.find((q: StockData) => q.symbol === stock.symbol);
            if (updated && !("error" in updated)) {
              return {
                ...stock,
                price: updated.price,
                change: updated.change,
                changePercent: updated.changePercent,
                high: updated.high,
                low: updated.low,
                volume: updated.volume,
              };
            }
            return stock;
          }));
          
          if (selectedStock) {
            const updatedSelected = data.data.find((q: StockData) => q.symbol === selectedStock.symbol);
            if (updatedSelected && !("error" in updatedSelected)) {
              setSelectedStock(prev => prev ? {
                ...prev,
                price: updatedSelected.price,
                change: updatedSelected.change,
                changePercent: updatedSelected.changePercent,
              } : null);
            }
          }
        }
      } catch (error) {
        console.error("Update error:", error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [stocks, selectedStock]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const removeStock = (symbol: string) => {
    setStocks(prev => prev.filter(s => s.symbol !== symbol));
    if (selectedStock?.symbol === symbol) {
      setSelectedStock(stocks.find(s => s.symbol !== symbol) || null);
    }
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
              Search any NSE/BSE stock • Real-time prices from Yahoo Finance
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
                      {stocks.length} stocks • Live Data
                    </span>
                  </div>
                  
                  <div className="relative" ref={searchRef}>
                    <input
                      type="text"
                      placeholder="Search any stock (e.g., TATASTEEL, WIPRO, HDFC)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    <AnimatePresence>
                      {showSearchDropdown && searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a24] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
                        >
                          {searchResults.map((result) => (
                            <button
                              key={result.symbol}
                              onClick={() => addStockFromSearch(result)}
                              disabled={loadingSymbol === result.symbol}
                              className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-all text-left disabled:opacity-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400/20 to-orange-600/20 flex items-center justify-center">
                                  <span className="text-orange-400 font-bold text-[10px]">
                                    {result.symbol.slice(0, 3)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-white text-sm">{result.symbol}</p>
                                  <p className="text-gray-500 text-xs truncate max-w-[200px]">{result.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400">
                                  {result.exchange}
                                </span>
                                {loadingSymbol === result.symbol ? (
                                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="text-xs text-gray-500">
                    Type any stock symbol or company name to search and add to watchlist
                  </p>
                </div>
                
                  {viewMode === "browse" ? (
                    <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                      {allStocks.map((stock, i) => (
                        <div
                          key={`${stock.symbol}-${i}`}
                          className="p-3 flex items-center justify-between hover:bg-white/5 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                              <span className="text-gray-400 font-bold text-[10px]">{stock.symbol.slice(0, 3)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{stock.symbol}</p>
                              <p className="text-gray-500 text-xs truncate max-w-[200px]">{stock.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 px-2 py-1 bg-white/5 rounded">{stock.exchange}</span>
                            <button
                              onClick={() => addStockFromSearch(stock)}
                              className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs hover:bg-orange-500/20 transition-all"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                      {allStocks.length > 0 && (
                        <div className="p-4 flex justify-between items-center bg-black/20">
                          <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-30"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(totalStocks / 50)}</span>
                          <button 
                            disabled={page * 50 >= totalStocks}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-30"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : isLoading && stocks.length === 0 ? (

                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading live market data...</p>
                  </div>
                ) : stocks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>Search for stocks to add them to your watchlist</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                    <AnimatePresence>
                      {stocks.map((stock, i) => (
                        <motion.div
                          key={stock.symbol}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => setSelectedStock(stock)}
                          className={`p-3 cursor-pointer transition-all hover:bg-white/5 group ${
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
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                stock.source === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-400"
                              }`}>
                                {stock.source === "live" ? "LIVE" : stock.exchange}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 ml-2">
                              <div className="text-right min-w-[100px]">
                                <motion.p
                                  key={stock.price}
                                  initial={{ scale: 1.05 }}
                                  animate={{ scale: 1 }}
                                  className="font-mono font-semibold text-white text-sm"
                                >
                                  ₹{stock.price.toFixed(2)}
                                </motion.p>
                                <p className={`font-mono text-xs ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                  {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStock(stock.symbol);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                              >
                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {isLoading && stocks.length > 0 && (
                  <div className="p-3 border-t border-white/10 flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Loading more stocks...
                  </div>
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
                    {selectedStock.source === "live" && (
                      <span className="px-2 py-1 bg-emerald-500/20 rounded text-xs text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    )}
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
                      {selectedStock.change >= 0 ? "▲" : "▼"} ₹{Math.abs(selectedStock.change).toFixed(2)} ({Math.abs(selectedStock.changePercent).toFixed(2)}%)
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
                      <p className="text-gray-500 text-xs">Exchange</p>
                      <p className="text-white font-medium text-sm">{selectedStock.exchange}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Volume</p>
                      <p className="text-white font-mono text-sm">
                        {selectedStock.volume > 1000000 
                          ? `${(selectedStock.volume / 1000000).toFixed(2)}M`
                          : selectedStock.volume > 1000
                          ? `${(selectedStock.volume / 1000).toFixed(1)}K`
                          : selectedStock.volume}
                      </p>
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
