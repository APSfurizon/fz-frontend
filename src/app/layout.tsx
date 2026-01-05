import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import type { Metadata } from "next";
import { Inter, Roboto_Slab } from 'next/font/google'
import "@/styles/globals.css";

const inter = Inter({weight: ['200', '400', '500', '600']});
const robotoSlab = Roboto_Slab({weight: ['200', '400', '500', '600']});

export const metadata: Metadata = {
  title: "Furpanel",
  description: "Enjoy your next adventure",
  icons: [{ rel: "icon", url: "/images/favicon.png" }]
};

export default async function LocalizedLayout({children}: Readonly<{ children: React.ReactNode }>) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.className} ${robotoSlab.className}`}>
      <body className="vertical-list">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
        <div id="portal-root"></div>
      </body>
    </html>
  );
}
