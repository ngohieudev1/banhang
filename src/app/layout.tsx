import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";
import { SITE_URL } from "@/lib/site";
import { getAnnouncements, getBrandName } from "@/lib/siteSettings";
import { getLocale } from "@/i18n/server";
import { translate } from "@/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const brandName = await getBrandName();
  const t = (key: string) => translate(locale, key, { brandName });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("meta.homeTitle"),
      template: `%s – ${brandName}`,
    },
    description: t("meta.description"),
    keywords: [
      `${brandName} bags`,
      "handbags Vietnam",
      "Y2K bag",
      "C5 pocket bag",
      "hobo bag",
      "designer handbags",
    ],
    openGraph: {
      type: "website",
      siteName: brandName,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const [brandName, announcements] = await Promise.all([getBrandName(), getAnnouncements()]);

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.5.0/remixicon.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <Providers locale={locale} brandName={brandName} announcements={announcements}>{children}</Providers>
      </body>
    </html>
  );
}
