"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AnnouncementBar from "@/components/feature/AnnouncementBar";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import ProductCard from "@/components/base/ProductCard";
import CollectionHero from "./components/CollectionHero";
import CollectionToolbar from "./components/CollectionToolbar";
import Pagination from "./components/Pagination";
import { collectionFilters } from "@/mocks/products";
import type { Product } from "@/mocks/products";
import { useT } from "@/i18n/LocaleProvider";

const PAGE_SIZE = 9;

// Bỏ dấu để "tui" khớp "túi" và "den" khớp "đen".
const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

type CollectionMeta = { title: string; subtitle: string; breadcrumb: string };

export default function CollectionPage({
  products,
  meta,
}: {
  products: Product[];
  meta: CollectionMeta;
}) {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const activeFilter = collectionFilters.some((f) => f.id === filterParam)
    ? (filterParam as string)
    : "all";
  const searchQuery = (searchParams.get("q") ?? "").trim().slice(0, 100);
  const buildUrl = (filter: string, q: string) => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const setActiveFilter = (id: string) => {
    router.replace(buildUrl(id, searchQuery), { scroll: false });
  };
  const clearSearch = () => {
    router.replace(buildUrl(activeFilter, ""), { scroll: false });
  };
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...products];
    if (searchQuery) {
      const terms = normalize(searchQuery).split(/\s+/).filter(Boolean);
      list = list.filter((p) => {
        const haystack = normalize([p.name, ...p.colors.map((c) => c.name)].join(" "));
        return terms.every((term) => haystack.includes(term));
      });
    }
    if (activeFilter === "new") list = list.filter((p) => p.tag === "New");
    if (activeFilter === "best") list = list.filter((p) => p.tag === "Best seller");
    if (activeFilter === "mini") list = list.filter((p) => /mini/i.test(p.name));
    if (activeFilter === "sale")
      list = list.filter((p) => typeof p.compareAtPrice === "number");

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "newest") list.reverse();

    return list;
  }, [products, activeFilter, sort, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [activeFilter, sort, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1">
        <CollectionHero
          title={meta.title}
          subtitle={meta.subtitle}
          breadcrumb={meta.breadcrumb}
          itemCount={products.length}
        />

        <CollectionToolbar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sort={sort}
          onSortChange={setSort}
          resultCount={filtered.length}
        />

        <section id="products" className="mx-auto max-w-site scroll-mt-40 px-4 py-8 md:px-8 md:py-12">
          {searchQuery && (
            <div className="mb-6 flex flex-wrap items-center gap-3" role="status" aria-live="polite">
              <p className="text-sm font-semibold text-foreground-900">
                {t("search.resultsFor", { query: searchQuery })}
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="flex items-center gap-1 rounded-full border border-background-300 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground-700 transition-colors hover:text-foreground-950 cursor-pointer"
              >
                <i className="ri-close-line" aria-hidden="true" />
                {t("search.clear")}
              </button>
            </div>
          )}

          {pagedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
              {pagedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <i className="ri-shopping-bag-3-line text-4xl text-foreground-300" />
              <p className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-foreground-700">
                {searchQuery
                  ? t("search.emptyFor", { query: searchQuery })
                  : t("collection.empty")}
              </p>
              <button
                type="button"
                onClick={() => router.replace(pathname, { scroll: false })}
                className="rounded-md bg-foreground-950 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-background-50 whitespace-nowrap cursor-pointer"
              >
                {t("collection.viewAll")}
              </button>
            </div>
          )}

          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}