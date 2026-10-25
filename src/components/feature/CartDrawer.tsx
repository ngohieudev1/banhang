"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatVnd } from "@/mocks/products";
import { useT } from "@/i18n/LocaleProvider";

const FREE_SHIP_THRESHOLD = 450000;

export default function CartDrawer() {
  const { t } = useT();
  const { items, count, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
    return undefined;
  }, [isOpen]);

  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100));

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-foreground-950/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.aria")}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background-50 shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-background-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <i className="ri-shopping-bag-3-line text-xl text-foreground-950" />
            <h2 className="font-heading text-sm font-extrabold uppercase tracking-[0.16em] text-foreground-950">
              {t("cart.title")}
            </h2>
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-bold text-primary-800">
              {count}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label={t("cart.close")}
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-700 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {count > 0 && (
          <div className="border-b border-background-200 bg-background-100 px-5 py-3">
            <p className="text-[11px] font-semibold text-foreground-700">
              {remaining > 0 ? (
                <>
                  {t("cart.addPrefix")}{" "}
                  <span className="font-bold text-foreground-950">{formatVnd(remaining)}</span>{" "}
                  {t("cart.addSuffix")}
                </>
              ) : (
                <span className="flex items-center gap-1.5 text-primary-800">
                  <i className="ri-checkbox-circle-fill" />
                  {t("cart.unlocked")}
                </span>
              )}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-300">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-100">
                <i className="ri-shopping-bag-3-line text-3xl text-foreground-400" />
              </span>
              <p className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-foreground-800">
                {t("cart.empty")}
              </p>
              <p className="max-w-[240px] text-[13px] text-foreground-500">
                {t("cart.emptyHint")}
              </p>
              <Link
                href="/"
                onClick={closeCart}
                className="mt-2 rounded-md bg-foreground-950 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-background-50 whitespace-nowrap cursor-pointer"
              >
                {t("cart.shop")}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-background-200">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${item.productId}`}
                    onClick={closeCart}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-background-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover object-top"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/products/${item.productId}`}
                        onClick={closeCart}
                        className="font-heading text-[12px] font-extrabold uppercase tracking-[0.06em] text-foreground-950 transition-colors hover:text-accent-700"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={t("cart.remove", { name: item.name })}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground-400 transition-colors hover:bg-background-100 hover:text-foreground-800 cursor-pointer"
                      >
                        <i className="ri-delete-bin-6-line text-base" />
                      </button>
                    </div>

                    <p className="mt-1 text-[11px] font-medium text-foreground-500">
                      {item.color}
                      {item.strap ? ` \u00b7 ${item.strap}` : ""}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-md border border-background-300">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={t("cart.decrease")}
                          className="flex h-7 w-7 items-center justify-center text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
                        >
                          <i className="ri-subtract-line text-sm" />
                        </button>
                        <span className="min-w-7 text-center text-[12px] font-bold text-foreground-950">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= Math.min(10, item.inventory ?? 10)}
                          aria-label={t("cart.increase")}
                          className="flex h-7 w-7 items-center justify-center text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <i className="ri-add-line text-sm" />
                        </button>
                      </div>
                      <span className="text-[12px] font-bold text-foreground-950">
                        {formatVnd(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-background-200 bg-background-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-600">
                {t("cart.subtotal")}
              </span>
              <span className="font-heading text-lg font-extrabold text-foreground-950">
                {formatVnd(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-foreground-500">
              {t("cart.taxNote")}
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-foreground-950 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-background-50 transition-colors hover:bg-foreground-800 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-lock-line text-base" />
              {t("cart.checkout")}
            </Link>

            <button
              type="button"
              onClick={closeCart}
              className="mt-2 w-full rounded-md border border-background-300 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-800 transition-colors hover:border-foreground-950 whitespace-nowrap cursor-pointer"
            >
              {t("cart.continue")}
            </button>

          </div>
        )}
      </aside>
    </div>
  );
}
