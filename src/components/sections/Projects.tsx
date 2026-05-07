"use client";

import { useTranslations } from "next-intl";
import { useRef, MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import {
  ExternalLink,
  Users,
  Calendar,
  Smartphone,
  Globe,
} from "lucide-react";

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
}

function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    rotateX.set((-mouseY / rect.height) * 10);
    rotateY.set((mouseX / rect.width) * 10);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <AnimateOnScroll delay={index * 0.1}>
      <div className="card-3d h-full">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: springX,
            rotateY: springY,
            transformPerspective: 1000,
          }}
          className="card-3d-inner h-full p-6 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors group"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-muted mt-1">{project.subtitle}</p>
            </div>
            {/* Links */}
            <div className="flex gap-2 shrink-0">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-all"
                  aria-label={`Visit ${project.name}`}
                  title="Live Website"
                >
                  <Globe size={18} />
                </a>
              )}
              {project.appStoreUser && (
                <a
                  href={project.appStoreUser}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-all"
                  aria-label={`${project.name} App Store (User)`}
                  title="App Store (User)"
                >
                  <Smartphone size={18} />
                </a>
              )}
              {project.appStoreBusiness && (
                <a
                  href={project.appStoreBusiness}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-all"
                  aria-label={`${project.name} App Store (Business)`}
                  title="App Store (Business)"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs text-muted mb-4">
            <span className="font-medium text-primary">{project.role}</span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {project.period}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {project.teamSize}
            </span>
          </div>

          {/* Bullets */}
          <ul className="space-y-1.5 mb-5">
            {project.bullets.map((bullet, i) => (
              <li
                key={i}
                className="text-sm text-muted leading-relaxed flex gap-2"
              >
                <span className="text-primary mt-1 shrink-0">▹</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          {/* Stack tags */}
          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimateOnScroll>
  );
}

export default function Projects() {
  const t = useTranslations("projects");
  const items = t.raw("items") as ProjectItem[];

  return (
    <section id="projects" className="py-20 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll>
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center">
            <span className="gradient-text">{t("title")}</span>
          </h2>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
