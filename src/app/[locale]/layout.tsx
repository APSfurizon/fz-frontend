import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import type { Metadata } from "next";
import Footer from "../_components/footer"
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Furpanel",
  description: "Enjoy your next adventure",
};

export default async function LocalizedLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
        <div className="page-wrapper">
          {children}
          <Footer></Footer>
        </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
