"use client";

import { LOCALES } from "@/i18n/config";
import { useT } from "@/i18n/LocaleProvider";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useT();

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className={`flex items-center rounded-full border border-background-300 p-0.5 ${className}`}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          title={t(`lang.${code}`)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer ${
            locale === code
              ? "bg-foreground-950 text-background-50"
              : "text-foreground-600 hover:text-foreground-950"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
