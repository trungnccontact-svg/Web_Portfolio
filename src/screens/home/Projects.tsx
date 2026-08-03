"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ExternalLink, Smartphone, Globe, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/common/animated-section";

interface ProjectItem {
  name: string;
  subtitle: string;
  role: string;
  period: string;
  teamSize: string;
  stack: string[];
  liveUrl?: string;
  appStoreUser?: string;
  appStoreBusiness?: string;
  bullets: string[];
  image?: string;
}

function ProjectCard({
  project,
  large = false,
}: {
  project: ProjectItem;
  large?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl glass-card border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer ${
        large ? "bento-item-large" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-muted/30 ${
          large ? "aspect-[16/7] min-h-[200px]" : "aspect-video min-h-[160px]"
        }`}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-heading font-bold text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500">
              {project.name[0]}
            </div>
          </div>
        )}
        {/* Gradient overlay — always present */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />

        {/* Stack badges on hover */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[60%] justify-end">
          {project.stack.slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px] glass-card border-none shadow-sm">
              {s}
            </Badge>
          ))}
        </div>

        {/* Links on hover */}
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 rounded-full glass-card border-border/50 flex items-center justify-center hover:border-primary/60 hover:text-primary transition-colors"
            >
              <Globe size={14} />
            </a>
          )}
          {project.appStoreUser && (
            <a
              href={project.appStoreUser}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 rounded-full glass-card border-border/50 flex items-center justify-center hover:border-primary/60 hover:text-primary transition-colors"
            >
              <Smartphone size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-lg leading-tight group-hover:text-primary transition-colors duration-300">
              {project.name}
            </h3>
            <p className="text-xs text-primary/80 font-medium mt-0.5">{project.subtitle}</p>
          </div>
          <ArrowUpRight
            size={18}
            className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0 mt-0.5"
          />
        </div>

        <p className="text-xs text-muted-foreground italic">
          {project.role} · {project.period}
        </p>

        <ul className="space-y-1 pt-2 border-t border-border/40">
          {project.bullets.slice(0, large ? 3 : 2).map((bullet, i) => (
            <li key={i} className="text-xs text-muted-foreground flex gap-2 leading-relaxed">
              <span className="text-primary shrink-0 mt-0.5">▹</span>
              <span className="line-clamp-2">{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Footer tech stack */}
        <div className="flex flex-wrap gap-1 pt-1">
          {project.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground bg-muted/30"
            >
              {tech}
            </span>
          ))}
          {project.stack.length > 3 && (
            <span className="text-[10px] text-muted-foreground px-1 self-center">
              +{project.stack.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const t = useTranslations("projects");
  const items = t.raw("items") as ProjectItem[];

  return (
    <section id="projects" className="relative py-24 overflow-hidden">
      <div className="container max-w-6xl mx-auto px-4">
        <AnimatedSection className="flex flex-col items-center space-y-16">
          {/* Section heading */}
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Portfolio
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          </div>

          {/* Bento grid */}
          <motion.div
            className="bento-grid w-full"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {items.map((project, index) => (
              <motion.div
                key={index}
                className="h-full"
                variants={{
                  hidden: { opacity: 0, y: 32, scale: 0.97 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
                  },
                }}
              >
                <ProjectCard project={project} large={index === 0} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
