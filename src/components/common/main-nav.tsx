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
            href={`/${pathname.split('/')[1] || 'en'}/ai-job-agent`}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm cursor-pointer",
              pathname.includes('/ai-job-agent')
                ? "text-foreground"
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

