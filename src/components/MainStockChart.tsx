"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { INDIAN_STOCKS, generateRealisticStockData, generateLivePrice, TimeSeriesData } from "@/lib/stockApi";

const selectedStock = INDIAN_STOCKS[0];

export function MainStockChart() {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(selectedStock.basePrice);
  const [openPrice] = useState(selectedStock.basePrice);
  const [priceChange, setPriceChange] = useState(0);
  const [selectedStockIndex, setSelectedStockIndex] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const stock = INDIAN_STOCKS[selectedStockIndex];
    const initialData = generateRealisticStockData(stock.basePrice, 60);
    setData(initialData);
    const lastPrice = initialData[initialData.length - 1]?.close || stock.basePrice;
    setCurrentPrice(lastPrice);
    setPriceChange(((lastPrice - stock.basePrice) / stock.basePrice) * 100);
  }, [selectedStockIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.length === 0) return prev;
        const lastPrice = prev[prev.length - 1].close;
        const newPrice = generateLivePrice(lastPrice);
        
        setCurrentPrice(newPrice);
        setPriceChange(((newPrice - openPrice) / openPrice) * 100);

        const now = new Date();
        const newPoint: TimeSeriesData = {
          timestamp: now.toISOString(),
          open: lastPrice,
          high: Math.max(lastPrice, newPrice),
          low: Math.min(lastPrice, newPrice),
          close: newPrice,
          volume: Math.floor(Math.random() * 1000000) + 100000,
        };

        return [...prev.slice(-59), newPoint];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [openPrice]);

  const width = 800;
  const height = 300;
  const padding = 40;

  const prices = data.map(d => d.close);
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.998 : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.002 : 100;

  const getX = (index: number) => padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
  const getY = (price: number) => {
    if (maxPrice === minPrice) return height / 2;
    return height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - padding * 2);
  };

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.close)}`)
    .join(" ");

  const areaPath = data.length > 0
    ? `${linePath} L ${getX(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`
    : "";

  const isPositive = priceChange >= 0;
  const mainColor = isPositive ? "#00ff88" : "#ff4444";
  const stock = INDIAN_STOCKS[selectedStockIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {INDIAN_STOCKS.slice(0, 6).map((s, i) => (
            <button
              key={s.symbol}
              onClick={() => setSelectedStockIndex(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                i === selectedStockIndex
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {s.symbol.replace(".BSE", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">{stock.symbol.replace(".BSE", "").slice(0, 3)}</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">{stock.name}</h2>
              <p className="text-gray-500 text-sm">{stock.symbol} • NSE/BSE</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <motion.div
            key={currentPrice}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-white font-mono"
          >
            ₹{currentPrice.toFixed(2)}
          </motion.div>
          <div className={`flex items-center justify-end gap-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            <span>{isPositive ? "▲" : "▼"}</span>
            <span className="font-mono">{Math.abs(priceChange).toFixed(2)}%</span>
            <span className="text-gray-500 text-sm ml-2">
              ({isPositive ? "+" : ""}₹{((currentPrice - openPrice)).toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={mainColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={mainColor} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={mainColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={mainColor} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0.25, 0.5, 0.75].map(ratio => (
          <line
            key={ratio}
            x1={padding}
            y1={padding + ratio * (height - padding * 2)}
            x2={width - padding}
            y2={padding + ratio * (height - padding * 2)}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
        ))}

        {data.length > 0 && (
          <>
            <motion.path
              d={areaPath}
              fill="url(#areaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />

            <motion.path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />

            <motion.circle
              cx={getX(data.length - 1)}
              cy={getY(data[data.length - 1].close)}
              r="6"
              fill={mainColor}
              filter="url(#glow)"
              animate={{
                r: [6, 10, 6],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}

        {prices.length > 0 && [minPrice, (minPrice + maxPrice) / 2, maxPrice].map((price, i) => (
          <text
            key={i}
            x={padding - 8}
            y={getY(price)}
            fill="rgba(255,255,255,0.4)"
            fontSize="11"
            textAnchor="end"
            dominantBaseline="middle"
            fontFamily="monospace"
          >
            ₹{price.toFixed(0)}
          </text>
        ))}
      </svg>

      <div className="flex justify-between mt-4 px-2">
        {["1M", "5M", "15M", "1H", "1D", "1W"].map((tf, i) => (
          <button
            key={tf}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              i === 2
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/10">
        <div>
          <p className="text-gray-500 text-xs uppercase">Open</p>
          <p className="text-white font-mono">₹{openPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase">High</p>
          <p className="text-emerald-400 font-mono">₹{(maxPrice).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase">Low</p>
          <p className="text-red-400 font-mono">₹{(minPrice).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase">Volume</p>
          <p className="text-white font-mono">{(Math.random() * 10 + 5).toFixed(2)}M</p>
        </div>
      </div>
    </motion.div>
  );
}
