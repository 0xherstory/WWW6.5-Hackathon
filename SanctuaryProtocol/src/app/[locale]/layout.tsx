import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale } from "@/i18n";
import "../globals.css";
import Header from "@/components/layout/Header";
import GuestModeNotice from "@/components/onboarding/GuestModeNotice";
import { Providers } from "../providers";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale: locale as Locale });
  
  return {
    title: (messages.metadata as { title: string }).title,
    description: (messages.metadata as { description: string }).description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale: locale as Locale });

  return (
    <html lang={locale}>
      <body className="antialiased min-h-screen bg-background paper-texture geometric-watermark">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <Header />
            <GuestModeNotice />
            <main className="relative">{children}</main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
