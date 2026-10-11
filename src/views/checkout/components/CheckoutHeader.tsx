"use client";

import Link from "next/link";
import { useT } from "@/i18n/LocaleProvider";
import LanguageSwitcher from "@/components/base/LanguageSwitcher";

export default function CheckoutHeader() {
  const { t, brandName } = useT();

  return (
    <header className="w-full border-b border-background-200 bg-background-50">
      <div className="mx-auto flex h-16 max-w-site items-center justify-between gap-4 px-4 md:h-20 md:px-8">
        <Link
          href="/"
          className="font-heading text-lg font-extrabold uppercase tracking-[0.22em] text-foreground-950 md:text-2xl"
        >
          {brandName}
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-600 transition-colors hover:text-foreground-950 sm:inline-flex"
          >
            {t("checkout.backToStore")}
          </Link>
          <LanguageSwitcher />
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-800">
            <i className="ri-lock-2-line text-base" />
            {t("checkout.secure")}
          </span>
        </div>
      </div>
    </header>
  );
}