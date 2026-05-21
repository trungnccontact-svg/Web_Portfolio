"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { AnimatedSection } from "@/components/common/animated-section";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const t = useTranslations("about");

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container max-w-5xl mx-auto px-4">
        <AnimatedSection className="flex flex-col items-center space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-start w-full">
            {/* Avatar card */}
            <div className="md:col-span-4 flex justify-center">
              <Card className="overflow-hidden border-2 border-border shadow-xl w-full max-w-[300px] group hover:border-primary/40 transition-colors duration-300">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <Image
                      src="/images/avatar.png"
                      alt="Nguyen Chi Trung"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bio + Info */}
            <div className="md:col-span-8 space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed italic">
                "{t("description")}"
              </p>

              <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("info.phone")}</p>
                    <p className="text-sm font-semibold">{t("info.phone")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                    <a
                      href={`mailto:${t("info.email")}`}
                      className="text-sm font-semibold hover:text-primary transition-colors"
                    >
                      {t("info.email")}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 sm:col-span-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Location</p>
                    <p className="text-sm font-semibold leading-snug">{t("info.address")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
