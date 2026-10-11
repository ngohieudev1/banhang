"use client";

import { useEffect, useRef, useState } from "react";
import { collectionFilters, sortOptions } from "@/mocks/products";
import { useT } from "@/i18n/LocaleProvider";

type CollectionToolbarProps = {
  activeFilter: string;
  onFilterChange: (id: string) => void;
  sort: string;
  onSortChange: (id: string) => void;
  resultCount: number;
};

export default function CollectionToolbar({
  activeFilter,
  onFilterChange,
  sort,
  onSortChange,
  resultCount,
}: CollectionToolbarProps) {
  const { t } = useT();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeSortLabel = t(`sort.${sortOptions.find((option) => option.id === sort)?.id ?? "featured"}`);

  return (
    <div className="sticky top-16 z-30 border-b border-background-200 bg-background-50/95 backdrop-blur md:top-20">
      <div className="mx-auto flex max-w-site flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8">
        <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-background-100 p-1">
          {collectionFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFilterChange(filter.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                activeFilter === filter.id
                  ? "bg-foreground-950 text-background-50"
                  : "text-foreground-600 hover:text-foreground-950"
              }`}
            >
              {t(`filter.${filter.id}`)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-500 whitespace-nowrap">
            {t("collection.items", { count: resultCount })}
          </span>

          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md border border-background-300 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-800 transition-colors hover:border-foreground-950 hover:bg-background-100 cursor-pointer"
            >
              <i className="ri-sort-desc text-sm" />
              <span className="whitespace-nowrap">{activeSortLabel}</span>
              <i
                className={`ri-arrow-down-s-line text-sm transition-transform ${
                  sortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-lg border border-background-200 bg-background-50 py-1 shadow-sm">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onSortChange(option.id);
                      setSortOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[12px] font-medium transition-colors cursor-pointer ${
                      sort === option.id
                        ? "bg-primary-100 text-foreground-950"
                        : "text-foreground-700 hover:bg-background-100"
                    }`}
                  >
                    {t(`sort.${option.id}`)}
                    {sort === option.id && <i className="ri-check-line text-primary-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}