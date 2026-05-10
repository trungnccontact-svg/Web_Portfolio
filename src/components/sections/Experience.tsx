"use client";

import { useTranslations } from "next-intl";
import { Briefcase, Calendar } from "lucide-react";
import { AnimatedSection } from "@/components/common/animated-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


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
    <section id="experience" className="py-20">
      <div className="container max-w-5xl mx-auto px-4">
        <AnimatedSection className="flex flex-col items-center space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="relative w-full space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {jobs.map((job, index) => (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Briefcase size={16} className="text-primary" />
                </div>
                
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-lg">{job.company}</h3>
                      <time className="font-heading text-xs font-medium text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                        {job.period}
                      </time>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary uppercase tracking-wider">{job.role}</span>
                      <span className="text-xs text-muted-foreground">{job.fullName}</span>
                    </div>

                    <ul className="space-y-2 pt-2 border-t">
                      {job.bullets.map((bullet, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2 leading-relaxed">
                          <span className="text-primary shrink-0 mt-1">▹</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
