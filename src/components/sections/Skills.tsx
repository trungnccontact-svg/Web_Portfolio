"use client";

import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/common/animated-section";
import { Chip } from "@/components/ui/chip";

interface SkillCategory {
  label: string;
  items: string[];
}

export default function Skills() {
  const t = useTranslations("skills");
  const categories = t.raw("categories") as Record<string, SkillCategory>;

  return (
    <section id="skills" className="py-20">
      <div className="container max-w-5xl mx-auto px-4">
        <AnimatedSection className="flex flex-col items-center space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {Object.entries(categories).map(([key, category], index) => (
              <div key={key} className="space-y-4 p-6 rounded-xl border border-border bg-card/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                <h3 className="font-heading text-lg font-bold text-primary border-b pb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {category.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill, i) => (
                    <Chip key={i} text={skill} variant="secondary" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
