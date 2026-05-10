"use client";

import { useTranslations } from "next-intl";
import { GraduationCap, Calendar, MapPin, Award, Trophy } from "lucide-react";
import { AnimatedSection } from "@/components/common/animated-section";
import { Card, CardContent } from "@/components/ui/card";

interface Cert {
  name: string;
  detail: string;
  date: string;
}

interface Activity {
  name: string;
  role: string;
  detail?: string;
  org?: string;
  period?: string;
}

export default function Education() {
  const t = useTranslations("education");
  const tCert = useTranslations("certifications");
  const certs = tCert.raw("certs") as Cert[];
  const activities = tCert.raw("activities") as Activity[];

  return (
    <section id="education" className="py-20 bg-muted/30">
      <div className="container max-w-5xl mx-auto px-4">
        <AnimatedSection className="flex flex-col items-center space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="w-full max-w-3xl">
            <Card className="overflow-hidden border border-border bg-card hover:border-primary/20 transition-all shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <GraduationCap size={24} className="text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-heading text-xl font-bold">{t("school")}</h3>
                      <p className="text-primary font-medium">{t("degree")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-heading text-xs font-semibold whitespace-nowrap self-start md:self-center">
                    <Calendar size={14} />
                    {t("period")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certifications & Activities */}
          <div className="text-center space-y-4 pt-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {tCert("title")}
            </h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 gap-6 w-full">
            {/* Certs */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-bold flex items-center gap-2">
                <Award className="text-primary" size={20} />
                Certifications
              </h3>
              <div className="grid gap-4">
                {certs.map((cert, i) => (
                  <Card key={i} className="bg-card/50 border-border hover:border-primary/20 transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-sm">{cert.name}</h4>
                      <p className="text-xs text-muted-foreground">{cert.detail} • {cert.date}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-bold flex items-center gap-2">
                <Trophy className="text-primary" size={20} />
                Extracurricular
              </h3>
              <div className="grid gap-4">
                {activities.map((act, i) => (
                  <Card key={i} className="bg-card/50 border-border hover:border-primary/20 transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-sm">{act.name}</h4>
                      {act.role && <p className="text-xs text-primary font-medium">{act.role}</p>}
                      {act.detail && <p className="text-[10px] text-muted-foreground">{act.detail}</p>}
                      {act.org && <p className="text-[10px] text-muted-foreground">{act.org}</p>}
                      {act.period && <p className="text-[10px] text-muted-foreground">{act.period}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
