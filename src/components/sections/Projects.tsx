"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ExternalLink, Smartphone, Globe } from "lucide-react";
import { AnimatedSection } from "@/components/common/animated-section";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden border border-border bg-card transition-all hover:shadow-lg hover:border-primary/20 group">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden bg-muted flex items-center justify-center">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-muted-foreground/20 italic font-heading text-xl group-hover:scale-110 transition-transform duration-500">
              {project.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
             <div className="flex gap-2">
               {project.stack.slice(0, 3).map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
             </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col space-y-3">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">{project.name}</CardTitle>
          <p className="text-sm text-primary font-medium">{project.subtitle}</p>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          {project.role} • {project.period}
        </p>

        <ul className="space-y-1.5 pt-2 border-t">
          {project.bullets.slice(0, 2).map((bullet, i) => (
            <li key={i} className="text-xs text-muted-foreground flex gap-2">
              <span className="text-primary shrink-0 mt-0.5">▹</span>
              <span className="line-clamp-2">{bullet}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex justify-between items-center">
        <div className="flex flex-wrap gap-1">
          {project.stack.slice(0, 2).map((tech) => (
            <Badge key={tech} variant="outline" className="text-[10px] px-1.5 py-0">
              {tech}
            </Badge>
          ))}
          {project.stack.length > 2 && <span className="text-[10px] text-muted-foreground">+{project.stack.length - 2}</span>}
        </div>
        
        <div className="flex gap-1">
          {project.liveUrl && (
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
              </a>
            </Button>
          )}
          {project.appStoreUser && (
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <a href={project.appStoreUser} target="_blank" rel="noopener noreferrer">
                <Smartphone className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function Projects() {
  const t = useTranslations("projects");
  const items = t.raw("items") as ProjectItem[];

  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <AnimatedSection className="flex flex-col items-center space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {items.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
