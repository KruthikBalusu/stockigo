"use client";

import { motion } from "framer-motion";
import { StockGraph3D } from "@/components/StockGraph3D";
import { GridBackground } from "@/components/GridBackground";
import { FloatingNumbers } from "@/components/FloatingNumbers";
import { LiveStockTicker } from "@/components/LiveStockTicker";
import { MainStockChart } from "@/components/MainStockChart";

export default function Home() {
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
            animate={{ boxShadow: ["0 0 20px rgba(0,255,136,0.1)", "0 0 40px rgba(0,255,136,0.2)", "0 0 20px rgba(0,255,136,0.1)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Live Market Data</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
              AI Stock
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Market
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Real-time AI-powered market analysis and predictions
          </p>
        </motion.div>

        <div className="w-full max-w-4xl">
          <MainStockChart />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 w-full max-w-4xl"
        >
          {[
            { label: "Market Cap", value: "$2.4T", change: "+5.2%" },
            { label: "24h Volume", value: "$847B", change: "+12.8%" },
            { label: "Active Traders", value: "2.1M", change: "+3.4%" },
            { label: "AI Signals", value: "1,247", change: "+89" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all hover:bg-white/10"
            >
              <p className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</p>
              <p className="text-white text-xl font-bold font-mono mt-1">{stat.value}</p>
              <p className="text-emerald-400 text-sm font-mono">{stat.change}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 flex gap-4"
        >
          <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-black hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25">
            Start Trading
          </button>
          <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-all">
            View Analysis
          </button>
        </motion.div>
      </main>
    </div>
  );
}
