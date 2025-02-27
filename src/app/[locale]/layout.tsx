import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import type { Metadata } from "next";
import Footer from "@/components/footer"
import Header from '@/components/header';

export const metadata: Metadata = {
  title: "Furpanel",
  description: "Enjoy your next adventure",
  icons: [{ rel: "icon", url: "/images/favicon.png" }]
};

export default async function LocalizedLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const { locale }  = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="vertical-list">
        <NextIntlClientProvider messages={messages}>
          {children}
          <div className="spacer"></div>
          <Footer></Footer>
        </NextIntlClientProvider>
        <div id="portal-root"></div>
      </body>
    </html>
  );
}
