"use client";

import { useTranslations } from "next-intl";
import { useTranslations as useT } from "next-intl";
import Image from "next/image";
import { MapPin, Phone, Mail, Code2, Briefcase, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/common/animated-section";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <motion.div
      variants={itemVariants}
      className="glass-card rounded-2xl p-5 flex flex-col items-center gap-2 text-center hover:border-primary/40 transition-colors duration-300 group"
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
        <Icon size={18} className="text-primary" />
      </div>
      <span className="font-heading text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </motion.div>
  );
}

export default function About() {
  const t = useTranslations("about");

  return (
    <section id="about" className="relative py-24 overflow-hidden">
      {/* Subtle background radial */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-3xl opacity-5"
          style={{ background: "hsl(var(--primary))" }}
        />
      </div>

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <AnimatedSection className="flex flex-col items-center space-y-16">
          {/* Section heading */}
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Who I Am
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          </div>

          {/* Main content grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-12 gap-8 lg:gap-12 items-start w-full"
          >
            {/* Avatar card */}
            <motion.div variants={itemVariants} className="md:col-span-4 flex justify-center">
              <div className="relative w-full max-w-[280px]">
                {/* Glow behind card */}
                <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-20 bg-primary pointer-events-none" />
                <div className="relative overflow-hidden rounded-2xl border border-border/60 glass-card shadow-2xl group animate-pulse-glow">
                  {/* Use padding-bottom trick for fill images */}
                  <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                    <Image
                      src="/images/avatar.png"
                      alt="Nguyen Chi Trung"
                      fill
                      sizes="280px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-heading font-bold text-base">Nguyen Chi Trung</p>
                    <p className="text-xs text-primary mt-0.5">Junior Business Analyst | Technical Background</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bio + Info */}
            <div className="md:col-span-8 space-y-8">
              <motion.blockquote
                variants={itemVariants}
                className="text-lg text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-5 italic"
              >
                &ldquo;{t("description")}&rdquo;
              </motion.blockquote>

              {/* Contact info cards */}
              <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4">
                {[
                  { Icon: Phone, label: "Phone", value: t("info.phone"), href: `tel:${t("info.phone")}` },
                  { Icon: Mail, label: "Email", value: t("info.email"), href: `mailto:${t("info.email")}` },
                  { Icon: MapPin, label: "Location", value: t("info.address"), href: undefined, colSpan: true },
                ].map(({ Icon, label, value, href, colSpan }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-4 p-4 rounded-xl glass-card border-border/40 hover:border-primary/30 transition-colors duration-300 ${colSpan ? "sm:col-span-2" : ""}`}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium hover:text-primary transition-colors truncate block">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium leading-snug">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full"
          >
            <StatCard icon={Code2} value="1+" label="Years Software Delivery" />
            <StatCard icon={Briefcase} value="6+" label="Workflows & Projects" />
            <StatCard icon={GraduationCap} value="B.Eng" label="Information Tech" />
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
