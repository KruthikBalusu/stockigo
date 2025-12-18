"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface DataPoint {
  time: number;
  price: number;
  volume: number;
}

export function MainStockChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(245.67);
  const [priceChange, setPriceChange] = useState(3.42);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const initial: DataPoint[] = [];
    let price = 230;
    for (let i = 0; i < 60; i++) {
      price += (Math.random() - 0.48) * 3;
      price = Math.max(200, Math.min(280, price));
      initial.push({
        time: Date.now() - (60 - i) * 1000,
        price,
        volume: Math.random() * 100 + 20,
      });
    }
    setData(initial);
    setCurrentPrice(price);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : 245;
        const change = (Math.random() - 0.48) * 2;
        const newPrice = Math.max(200, Math.min(280, lastPrice + change));
        
        setCurrentPrice(newPrice);
        setPriceChange(prev => {
          const newChange = prev + change * 0.1;
          return Math.max(-10, Math.min(10, newChange));
        });

        const newData = [
          ...prev.slice(-59),
          {
            time: Date.now(),
            price: newPrice,
            volume: Math.random() * 100 + 20,
          },
        ];
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const width = 800;
  const height = 300;
  const padding = 40;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices, 200);
  const maxPrice = Math.max(...prices, 280);

  const getX = (index: number) => padding + (index / (data.length - 1)) * (width - padding * 2);
  const getY = (price: number) =>
    height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - padding * 2);

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.price)}`)
    .join(" ");

  const areaPath = `${linePath} L ${getX(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;

  const isPositive = priceChange >= 0;
  const mainColor = isPositive ? "#00ff88" : "#ff4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-black font-bold text-sm">AI</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">AI Market Index</h2>
              <p className="text-gray-500 text-sm">AIMDX</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <motion.div
            key={currentPrice}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-white font-mono"
          >
            ${currentPrice.toFixed(2)}
          </motion.div>
          <div className={`flex items-center justify-end gap-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            <span>{isPositive ? "▲" : "▼"}</span>
            <span className="font-mono">{Math.abs(priceChange).toFixed(2)}%</span>
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

        {data.length > 0 && (
          <motion.circle
            cx={getX(data.length - 1)}
            cy={getY(data[data.length - 1].price)}
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
        )}

        {[minPrice, (minPrice + maxPrice) / 2, maxPrice].map((price, i) => (
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
            ${price.toFixed(0)}
          </text>
        ))}
      </svg>

      <div className="flex justify-between mt-4 px-2">
        {["1M", "5M", "15M", "1H", "4H", "1D"].map((tf, i) => (
          <button
            key={tf}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              i === 2
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
