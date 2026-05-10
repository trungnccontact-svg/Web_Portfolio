"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Download, Mail, User } from "lucide-react";
import { AnimatedSection } from "@/components/common/animated-section";
import { AnimatedText } from "@/components/common/animated-text";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const t = useTranslations("hero");
  const roles = t.raw("roles") as string[];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Typewriter effect
  useEffect(() => {
    const currentRole = roles[currentRoleIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentRole) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    } else if (isDeleting) {
      timeout = setTimeout(
        () => setDisplayText((prev) => prev.slice(0, -1)),
        40
      );
    } else {
      timeout = setTimeout(
        () =>
          setDisplayText(currentRole.slice(0, displayText.length + 1)),
        80
      );
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentRoleIndex, roles]);

  // Particle background
  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(var(--primary) / ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsl(var(--primary) / ${0.05 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const cleanup = animateParticles();
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cleanup?.();
      window.removeEventListener("resize", handleResize);
    };
  }, [animateParticles]);

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b">
      <canvas ref={canvasRef} className="particles-canvas opacity-30" />
      
      <AnimatedSection className="container relative z-10 flex flex-col items-center justify-center space-y-8 text-center py-20">
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-border bg-muted flex items-center justify-center shadow-xl">
          <User size={64} className="text-muted-foreground/50" />
        </div>
        
        <div className="space-y-4">
          <AnimatedText as="p" className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {t("greeting")}
          </AnimatedText>
          <AnimatedText as="h1" className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
            {t("name")}
          </AnimatedText>
          <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary h-10 flex items-center justify-center">
            <span>{displayText}</span>
            <motion.span 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="ml-1"
            >
              |
            </motion.span>
          </div>
        </div>

        <AnimatedText as="p" delay={0.2} className="max-w-[700px] text-lg text-muted-foreground sm:text-xl leading-relaxed">
          {t("description")}
        </AnimatedText>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="rounded-full px-8 shadow-lg transition-transform hover:scale-105 active:scale-95">
            <a href="/cv/nguyen-chi-trung.pdf" download>
              <Download className="mr-2 h-4 w-4" />
              {t("downloadCV")}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 transition-transform hover:scale-105 active:scale-95">
            <a href="#contact">
              <Mail className="mr-2 h-4 w-4" />
              {t("contactMe")}
            </a>
          </Button>
        </div>
      </AnimatedSection>
    </section>
  );
}

