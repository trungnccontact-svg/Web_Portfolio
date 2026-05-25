"use client";

import { Norican } from "next/font/google";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";
import { useLockBody } from "@/hooks/use-lock-body";
import { cn } from "@/lib/utils";
import { CLAUDE_ARTIFACTS } from "@/config/artifacts";
import {
  User,
  FileCheck,
  TrendingUp,
  Cpu,
  Zap,
  Coins,
  ShoppingBag,
  BookOpen,
  Sparkles,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

const artifactIcons = {
  user: User,
  fileCheck: FileCheck,
  trendingUp: TrendingUp,
  cpu: Cpu,
  zap: Zap,
  coins: Coins,
  shoppingBag: ShoppingBag,
  bookOpen: BookOpen,
};

interface MobileNavProps {
  items: { title: string; id: string }[];
  onItemClick: (id: string) => void;
  activeSection?: string;
}

const norican = Norican({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  maxDuration: 30, // nextjs font opt
} as any);

export function MobileNav({ items, onItemClick, activeSection }: MobileNavProps) {
  useLockBody();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const t_artifacts = useTranslations("artifacts");
  const localePrefix = pathname.split('/')[1] || 'en';
  const [showArtifacts, setShowArtifacts] = React.useState(false);

  return (
    <div
      className={cn(
        "fixed inset-0 top-12 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-top-10 md:hidden bg-background/95 backdrop-blur-sm"
      )}
    >
      <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md border border-border">
        <button 
          onClick={() => onItemClick("home")}
          className="flex items-center space-x-2 text-left cursor-pointer"
        >
          <span className={cn(norican.className, "text-2xl")}>
            {siteConfig.authorName}
          </span>
        </button>
        <nav className="grid grid-flow-row auto-rows-max text-sm">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => onItemClick(item.id)}
              className={cn(
                "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline cursor-pointer",
                activeSection === item.id ? "text-foreground font-bold" : "text-foreground/60"
              )}
            >
              {item.title}
            </button>
          ))}
          <div className="h-px bg-border my-2" />
          <Link
            href={`/${localePrefix}/ai-lab`}
            className={cn(
              "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline cursor-pointer gap-1.5",
              pathname.includes('/ai-lab') ? "text-foreground font-bold" : "text-foreground/60"
            )}
          >
            {t("ai-lab")}
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[8.5px] uppercase font-bold text-emerald-400 tracking-wider">Live</span>
          </Link>
          <Link
            href={`/${localePrefix}/ai-job-agent`}
            className={cn(
              "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline cursor-pointer",
              pathname.includes('/ai-job-agent') ? "text-foreground font-bold" : "text-foreground/60"
            )}
          >
            {t("ai-job-agent")}
          </Link>
          <Link
            href={`/${localePrefix}/notepad`}
            className={cn(
              "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline cursor-pointer",
              pathname.includes('/notepad') ? "text-foreground font-bold" : "text-foreground/60"
            )}
          >
            {t("notepad")}
          </Link>
          <Link
            href={`/${localePrefix}/english`}
            className={cn(
              "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline cursor-pointer",
              pathname.includes('/english') ? "text-foreground font-bold" : "text-foreground/60"
            )}
          >
            {t("english")}
          </Link>
          <Link
            href={`/${localePrefix}/chess`}
            className={cn(
              "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline cursor-pointer",
              pathname.includes('/chess') ? "text-foreground font-bold" : "text-foreground/60"
            )}
          >
            {t("chess")}
          </Link>
          <Link
            href={`/${localePrefix}/nasa`}
            className={cn(
              "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline cursor-pointer",
              pathname.includes('/nasa') ? "text-foreground font-bold" : "text-foreground/60"
            )}
          >
            {t("nasa")}
          </Link>
          <div className="h-px bg-border my-2" />
          <div className="w-full">
            <button
              onClick={() => setShowArtifacts(!showArtifacts)}
              className="flex w-full items-center justify-between rounded-md p-2 text-sm font-medium text-foreground/60 hover:text-foreground cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                {t("claude-artifacts")}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 shrink-0", showArtifacts && "rotate-180")} />
            </button>
            
            {showArtifacts && (
              <div className="mt-1 pl-4 flex flex-col gap-1 border-l ml-4 border-amber-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
                {CLAUDE_ARTIFACTS.map((artifact) => {
                  const IconComponent = artifactIcons[artifact.iconName];
                  return (
                    <a
                      key={artifact.id}
                      href={artifact.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 p-2 rounded-md hover:bg-accent/50 text-foreground/75 hover:text-foreground transition-all duration-150 cursor-pointer"
                    >
                      <div className="p-1 rounded bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-semibold leading-none flex items-center gap-1 text-foreground">
                          <span className="truncate">{t_artifacts(`${artifact.id}.title`)}</span>
                          <ExternalLink className="h-3 w-3 text-foreground/30 shrink-0" />
                        </span>
                        <span className="text-[10px] leading-relaxed text-foreground/50 line-clamp-1">
                          {t_artifacts(`${artifact.id}.subtitle`)}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}

