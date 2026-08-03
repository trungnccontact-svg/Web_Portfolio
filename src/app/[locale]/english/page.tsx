import { setRequestLocale } from "next-intl/server";
import EnglishScreen from "@/screens/english";

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

  return <EnglishScreen />;
}
