"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LocaleToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "vi" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 px-2.5 h-9 font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      onClick={toggleLocale}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs uppercase">{locale === "en" ? "VI" : "EN"}</span>
    </Button>
  );
}
