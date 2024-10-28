import type { Metadata } from "next";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Furpanel",
  description: "Enjoy your next adventure",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
