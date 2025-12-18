"use client";

import { useEffect, useRef, useState } from "react";

function generateStockData(length: number, basePrice: number = 150): number[] {
  const data: number[] = [];
  let price = basePrice;
  for (let i = 0; i < length; i++) {
    const change = (Math.random() - 0.48) * 4;
    price = Math.max(50, Math.min(300, price + change));
    data.push(price);
  }
  return data;
}

export function StockGraph3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stockData, setStockData] = useState<number[]>(() => generateStockData(200));
  const offsetRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
      ctx.fillRect(0, 0, w, h);

      const layers = [
        { depth: 0.3, color: "rgba(0, 255, 136, 0.08)", yOffset: h * 0.7 },
        { depth: 0.5, color: "rgba(0, 200, 255, 0.12)", yOffset: h * 0.55 },
        { depth: 0.7, color: "rgba(255, 100, 100, 0.15)", yOffset: h * 0.4 },
        { depth: 1.0, color: "rgba(0, 255, 136, 0.25)", yOffset: h * 0.5 },
      ];

      layers.forEach((layer, layerIndex) => {
        const dataOffset = Math.floor(offsetRef.current * layer.depth);
        const scaleX = w / 80;
        const scaleY = h / 400 * layer.depth;

        ctx.beginPath();
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1 + layer.depth * 2;

        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.5, layer.color);
        gradient.addColorStop(1, "transparent");

        for (let i = 0; i < 100; i++) {
          const dataIndex = (i + dataOffset + layerIndex * 50) % stockData.length;
          const x = i * scaleX - (offsetRef.current * layer.depth * 2) % scaleX;
          const y = layer.yOffset - (stockData[dataIndex] - 150) * scaleY;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < 100; i++) {
          const dataIndex = (i + dataOffset + layerIndex * 50) % stockData.length;
          const x = i * scaleX - (offsetRef.current * layer.depth * 2) % scaleX;
          const y = layer.yOffset - (stockData[dataIndex] - 150) * scaleY;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.lineTo(w + 50, h);
        ctx.lineTo(-50, h);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      offsetRef.current += 0.5;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [stockData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStockData(prev => {
        const newData = [...prev];
        const lastPrice = newData[newData.length - 1];
        const change = (Math.random() - 0.48) * 4;
        const newPrice = Math.max(50, Math.min(300, lastPrice + change));
        newData.push(newPrice);
        newData.shift();
        return newData;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0f0a 100%)" }}
    />
  );
}
