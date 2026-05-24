"use client";

import { Norican } from "next/font/google";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";
import { useLockBody } from "@/hooks/use-lock-body";
import { cn } from "@/lib/utils";

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
  const localePrefix = pathname.split('/')[1] || 'en';

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
        </nav>
      </div>
    </div>
  );
}

