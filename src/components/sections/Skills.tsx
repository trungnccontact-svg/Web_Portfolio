"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import {
  Monitor,
  Server,
  Database,
  Code,
  Wrench,
  Lightbulb,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  frontend: <Monitor size={20} />,
  backend: <Server size={20} />,
  database: <Database size={20} />,
  languages: <Code size={20} />,
  tools: <Wrench size={20} />,
  practices: <Lightbulb size={20} />,
};

export default function Skills() {
  const t = useTranslations("skills");
  const categories = t.raw("categories") as Record<
    string,
    { label: string; items: string[] }
  >;

  const categoryKeys = Object.keys(categories);

  return (
    <section id="skills" className="py-20 sm:py-28 px-4 bg-surface/50">
      <div className="max-w-4xl mx-auto">
        <AnimateOnScroll>
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center">
            <span className="gradient-text">{t("title")}</span>
          </h2>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryKeys.map((key, catIndex) => {
            const category = categories[key];
            return (
              <AnimateOnScroll key={key} delay={catIndex * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      {categoryIcons[key] || <Code size={20} />}
                    </div>
                    <h3 className="text-lg font-semibold">{category.label}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {category.items.map((skill, skillIndex) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: catIndex * 0.05 + skillIndex * 0.05,
                          type: "spring",
                          stiffness: 300,
                        }}
                        whileHover={{ scale: 1.1 }}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary/5 text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-default border border-transparent hover:border-primary/20"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
