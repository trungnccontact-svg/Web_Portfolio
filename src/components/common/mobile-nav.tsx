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
        </nav>
      </div>
    </div>
  );
}

