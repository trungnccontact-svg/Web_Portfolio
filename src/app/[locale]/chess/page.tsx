import { setRequestLocale } from "next-intl/server";
import ChessScreen from "@/screens/chess";

export const metadata = {
  title: "Grandmaster AI Chess Lounge | Portfolio",
  description: "Play against an adaptive AI that learns from defeats and taunts you dynamically in real time, backed by TiDB.",
};

export default async function ChessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ChessScreen />;
}
