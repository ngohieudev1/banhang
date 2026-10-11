"use client";

import Link from "next/link";
import { useT } from "@/i18n/LocaleProvider";

type CollectionHeroProps = {
  title: string;
  subtitle: string;
  breadcrumb: string;
  itemCount: number;
};

export default function CollectionHero({
  title,
  subtitle,
  breadcrumb,
  itemCount,
}: CollectionHeroProps) {
  const { t } = useT();

  return (
    <section className="w-full bg-primary-100">
      <div className="mx-auto max-w-site px-4 pb-10 pt-10 md:px-8 md:pb-16 md:pt-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <nav
              aria-label={t("common.breadcrumb")}
              className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-600"
            >
              <Link href="/" className="text-foreground-800 transition-colors hover:text-foreground-950">
                {t("collection.home")}
              </Link>
              <span className="text-foreground-400">/</span>
              <Link
                href="/?filter=all#products"
                className="text-foreground-800 transition-colors hover:text-foreground-950"
              >
                {t("collection.collections")}
              </Link>
              <span className="text-foreground-400">/</span>
              <Link
                href="/?filter=all#products"
                aria-current="page"
                className="text-accent-700 transition-colors hover:text-accent-800"
              >
                {title}
              </Link>
            </nav>
            <h1 className="font-heading text-5xl font-extrabold uppercase tracking-[-0.02em] text-foreground-950 md:text-7xl">
              {title}
            </h1>
          </div>

          <div className="lg:max-w-sm">
            <p className="text-sm leading-relaxed text-foreground-700">{subtitle}</p>
            <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-500">
              <i className="ri-map-pin-line text-primary-600" />
              {t("collection.designedIn")} {"\u00b7"} {breadcrumb}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-500">
              {t("collection.products", { count: itemCount })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}