"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE } from "./config";
import type { Locale } from "./config";
import { translate } from "./translate";
import type { Vars } from "./translate";

type LocaleContextValue = {
  brandName: string;
  locale: Locale;
  t: (key: string, vars?: Vars) => string;
  setLocale: (next: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, brandName, children }: { locale: Locale; brandName: string; children: ReactNode }) {
  const router = useRouter();

  const t = useCallback((key: string, vars?: Vars) => translate(locale, key, { ...vars, brandName }), [locale, brandName]);

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo(() => ({ locale, brandName, t, setLocale }), [locale, brandName, t, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useT must be used within LocaleProvider");
  return ctx;
}
