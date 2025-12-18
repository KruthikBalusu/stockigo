"use client";

import { useEffect, useRef } from "react";

export function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let offset = 0;
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      ctx.clearRect(0, 0, w, h);

      const gridSize = 60;
      const perspective = 0.003;
      
      ctx.strokeStyle = "rgba(0, 255, 136, 0.06)";
      ctx.lineWidth = 1;

      for (let y = 0; y < h + gridSize; y += gridSize) {
        const yOffset = (y + offset) % (h + gridSize);
        const scale = 1 + yOffset * perspective;
        const alpha = Math.min(0.15, yOffset / h * 0.15);
        
        ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, yOffset);
        ctx.lineTo(w, yOffset);
        ctx.stroke();
      }

      for (let x = 0; x < w; x += gridSize) {
        const xCenter = w / 2;
        const distFromCenter = (x - xCenter) / xCenter;
        const alpha = 0.08 - Math.abs(distFromCenter) * 0.05;
        
        ctx.strokeStyle = `rgba(0, 200, 255, ${Math.max(0.02, alpha)})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + distFromCenter * 100, h);
        ctx.stroke();
      }

      offset = (offset + 0.3) % gridSize;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full opacity-60" />;
}
