"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Download, Mail, ChevronDown } from "lucide-react";
import { MasonryScrollGrid } from "@/components/common/MasonryScrollGrid";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  const t = useTranslations("hero");
  const roles = t.raw("roles") as string[];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const currentRole = roles[currentRoleIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentRole) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    } else if (isDeleting) {
      timeout = setTimeout(
        () => setDisplayText((prev) => prev.slice(0, -1)),
        35
      );
    } else {
      timeout = setTimeout(
        () => setDisplayText(currentRole.slice(0, displayText.length + 1)),
        75
      );
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentRoleIndex, roles]);

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* ── MASONRY BACKGROUND ─────────────────────────── */}
      {/* <MasonryScrollGrid /> */}

      {/* ── DARK VIGNETTE OVERLAYS ─────────────────────── */}
      {/* Left & right gradient fades */}
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
      {/* Top & bottom */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      {/* Radial center darkening so text stays readable */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 50% 50%, transparent 0%, hsl(var(--background) / 0.6) 100%)",
        }}
      />

      {/* ── HERO CONTENT (glassmorphism card) ──────────── */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center text-center px-4 py-16 max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Avatar with glow ring */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative inline-block animate-float">
            {/* Glow behind avatar */}
            <div className="absolute inset-0 rounded-full blur-2xl opacity-40 bg-primary scale-125 animate-pulse-glow" />
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-primary/30 bg-card flex items-center justify-center shadow-2xl glass-card group hover:border-primary/70 transition-all duration-500">
              <Image
                src="/images/avatar.png"
                alt="Nguyen Chi Trung"
                width={112}
                height={112}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Greeting badge */}
        <motion.div variants={itemVariants}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-muted-foreground border border-border/60 glass-card mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            {t("greeting")}
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={itemVariants}
          className="font-heading text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-none mb-4"
        >
          {/* Split name for letter reveal — render as two words if possible */}
          {t("name")}
        </motion.h1>

        {/* Typewriter role */}
        <motion.div
          variants={itemVariants}
          className="text-xl sm:text-2xl font-semibold text-primary h-10 flex items-center justify-center gap-1 mb-6"
        >
          <span>{displayText}</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.85 }}
            className="text-primary"
          >
            |
          </motion.span>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="max-w-[600px] text-base sm:text-lg text-muted-foreground leading-relaxed mb-10"
        >
          {t("description")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-primary/40 active:scale-95"
          >
            <a href="/cv/nguyen-chi-trung.pdf" download>
              <Download className="mr-2 h-4 w-4" />
              {t("downloadCV")}
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 glass-card border-border/60 transition-all duration-300 hover:scale-105 hover:border-primary/50 active:scale-95"
          >
            <a href="#contact">
              <Mail className="mr-2 h-4 w-4" />
              {t("contactMe")}
            </a>
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex items-center gap-8 sm:gap-12 text-center"
        >
          {[
            { value: "3+", label: "Years Exp." },
            { value: "10+", label: "Projects" },
            { value: "5+", label: "Companies" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── SCROLL INDICATOR ───────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-muted-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
