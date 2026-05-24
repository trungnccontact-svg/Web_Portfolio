import { setRequestLocale } from "next-intl/server";
import { NasaObservatory } from "@/components/sections/NasaObservatory";

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

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#02040a] relative overflow-hidden flex flex-col justify-start text-foreground">
      {/* Immersive space starry and nebulae backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,138,0.15)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(88,28,135,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeat] bg-[size:100px_100px]"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`
        }}
      />

      <NasaObservatory />
    </div>
  );
}
