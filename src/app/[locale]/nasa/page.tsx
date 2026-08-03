import { setRequestLocale } from "next-intl/server";
import NasaScreen from "@/screens/nasa";

export const metadata = {
  title: "NASA Space Earth Observatory & GIS Center | Portfolio",
  description: "Experience Earth from space through an interactive satellite orbit cockpit. Simulate scans, analyze multispectral imagery, and research how Google Earth works with interactive Quadtree LOD tiling models.",
};

export default async function NasaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NasaScreen />;
}
