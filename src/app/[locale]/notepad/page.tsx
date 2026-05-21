import { setRequestLocale } from "next-intl/server";
import { Notepad } from "@/components/sections/Notepad";

export const metadata = {
  title: "Interactive Notepad | Portfolio",
  description: "A premium, fully integrated interactive notepad with live Markdown preview, local storage saving, and file export options.",
};

export default async function NotepadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-background to-background/50 relative overflow-hidden flex flex-col justify-start">
      {/* Dynamic background blur accents */}
      <div className="absolute top-0 -right-1/4 w-[120%] h-[400px] bg-primary/5 rounded-full blur-[120px] animate-pulse opacity-40 -z-10" />
      <div className="absolute bottom-0 -left-1/4 w-[100%] h-[300px] bg-secondary/10 rounded-full blur-[100px] opacity-30 -z-10" />
      
      <Notepad />
    </div>
  );
}
