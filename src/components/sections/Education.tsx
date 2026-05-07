"use client";

import { useTranslations } from "next-intl";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { GraduationCap, Award, Trophy } from "lucide-react";

interface Cert {
  name: string;
  detail: string;
  date: string;
}

interface Activity {
  name: string;
  role?: string;
  detail?: string;
  org?: string;
  period?: string;
}

export default function Education() {
  const tEdu = useTranslations("education");
  const tCert = useTranslations("certifications");
  const certs = tCert.raw("certs") as Cert[];
  const activities = tCert.raw("activities") as Activity[];

  return (
    <section id="education" className="py-20 sm:py-28 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Education */}
        <AnimateOnScroll>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
            <span className="gradient-text">{tEdu("title")}</span>
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <div className="p-6 rounded-xl bg-surface border border-border mb-16 max-w-xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                <GraduationCap size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{tEdu("school")}</h3>
                <p className="text-muted text-sm mt-1">{tEdu("degree")}</p>
                <p className="text-primary text-sm font-medium mt-2">
                  {tEdu("period")}
                </p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Certifications & Activities */}
        <AnimateOnScroll>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
            <span className="gradient-text">{tCert("title")}</span>
          </h2>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Certs */}
          {certs.map((cert, i) => (
            <AnimateOnScroll key={i} delay={0.1}>
              <div className="p-5 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                    <Award size={18} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{cert.name}</h4>
                    <p className="text-muted text-xs mt-1">{cert.detail}</p>
                    <p className="text-primary text-xs font-medium mt-1.5">
                      {cert.date}
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}

          {/* Activities */}
          {activities.map((activity, i) => (
            <AnimateOnScroll key={i} delay={0.15 + i * 0.05}>
              <div className="p-5 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Trophy size={18} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{activity.name}</h4>
                    {activity.role && (
                      <p className="text-muted text-xs mt-1">{activity.role}</p>
                    )}
                    {activity.detail && (
                      <p className="text-muted text-xs mt-1">{activity.detail}</p>
                    )}
                    {activity.org && (
                      <p className="text-muted text-xs mt-1">{activity.org}</p>
                    )}
                    {activity.period && (
                      <p className="text-primary text-xs font-medium mt-1.5">
                        {activity.period}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
