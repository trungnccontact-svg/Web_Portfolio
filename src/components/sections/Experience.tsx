"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Briefcase, Calendar } from "lucide-react";

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
    <section id="experience" className="py-20 sm:py-28 px-4 bg-surface/50">
      <div className="max-w-4xl mx-auto">
        <AnimateOnScroll>
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center">
            <span className="gradient-text">{t("title")}</span>
          </h2>
        </AnimateOnScroll>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[20px] md:left-1/2 md:-translate-x-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary to-accent" />

          {jobs.map((job, index) => (
            <AnimateOnScroll
              key={index}
              delay={index * 0.15}
              direction={index % 2 === 0 ? "left" : "right"}
            >
              <div
                className={`relative flex flex-col md:flex-row gap-4 mb-12 ${
                  index % 2 === 0
                    ? "md:flex-row"
                    : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-[13px] md:left-1/2 md:-translate-x-[8px] top-6 w-4 h-4 rounded-full bg-primary border-[3px] border-background z-10">
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                </div>

                {/* Content card */}
                <div
                  className={`ml-12 md:ml-0 md:w-[calc(50%-32px)] ${
                    index % 2 === 0 ? "md:pr-8" : "md:pl-8"
                  }`}
                >
                  <motion.div
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="p-6 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Briefcase size={18} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {job.company}
                        </h3>
                        <p className="text-sm text-muted">{job.fullName}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted">
                      <span className="font-medium text-primary">
                        {job.role}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {job.period}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {job.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted leading-relaxed flex gap-2"
                        >
                          <span className="text-primary mt-1.5 shrink-0">
                            ▹
                          </span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
