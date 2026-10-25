"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/mocks/products";
import { formatVnd } from "@/mocks/products";
import { useCart } from "@/hooks/useCart";
import { useT } from "@/i18n/LocaleProvider";
import { hasMessage } from "@/i18n/translate";

type ProductCardProps = {
  product: Product;
  index?: number;
  onQuickAdd?: (product: Product) => void;
};

export default function ProductCard({ product, index = 0, onQuickAdd }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { t, locale } = useT();
  const tagKey = product.tag ? `tag.${product.tag}` : "";
  const tagLabel = product.tag && hasMessage(locale, tagKey) ? t(tagKey) : product.tag;
  const hasDiscount =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;
  const detailUrl = `/products/${product.id}`;

  const handleQuickAdd = () => {
    setAdded(true);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: product.colors[0]?.name ?? t("card.defaultColor"),
      inventory: product.skus?.[0]?.inventory,
    });
    onQuickAdd?.(product);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article
      data-product-shop
      className="group flex flex-col cf-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-background-100">
        <Link href={detailUrl} className="absolute inset-0 block" aria-label={t("card.view", { name: product.name })}>
          <img
            src={product.image}
            alt={t("card.alt", { name: product.name })}
            title={t("card.title", { name: product.name })}
            className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 group-hover:opacity-0"
          />
          <img
            src={product.hoverImage}
            alt={t("card.altHover", { name: product.name })}
            title={t("card.titleHover", { name: product.name })}
            className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.tag && (
            <span className="rounded-full bg-background-50/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground-800 backdrop-blur">
              {tagLabel}
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-background-50">
              {t("card.sale")}
            </span>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors whitespace-nowrap cursor-pointer ${
              added
                ? "bg-accent-500 text-background-50"
                : "bg-foreground-950 text-background-50 hover:bg-foreground-800"
            }`}
          >
            <i className={added ? "ri-check-line" : "ri-add-line"} />
            {added ? t("card.added") : t("card.quickAdd")}
          </button>
        </div>
      </div>

      <Link href={detailUrl} className="flex flex-col gap-1.5 pt-3.5">
        <h3 className="font-heading text-[12px] font-extrabold uppercase tracking-[0.08em] text-foreground-950 transition-colors group-hover:text-accent-700">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-semibold ${hasDiscount ? "text-accent-600" : "text-foreground-700"}`}>
            {formatVnd(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] font-medium text-foreground-400 line-through">
              {formatVnd(product.compareAtPrice as number)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          {product.colors.map((color) => (
            <span
              key={color.name}
              title={color.name}
              className="h-3.5 w-3.5 rounded-[3px] border border-foreground-950/15"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </Link>
    </article>
  );
}
