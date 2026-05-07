import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nguyen Chi Trung | Full-stack Developer",
  description:
    "Full-stack Developer with 1+ year of experience building production web and mobile applications using React, React Native, and NestJS.",
  keywords: [
    "Full-stack Developer",
    "React",
    "React Native",
    "NestJS",
    "TypeScript",
    "Portfolio",
    "Nguyen Chi Trung",
  ],
  authors: [{ name: "Nguyen Chi Trung" }],
  openGraph: {
    title: "Nguyen Chi Trung | Full-stack Developer",
    description:
      "Full-stack Developer building production web and mobile applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
