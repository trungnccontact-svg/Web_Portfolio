import { setRequestLocale } from "next-intl/server";
import NotepadScreen from "@/screens/notepad";

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

  return <NotepadScreen />;
}
