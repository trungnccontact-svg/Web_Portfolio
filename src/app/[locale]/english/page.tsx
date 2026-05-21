import { setRequestLocale } from "next-intl/server";
import { EnglishLearning } from "@/components/sections/EnglishLearning";

export const metadata = {
  title: "AI English Learning | Portfolio",
  description: "Scan grammar worksheets, hand-written annotations, and analyze vocabulary & syntax rules using free AI models.",
};

export default async function EnglishLearningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      {/* Premium glowing background elements */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse opacity-40 -z-10" />
      <div className="absolute bottom-0 -right-1/4 w-[150%] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse opacity-40 -z-10" />
      
      <EnglishLearning />
    </div>
  );
}
