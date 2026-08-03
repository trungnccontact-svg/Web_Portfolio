"use client";

import { useTranslations } from "next-intl";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/common/animated-section";

interface Job {
  company: string;
  fullName: string;
  role: string;
  period: string;
  bullets: string[];
}

export default function Experience() {
  const t = useTranslations("experience");
  const jobs = t.raw("jobs") as Job[];

  return (
    <section id="experience" className="relative py-24 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-muted/20" />
      </div>

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        <AnimatedSection className="flex flex-col items-center space-y-16">
          {/* Section heading */}
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Career Path
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          </div>

          {/* Timeline */}
          <div className="relative w-full">
            {/* Central shimmer line */}
            <div className="absolute left-5 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px timeline-line" />

            <div className="space-y-10">
              {jobs.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    index % 2 === 0
                      ? "md:flex-row"
                      : "md:flex-row-reverse"
                  }`}
                >
                  {/* Desktop spacer */}
                  <div className="hidden md:block md:w-[calc(50%-1.25rem)]" />

                  {/* Icon node */}
                  <div className="relative flex-shrink-0 z-10">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/40 bg-background shadow-lg animate-pulse-glow">
                      <Briefcase size={15} className="text-primary" />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`w-full md:w-[calc(50%-1.25rem)] glass-card rounded-2xl p-5 border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-lg ${
                      index % 2 === 0 ? "md:ml-5" : "md:mr-5 md:text-right"
                    }`}
                  >
                    <div className={`flex flex-col gap-3 ${index % 2 !== 0 ? "md:items-end" : ""}`}>
                      {/* Header */}
                      <div className={`flex items-center gap-3 flex-wrap ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
                        <h3 className="font-heading font-bold text-lg leading-tight">
                          {job.company}
                        </h3>
                        <span className="font-heading text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/40">
                          {job.period}
                        </span>
                      </div>

                      {/* Role */}
                      <div className={`flex flex-col ${index % 2 !== 0 ? "md:items-end" : ""}`}>
                        <span className="text-sm font-bold text-primary uppercase tracking-wider">
                          {job.role}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">{job.fullName}</span>
                      </div>

                      {/* Bullets */}
                      <ul className={`space-y-1.5 pt-3 border-t border-border/40 ${index % 2 !== 0 ? "md:items-end" : ""}`}>
                        {job.bullets.map((bullet, i) => (
                          <li
                            key={i}
                            className={`text-sm text-muted-foreground flex gap-2 leading-relaxed ${
                              index % 2 !== 0 ? "md:flex-row-reverse" : ""
                            }`}
                          >
                            <span className="text-primary shrink-0 mt-0.5">▹</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
