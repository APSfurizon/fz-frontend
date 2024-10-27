import type { Metadata } from "next";

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
