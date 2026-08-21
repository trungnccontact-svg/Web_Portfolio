import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nguyen Chi Trung | Junior Business Analyst",
  description:
    "A technically-grounded Junior Business Analyst with 1+ year of hands-on software delivery experience, comfortable bridging business requirements and technical implementation.",
  keywords: [
    "Junior Business Analyst",
    "Business Analyst",
    "Technical BA",
    "Software Engineer",
    "Requirement Clarification",
    "Process Mapping",
    "Nguyen Chi Trung",
  ],
  authors: [{ name: "Nguyen Chi Trung" }],
  openGraph: {
    title: "Nguyen Chi Trung | Junior Business Analyst",
    description:
      "Junior Business Analyst with technical background bridging business requirements and technical delivery.",
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
