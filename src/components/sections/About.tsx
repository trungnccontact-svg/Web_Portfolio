"use client";

import { useTranslations } from "next-intl";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { MapPin, Phone, Mail, User } from "lucide-react";

export default function About() {
  const t = useTranslations("about");

  return (
    <section id="about" className="py-20 sm:py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimateOnScroll>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
            <span className="gradient-text">{t("title")}</span>
          </h2>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Avatar placeholder */}
          <AnimateOnScroll delay={0.1} className="flex justify-center">
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-primary/20 glow">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <User size={64} className="text-primary/50" />
              </div>
              {/* Decorative border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/10" />
            </div>
          </AnimateOnScroll>

          {/* Bio + Info */}
          <AnimateOnScroll delay={0.2} className="md:col-span-2">
            <p className="text-muted text-base sm:text-lg leading-relaxed mb-8">
              {t("description")}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-muted">
                <Phone size={16} className="text-primary shrink-0" />
                <span>{t("info.phone")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted">
                <Mail size={16} className="text-primary shrink-0" />
                <a
                  href={`mailto:${t("info.email")}`}
                  className="hover:text-primary transition-colors"
                >
                  {t("info.email")}
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted sm:col-span-2">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span>{t("info.address")}</span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
