"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Norican } from "next/font/google";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/mockdata/site";
import { Icons } from "@/components/common/icons";
import { Sparkles } from "lucide-react";

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
      delay: 0.05 * i,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

interface HeaderNavProps {
  activeSection?: string;
}

export function HeaderNav({ activeSection: externalActiveSection }: HeaderNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const localePrefix = pathname.split("/")[1] || "en";
  const isHomePage = pathname === `/${localePrefix}` || pathname === "/";

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Track active section on scroll if on home page
  useEffect(() => {
    if (!isHomePage) return;
    const sections = ["home", "about", "experience", "projects", "skills", "education", "contact"];
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
  }, [isHomePage]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  // Close mobile menu on pathname change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const currentActiveSection = externalActiveSection || activeSection;

  const scrollToSection = (sectionId: string) => {
    setShowMobileMenu(false);
    if (!isHomePage) {
      router.push(`/${localePrefix}/#${sectionId}`);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Helper for rendering section item (Desktop + Mobile)
  const renderSectionItem = (id: string, label: string, index: number) => {
    const isActive = currentActiveSection === id;
    return (
      <React.Fragment key={id}>
        {/* Desktop View */}
        <motion.div custom={index} initial="hidden" animate="visible" variants={navItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden md:block">
          <button
            onClick={() => scrollToSection(id)}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer",
              isActive ? "text-foreground font-bold" : "text-foreground/60"
            )}
          >
            {label}
          </button>
        </motion.div>

        {/* Mobile View */}
        <button
          onClick={() => scrollToSection(id)}
          className={cn(
            "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline cursor-pointer md:hidden",
            isActive ? "text-foreground font-bold bg-accent/40" : "text-foreground/60"
          )}
        >
          {label}
        </button>
      </React.Fragment>
    );
  };

  // Helper for rendering route link (Desktop + Mobile)
  const renderRouteItem = (
    href: string,
    label: string,
    badge?: React.ReactNode,
    index?: number
  ) => {
    const fullHref = `/${localePrefix}${href}`;
    const isActive = pathname.includes(href);

    return (
      <React.Fragment key={href}>
        {/* Desktop View */}
        <motion.div custom={index || 0} initial="hidden" animate="visible" variants={navItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden md:block">
          <Link
            href={fullHref}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer gap-1",
              isActive ? "text-foreground font-bold" : "text-foreground/60"
            )}
          >
            {badge}
            <span>{label}</span>
          </Link>
        </motion.div>

        {/* Mobile View */}
        <Link
          href={fullHref}
          onClick={() => setShowMobileMenu(false)}
          className={cn(
            "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline cursor-pointer gap-1.5 md:hidden",
            isActive ? "text-foreground font-bold bg-accent/40" : "text-foreground/60"
          )}
        >
          {badge}
          <span>{label}</span>
        </Link>
      </React.Fragment>
    );
  };

  // --- Sub-components for each page / section ---

  const PageHome = () => renderSectionItem("home", t("home"), 0);
  const PageAbout = () => renderSectionItem("about", t("about"), 1);
  const PageExperience = () => renderSectionItem("experience", t("experience"), 2);
  const PageProjects = () => renderSectionItem("projects", t("projects"), 3);
  const PageSkills = () => renderSectionItem("skills", t("skills"), 4);
  const PageEducation = () => renderSectionItem("education", t("education"), 5);
  const PageContact = () => renderSectionItem("contact", t("contact"), 6);

  const PageAiLab = () =>
    renderRouteItem(
      "/ai-lab",
      t("ai-lab"),
      <span className="flex h-2 w-2 relative shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>,
      7
    );

  const PageAiJobAgent = () => renderRouteItem("/ai-job-agent", t("ai-job-agent"), undefined, 8);
  const PageNotepad = () => renderRouteItem("/notepad", t("notepad"), undefined, 9);
  const PageEnglish = () => renderRouteItem("/english", t("english"), undefined, 10);
  const PageChess = () => renderRouteItem("/chess", t("chess"), undefined, 11);
  const PageNasa = () => renderRouteItem("/nasa", t("nasa"), undefined, 12);
  const PageClaudeArtifacts = () =>
    renderRouteItem(
      "/artifacts",
      t("claude-artifacts"),
      <Sparkles className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />,
      13
    );

  /*
   * =========================================================================================
   * MASTER UNIFIED NAVIGATION LIST (DESKTOP + MOBILE)
   * Khi comment 1 dòng ở dưới, trang đó sẽ tự động ẨN TRÊN CẢ DESKTOP LẪN MOBILE!
   * =========================================================================================
   */
  const renderNavList = () => (
    <>
      {/* <PageHome />
      <PageAbout />
      <PageExperience />
      <PageProjects />
      <PageSkills />
      <PageEducation />
      <PageContact /> */}
      {/* <PageAiLab />
      <PageAiJobAgent /> */}
      <PageNotepad />
      {/* <PageEnglish />
      <PageChess />
      <PageNasa /> */}
      <PageClaudeArtifacts />
    </>
  );

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* Brand Logo / Name */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <button onClick={() => scrollToSection("home")} className="flex items-center space-x-2 cursor-pointer">
          <span className={cn(norican.className, "text-2xl")}>{siteConfig.authorName}</span>
        </button>
      </motion.div>

      {/* Desktop Navigation Bar */}
      <nav className="hidden gap-6 md:flex items-center">
        {renderNavList()}
      </nav>

      {/* Mobile Menu Toggle Button */}
      <motion.button
        className="flex items-center space-x-2 md:hidden cursor-pointer"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showMobileMenu ? <Icons.close /> : <Icons.menu />}
        <span className="font-bold text-sm">Menu</span>
      </motion.button>

      {/* Mobile Drawer Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-top-10 md:hidden bg-background/95 backdrop-blur-sm">
          <div className="relative z-20 grid gap-4 rounded-md bg-popover p-4 text-popover-foreground shadow-md border border-border">
            <button onClick={() => scrollToSection("home")} className="flex items-center space-x-2 text-left cursor-pointer mb-2">
              <span className={cn(norican.className, "text-2xl")}>{siteConfig.authorName}</span>
            </button>
            <nav className="grid grid-flow-row auto-rows-max text-sm gap-1">
              {renderNavList()}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
