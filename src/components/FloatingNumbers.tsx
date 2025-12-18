"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingNumber {
  id: number;
  value: string;
  x: number;
  y: number;
  isPositive: boolean;
}

const stockSymbols = ["RELIANCE", "TCS", "HDFC", "INFY", "ICICI", "SBIN", "ITC", "LT", "AXIS"];

export function FloatingNumbers() {
  const [numbers, setNumbers] = useState<FloatingNumber[]>([]);

  useEffect(() => {
    let id = 0;
    const interval = setInterval(() => {
      const isPositive = Math.random() > 0.45;
      const value = (Math.random() * 5).toFixed(2);
      const showSymbol = Math.random() > 0.6;
      const symbol = stockSymbols[Math.floor(Math.random() * stockSymbols.length)];
      
      setNumbers(prev => [
        ...prev.slice(-15),
        {
          id: id++,
          value: showSymbol ? symbol : `${isPositive ? "+" : "-"}₹${(Math.random() * 50).toFixed(0)}`,
          x: Math.random() * 90 + 5,
          y: Math.random() * 80 + 10,
          isPositive,
        },
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {numbers.map(num => (
          <motion.div
            key={num.id}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 0.6, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 2 }}
            className={`absolute font-mono text-sm ${
              num.isPositive ? "text-emerald-400" : "text-red-400"
            }`}
            style={{ left: `${num.x}%`, top: `${num.y}%` }}
          >
            {num.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
