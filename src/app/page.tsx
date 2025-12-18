'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StockGraph3D } from "@/components/StockGraph3D";
import { GridBackground } from "@/components/GridBackground";
import { FloatingNumbers } from "@/components/FloatingNumbers";
import { LiveStockTicker } from "@/components/LiveStockTicker";
import { MainStockChart } from "@/components/MainStockChart";

export default function Home() {
  const [stats, setStats] = useState([
    { label: "NIFTY 50", value: "Loading...", change: "+0.00%", up: true },
    { label: "SENSEX", value: "Loading...", change: "+0.00%", up: true },
    { label: "NIFTY Bank", value: "Loading...", change: "+0.00%", up: true },
    { label: "Market Cap", value: "₹385T", change: "+1.2%", up: true },
  ]);
  const [stock, setStock] = useState('');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const userId = 1; // Replace with actual user ID from session

  useEffect(() => {
    async function fetchIndices() {
      try {
        const response = await fetch("/api/stocks/quote?symbols=^NSEI,^BSESN,^NSEBANK");
        const data = await response.json();
        if (data.success && data.data) {
          const nifty = data.data.find((d: any) => d.symbol === "^NSEI");
          const sensex = data.data.find((d: any) => d.symbol === "^BSESN");
          const bank = data.data.find((d: any) => d.symbol === "^NSEBANK");

          setStats([
            { 
              label: "NIFTY 50", 
              value: nifty ? `₹${nifty.price.toLocaleString()}` : "₹22,420", 
              change: nifty ? `${nifty.changePercent >= 0 ? "+" : ""}${nifty.changePercent.toFixed(2)}%` : "+0.82%",
              up: nifty ? nifty.changePercent >= 0 : true
            },
            { 
              label: "SENSEX", 
              value: sensex ? `₹${sensex.price.toLocaleString()}` : "₹73,850", 
              change: sensex ? `${sensex.changePercent >= 0 ? "+" : ""}${sensex.changePercent.toFixed(2)}%` : "+0.67%",
              up: sensex ? sensex.changePercent >= 0 : true
            },
            { 
              label: "NIFTY Bank", 
              value: bank ? `₹${bank.price.toLocaleString()}` : "₹47,320", 
              change: bank ? `${bank.changePercent >= 0 ? "+" : ""}${bank.changePercent.toFixed(2)}%` : "-0.24%",
              up: bank ? bank.changePercent >= 0 : false
            },
            { label: "Market Cap", value: "₹385T", change: "+1.2%", up: true },
          ]);
        }
      } catch (error) {
        console.error("Error fetching indices:", error);
      }
    }
    fetchIndices();
    getPortfolio();
    const interval = setInterval(fetchIndices, 30000);
    return () => clearInterval(interval);
  }, []);

  const addStock = async (stockSymbol: string) => {
    const response = await fetch('/api/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, stock: stockSymbol }),
    });
    const data = await response.json();
    console.log(data);
    setStock('');
    setSearchResults([]);
    getPortfolio();
  };

  const getPortfolio = async () => {
    const response = await fetch(`/api/portfolio?userId=${userId}`);
    const data = await response.json();
    setPortfolio(data.portfolio);
    setPortfolioValue(data.portfolioValue);
  };

  const searchStocks = async (query: string) => {
    setStock(query);
    if (query.length > 1) {
      setIsSearching(true);
      const response = await fetch(`/api/stocks/search?q=${query}`);
      const data = await response.json();
      if(data.success) {
        setSearchResults(data.data);
      }
      setIsSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden font-sans">
      <StockGraph3D />
      <GridBackground />
      <FloatingNumbers />
      <LiveStockTicker />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6"
            animate={{ boxShadow: ["0 0 20px rgba(255,136,0,0.1)", "0 0 40px rgba(255,136,0,0.2)", "0 0 20px rgba(255,136,0,0.1)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400 text-sm font-medium">NSE • BSE Live</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Stockigo
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Your AI-powered stock portfolio tracker.
          </p>
        </motion.div>

        <div className="w-full max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a stock..."
              value={stock}
              onChange={(e) => searchStocks(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {isSearching && <div className="absolute right-3 top-3 w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>}
          </div>
          {searchResults.length > 0 && (
            <ul className="bg-white/10 border border-white/20 rounded-lg mt-2 max-h-60 overflow-y-auto">
              {searchResults.map((s) => (
                <li key={s.symbol} 
                  className="px-4 py-2 hover:bg-white/20 cursor-pointer flex justify-between items-center"
                  onClick={() => addStock(s.symbol)} >
                    <span>{s.symbol}</span>
                    <span className="text-gray-400 text-sm">{s.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {portfolio && (
          <div className="w-full max-w-4xl mt-10">
            <h2 className="text-2xl font-bold text-center mb-4">Your Portfolio</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Total Value: <span className="text-orange-400 font-mono">${portfolioValue.toLocaleString()}</span></h3>
                <a href="/portfolio" className="px-6 py-2 bg-orange-500/80 rounded-lg font-semibold text-white hover:bg-orange-500 transition-colors">View Details</a>
              </div>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {portfolio.stocks.map((s: string) => (
                  <li key={s} className="bg-white/10 p-3 rounded-lg text-center font-mono">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl">
          <MainStockChart />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 w-full max-w-4xl"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-orange-500/30 transition-all hover:bg-white/10"
            >
              <p className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</p>
              <p className="text-white text-xl font-bold font-mono mt-1">{stat.value}</p>
              <p className={`text-sm font-mono ${stat.up ? "text-emerald-400" : "text-red-400"}`}>{stat.change}</p>
            </motion.div>
          ))}
        </motion.div>

      </main>
    </div>
  );
}
