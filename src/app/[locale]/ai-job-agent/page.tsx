import { setRequestLocale } from "next-intl/server";
import AIJobAgentScreen from "@/screens/ai-job-agent";

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

  return <AIJobAgentScreen />;
}
