"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVnd } from "@/mocks/products";
import type { Product, ProductSku } from "@/mocks/products";
import { useT } from "@/i18n/LocaleProvider";

export type CartSelection = {
  color: string;
  quantity: number;
};

type ProductInfoProps = {
  product: Product;
  images: string[];
  active: number;
  onSelectImage: (index: number) => void;
  skus?: ProductSku[];
  skuIndex?: number;
  onSelectSku?: (index: number) => void;
  onAddToCart: (selection: CartSelection) => void;
  onBuyNow: (selection: CartSelection) => void;
  perks?: { shipping: string; returns: string; warranty: string };
};

export default function ProductInfo({
  product,
  images,
  active,
  onSelectImage,
  skus = [],
  skuIndex = 0,
  onSelectSku,
  onAddToCart,
  onBuyNow,
  perks,
}: ProductInfoProps) {
  const { t } = useT();
  const hasSkus = skus.length > 0;
  const sku = skus[skuIndex];
  const outOfStock = hasSkus && (sku?.inventory ?? 0) <= 0;
  const color = hasSkus
    ? (sku?.color?.name ?? sku?.name ?? "")
    : (product.colors[active]?.name ?? product.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);

  const hasDiscount =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;

  return (
    <div className="flex flex-col">
      <nav
        aria-label={t("common.breadcrumb")}
        className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-500"
      >
        <Link href="/" className="transition-colors hover:text-foreground-950">
          {t("product.home")}
        </Link>
        <span className="text-foreground-300">/</span>
        <Link href="/?filter=all#products" className="transition-colors hover:text-foreground-950">
          {t("product.bags")}
        </Link>
        <span className="text-foreground-300">/</span>
        <span aria-current="page" className="text-accent-700">{product.name}</span>
      </nav>

      <h1 className="font-heading text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-foreground-950 md:text-5xl">
        {product.name}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span
          className={`font-heading text-2xl font-extrabold ${
            hasDiscount ? "text-accent-600" : "text-foreground-950"
          }`}
        >
          {formatVnd(product.price)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-base font-medium text-foreground-400 line-through">
              {formatVnd(product.compareAtPrice as number)}
            </span>
            <span className="rounded-full bg-accent-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-800">
              {t("product.save", { percent: discountPercent })}
            </span>
          </>
        )}
      </div>

      <p className="mt-2 text-[12px] text-foreground-500">
        {t("product.taxNote")}
      </p>

      <div className="mt-7">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground-900">
            {t("product.colour")}
          </span>
          <span className="text-[11px] font-semibold text-foreground-500">{color}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          {hasSkus
            ? skus.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSku?.(i)}
                  aria-label={item.name}
                  title={item.name}
                  aria-pressed={i === skuIndex}
                  className={`relative h-16 w-14 overflow-hidden rounded-md border-2 transition-colors cursor-pointer ${
                    i === skuIndex
                      ? "border-foreground-950"
                      : "border-background-200 hover:border-foreground-400"
                  }`}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover object-top"
                    />
                  )}
                </button>
              ))
            : images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => onSelectImage(i)}
                  aria-label={t("product.viewImage", { n: i + 1, total: images.length })}
                  aria-pressed={i === active}
                  className={`relative h-16 w-14 overflow-hidden rounded-md border-2 transition-colors cursor-pointer ${
                    i === active
                      ? "border-foreground-950"
                      : "border-background-200 hover:border-foreground-400"
                  }`}
                >
                  <img
                    src={img}
                    alt={t("product.option", { name: product.name, n: i + 1 })}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                </button>
              ))}
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between rounded-md border border-background-300 px-2 py-1.5 sm:w-36">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label={t("cart.decrease")}
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-subtract-line" />
          </button>
          <span className="min-w-8 text-center text-sm font-bold text-foreground-950">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            aria-label={t("cart.increase")}
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-add-line" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart({ color, quantity })}
          disabled={outOfStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-foreground-950 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-shopping-bag-3-line text-base" />
          {outOfStock ? t("product.outOfStock") : t("product.addToBag")}
        </button>
      </div>

      <button
        type="button"
        onClick={() => onBuyNow({ color, quantity })}
        disabled={outOfStock}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-foreground-950 transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap cursor-pointer"
      >
        <i className="ri-flashlight-fill text-base" />
        {t("product.buyNow")}
      </button>

      <div className="mt-6 grid grid-cols-1 gap-3 rounded-lg bg-background-100 p-4 sm:grid-cols-3">
        {[
          { icon: "ri-truck-line", text: perks?.shipping || t("product.perk.ship") },
          { icon: "ri-refresh-line", text: perks?.returns || t("product.perk.returns") },
          { icon: "ri-shield-check-line", text: perks?.warranty || t("product.perk.warranty") },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2.5">
            <i className={`${item.icon} text-lg text-primary-700`} />
            <span className="text-[11px] font-semibold leading-snug text-foreground-700">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}