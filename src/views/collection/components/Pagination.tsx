"use client";

import { useT } from "@/i18n/LocaleProvider";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const { t } = useT();
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label={t("pagination.aria")}
      className="flex items-center justify-center gap-2 border-t border-background-200 py-8"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-background-300 text-foreground-800 transition-colors hover:border-foreground-950 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        aria-label={t("pagination.prev")}
      >
        <i className="ri-arrow-left-s-line text-lg" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`h-9 min-w-9 rounded-md px-3 text-[12px] font-bold transition-colors cursor-pointer ${
            p === page
              ? "bg-foreground-950 text-background-50"
              : "border border-background-300 text-foreground-700 hover:border-foreground-950"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-background-300 text-foreground-800 transition-colors hover:border-foreground-950 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        aria-label={t("pagination.next")}
      >
        <i className="ri-arrow-right-s-line text-lg" />
      </button>
    </nav>
  );
}