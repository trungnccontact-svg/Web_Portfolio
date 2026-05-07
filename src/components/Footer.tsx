"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/SocialIcons";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted flex items-center gap-1.5">
          {t("designed")}{" "}
          <Heart size={12} className="text-red-500 fill-red-500" />
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/trungit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-primary transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon size={16} />
          </a>
          <a
            href="https://www.linkedin.com/in/trung-junior-it-bd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-primary transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedinIcon size={16} />
          </a>
        </div>
        <p className="text-xs text-muted">
          © {year} {t("rights")}
        </p>
      </div>
    </footer>
  );
}
