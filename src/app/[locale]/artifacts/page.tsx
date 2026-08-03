import { setRequestLocale } from "next-intl/server";
import ArtifactsScreen from "@/screens/artifacts";

export const metadata = {
  title: "Claude Artifacts Hub & Storage | Portfolio",
  description: "Manage, store, search, and filter your favorite Claude Artifact links.",
};

export default async function ArtifactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ArtifactsScreen />;
}
