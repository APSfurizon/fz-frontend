import type { Metadata } from "next";
import Footer from "./_components/footer"
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Furpanel",
  description: "Enjoy your next adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">
          {children}
          <Footer></Footer>
        </div>
      </body>
    </html>
  );
}
