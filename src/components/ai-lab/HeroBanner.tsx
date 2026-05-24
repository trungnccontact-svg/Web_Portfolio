'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Activity, Terminal } from 'lucide-react';

interface HeroBannerProps {
  onScrollToSection: (sectionId: string) => void;
}

export default function HeroBanner({ onScrollToSection }: HeroBannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Particle[] = [];
    const maxParticles = 65;
    const connectionDist = 120;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'rgba(99, 102, 241, 0.45)';
        c.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const drawConnections = (c: CanvasRenderingContext2D) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;
            c.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            c.lineWidth = 0.8;
            c.beginPath();
            c.moveTo(particles[i].x, particles[i].y);
            c.lineTo(particles[j].x, particles[j].y);
            c.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      drawConnections(ctx);
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-[480px] w-full flex items-center justify-center bg-gray-950 text-white overflow-hidden py-16 px-6 border-b border-gray-800">
      {/* Background Neural Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />

      {/* Decorative Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 select-none">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
          <Activity className="w-3.5 h-3.5" />
          Interactive Labs
        </div>

        {/* Hero Title */}
        <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          AI Engineering Playground
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-sans">
          An interactive, self-improving sandbox demonstrating **RAG architectures**, **ReAct Autonomous Agents**, **Self-Improve Loops**, and live **Evaluation Dashboards** in real time.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onScrollToSection('self-improve')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-5 h-5 text-indigo-200" />
            Try Self-Improve Loop
            <ArrowRight className="w-4 h-4 text-indigo-200" />
          </button>

          <button
            onClick={() => onScrollToSection('rag-chat')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-medium hover:border-gray-700 transition-all"
          >
            <Terminal className="w-5 h-5 text-indigo-400" />
            Open RAG Chat
          </button>

          <button
            onClick={() => onScrollToSection('architecture')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white font-medium transition-all"
          >
            View Architecture
          </button>
        </div>
      </div>
    </div>
  );
}
