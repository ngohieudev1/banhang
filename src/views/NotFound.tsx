"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/LocaleProvider";

export default function NotFound() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <div className="relative flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="absolute bottom-0 text-9xl md:text-[12rem] font-black text-gray-50 select-none pointer-events-none z-0">
        404
      </h1>
      <div className="relative z-10">
        <h1 className="text-xl md:text-2xl font-semibold mt-6">{t("notFound.title")}</h1>
        <p className="mt-2 text-base text-gray-400 font-mono">{pathname}</p>
        <p className="mt-4 text-lg md:text-xl text-gray-500">{t("notFound.body")}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-foreground-950 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-background-50"
        >
          {t("notFound.home")}
        </Link>
      </div>
    </div>
  );
}