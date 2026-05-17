import { setRequestLocale } from "next-intl/server";
import { AIJobAgent } from "@/components/sections/AIJobAgent";

export const metadata = {
  title: "AI Job Agent | Portfolio",
  description: "AI-powered CV analysis and job matching agent.",
};

export default async function AIJobAgentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      {/* Subtle animated background gradient */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse opacity-50 -z-10" />
      
      <AIJobAgent />
    </div>
  );
}
