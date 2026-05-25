"use client";

import { motion } from "framer-motion";
import { Norican } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/components/common/icons";
import { MobileNav } from "@/components/common/mobile-nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { CLAUDE_ARTIFACTS } from "@/config/artifacts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const norican = Norican({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
});

const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

export function MainNav() {
  const t = useTranslations("nav");
  const t_artifacts = useTranslations("artifacts");
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState("home");

  const sections = ["home", "about", "experience", "projects", "skills", "education", "contact"];


  React.useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // If not on the home page, redirect to home page with hash
    const localePrefix = pathname.split('/')[1]; // e.g., "en" or "vi"
    const isHomePage = pathname === `/${localePrefix}` || pathname === '/';
    
    if (!isHomePage) {
      router.push(`/${localePrefix}/#${sectionId}`);
      setShowMobileMenu(false);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setShowMobileMenu(false);
  };

  return (
    <div className="flex gap-6 md:gap-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button 
          onClick={() => scrollToSection("home")}
          className="hidden items-center space-x-2 md:flex cursor-pointer"
        >
          <span className={cn(norican.className, "text-2xl")}>
            {siteConfig.authorName}
          </span>
        </button>
      </motion.div>
      <nav className="hidden gap-6 md:flex items-center">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => scrollToSection(section)}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer",
                activeSection === section
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              {t(section)}
            </button>
          </motion.div>
        ))}
        <motion.div
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          <Link
            href={`/${pathname.split('/')[1] || 'en'}/ai-lab`}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer",
              pathname.includes('/ai-lab')
                ? "text-foreground font-bold animate-pulse"
                : "text-foreground/60"
            )}
          >
            {t("ai-lab")}
            <span className="ml-1.5 flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="ml-1 text-[8.5px] uppercase font-bold text-emerald-400 tracking-wider shrink-0">Live</span>
          </Link>
        </motion.div>
        <motion.div
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          <Link
            href={`/${pathname.split('/')[1] || 'en'}/ai-job-agent`}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer",
              pathname.includes('/ai-job-agent')
                ? "text-foreground font-bold"
                : "text-foreground/60"
            )}
          >
            {t("ai-job-agent")}
          </Link>
        </motion.div>
        <motion.div
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          <Link
            href={`/${pathname.split('/')[1] || 'en'}/notepad`}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer",
              pathname.includes('/notepad')
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {t("notepad")}
          </Link>
        </motion.div>
        <motion.div
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          <Link
            href={`/${pathname.split('/')[1] || 'en'}/english`}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer",
              pathname.includes('/english')
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {t("english")}
          </Link>
        </motion.div>
        <motion.div
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          <Link
            href={`/${pathname.split('/')[1] || 'en'}/chess`}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer",
              pathname.includes('/chess')
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {t("chess")}
          </Link>
        </motion.div>
        <motion.div
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          <Link
            href={`/${pathname.split('/')[1] || 'en'}/nasa`}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer",
              pathname.includes('/nasa')
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {t("nasa")}
          </Link>
        </motion.div>
        <motion.div
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05 }}
            className="relative"
        >
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer outline-none gap-1">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
              <span>{t("claude-artifacts")}</span>
              <ChevronDown className="h-3 w-3 text-foreground/60 transition-transform duration-200" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] p-2 bg-background/95 backdrop-blur-md border shadow-2xl rounded-xl z-50">
              <div className="px-2 py-1.5 border-b mb-1">
                <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">{t_artifacts("title")}</p>
                <p className="text-[10px] text-foreground/60 mt-0.5 leading-relaxed">{t_artifacts("description")}</p>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {CLAUDE_ARTIFACTS.map((artifact) => {
                  const IconComponent = artifactIcons[artifact.iconName];
                  return (
                    <DropdownMenuItem key={artifact.id} asChild>
                      <a
                        href={artifact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-accent/80 hover:text-accent-foreground transition-all duration-150 cursor-pointer group"
                      >
                        <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 group-hover:scale-105 transition-all shrink-0 mt-0.5">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-semibold leading-none text-foreground flex items-center gap-1">
                            <span className="truncate">{t_artifacts(`${artifact.id}.title`)}</span>
                            <ExternalLink className="h-3 w-3 text-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </span>
                          <span className="text-[10.5px] leading-snug text-foreground/60 group-hover:text-foreground/80 transition-colors line-clamp-2">
                            {t_artifacts(`${artifact.id}.subtitle`)}
                          </span>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </nav>
      <motion.button
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showMobileMenu ? <Icons.close /> : <Icons.menu />}
        <span className="font-bold">Menu</span>
      </motion.button>
      {showMobileMenu && (
        <MobileNav 
          items={sections.map(s => ({ title: t(s), id: s }))} 
          onItemClick={scrollToSection}
          activeSection={activeSection}
        />
      )}
    </div>
  );
}

