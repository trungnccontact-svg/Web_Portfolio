"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/common/animated-section";

interface SkillCategory {
  label: string;
  items: string[];
}

// Marquee row of skill chips
function SkillMarquee({
  items,
  reverse = false,
  color = "primary",
}: {
  items: string[];
  reverse?: boolean;
  color?: string;
}) {
  // Repeat until we have at least 8 copies so short lists fill the viewport
  const minCopies = Math.ceil(8 / items.length);
  const repeated = Array.from({ length: minCopies * 2 }, () => items).flat();
  return (
    <div className="overflow-hidden w-full py-1.5 relative group">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className={`flex gap-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {repeated.map((item, i) => (
          <span
            key={i}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border border-border/50 glass-card hover:border-primary/50 hover:text-primary hover:scale-105 transition-all duration-200 cursor-default whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const t = useTranslations("skills");
  const categories = t.raw("categories") as Record<string, SkillCategory>;

  const allCategories = Object.values(categories);

  // Flatten categories into rows for the marquee
  // Row 1: items from category 0
  // Row 2: items from category 1 (reversed)
  // Row 3: items from category 2
  // etc.

  return (
    <section id="skills" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-muted/20" />

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <AnimatedSection className="flex flex-col items-center space-y-16">
          {/* Section heading */}
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Tech Stack
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          </div>

          {/* Category grid — category label + marquee */}
          <div className="w-full space-y-10">
            {allCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                {/* Category label */}
                <div className="flex items-center gap-3 px-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    {category.label}
                  </h3>
                  <div className="flex-1 h-px bg-border/40" />
                </div>

                {/* Marquee row */}
                <SkillMarquee items={category.items} reverse={index % 2 !== 0} />
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
