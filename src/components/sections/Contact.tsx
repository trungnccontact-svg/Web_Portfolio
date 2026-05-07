"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Mail, Copy, Check, Send } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/SocialIcons";

const EMAIL = "trungnc.contact@gmail.com";

export default function Contact() {
  const t = useTranslations("contact");
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = EMAIL;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 px-4 bg-surface/50">
      <div className="max-w-xl mx-auto text-center">
        <AnimateOnScroll>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="gradient-text">{t("title")}</span>
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <p className="text-muted text-base sm:text-lg mb-10 leading-relaxed">
            {t("description")}
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              <Send size={18} />
              {t("emailMe")}
            </a>

            <motion.button
              onClick={copyEmail}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-muted hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2 text-green-500"
                  >
                    <Check size={18} />
                    {t("copied")}
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Copy size={18} />
                    {t("copyEmail")}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.3}>
          <div className="flex gap-5 justify-center">
            <a
              href={`mailto:${EMAIL}`}
              className="p-3 rounded-full border border-border text-muted hover:text-primary hover:border-primary transition-all"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
            <a
              href="https://github.com/trungit"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full border border-border text-muted hover:text-primary hover:border-primary transition-all"
              aria-label="GitHub"
            >
              <GithubIcon size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/trung-junior-it-bd"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full border border-border text-muted hover:text-primary hover:border-primary transition-all"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={20} />
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
