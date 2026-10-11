"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useT } from "@/i18n/LocaleProvider";
import LanguageSwitcher from "@/components/base/LanguageSwitcher";

const navLinks = [
  { key: "nav.shopAll", href: "/?filter=all#products" },
  { key: "nav.newArrivals", href: "/?filter=new#products" },
  { key: "nav.collections", href: "/?filter=all#products" },
  { key: "nav.lookbook", href: "/?filter=best#products" },
  { key: "nav.sale", href: "/?filter=sale#products" },
];

export default function SiteHeader() {
  const { t, brandName } = useT();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { count: cartCount, openCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setSearchOpen(false);
    router.push(`/?q=${encodeURIComponent(term)}#products`);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
        scrolled
          ? "bg-background-50/95 backdrop-blur border-b border-background-200"
          : "bg-background-50 border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 md:h-20 max-w-site items-center justify-between gap-1 md:gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-1 md:gap-4">
          <button
            type="button"
            aria-label={t("header.openMenu")}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground-900 transition-colors hover:bg-background-100 md:hidden cursor-pointer"
          >
            <i className={`text-xl ${menuOpen ? "ri-close-line" : "ri-menu-line"}`} />
          </button>

          <Link
            href="/"
            className="font-heading text-lg md:text-2xl font-extrabold uppercase tracking-[0.22em] text-foreground-950"
          >
            {brandName}
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="text-[12px] font-semibold uppercase tracking-[0.16em] text-foreground-700 transition-colors hover:text-foreground-950"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0 md:gap-2">
          <LanguageSwitcher className="mr-1" />
          <button
            type="button"
            aria-label={t("header.search")}
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground-900 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-search-line text-xl" />
          </button>
          <Link
            href="/account"
            aria-label={t("header.account")}
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground-900 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-user-line text-xl" />
          </Link>
          <button
            type="button"
            aria-label={t("header.openCart")}
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-foreground-900 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-shopping-bag-line text-xl" />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-foreground-950">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div id="site-search" className="border-t border-background-200 bg-background-50">
          <form
            role="search"
            onSubmit={handleSearch}
            className="mx-auto flex max-w-site items-center gap-2 px-4 py-3 md:px-8"
          >
            <label htmlFor="site-search-input" className="sr-only">
              {t("search.label")}
            </label>
            <i className="ri-search-line text-xl text-foreground-500" aria-hidden="true" />
            <input
              id="site-search-input"
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={100}
              autoComplete="off"
              placeholder={t("search.placeholder")}
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground-950 placeholder:text-foreground-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-foreground-950 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-background-50 whitespace-nowrap cursor-pointer"
            >
              {t("search.submit")}
            </button>
            <button
              type="button"
              aria-label={t("search.close")}
              onClick={() => setSearchOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-700 hover:bg-background-100 cursor-pointer"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-background-200 bg-background-50 md:hidden">
          <nav className="mx-auto flex max-w-site flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-background-100 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-foreground-800 last:border-b-0"
              >
                {t(link.key)}
                <i className="ri-arrow-right-up-line text-base text-foreground-400" />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}