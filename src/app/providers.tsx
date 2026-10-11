"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/hooks/useCart";
import CartDrawer from "@/components/feature/CartDrawer";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";
import { AnnouncementsContext } from "@/components/feature/AnnouncementBar";

export default function Providers({ children, locale, brandName, announcements }: { children: ReactNode; locale: Locale; brandName: string; announcements: string[] }) {
  return (
    <LocaleProvider locale={locale} brandName={brandName}>
      <AnnouncementsContext.Provider value={announcements}>
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
      </AnnouncementsContext.Provider>
    </LocaleProvider>
  );
}
