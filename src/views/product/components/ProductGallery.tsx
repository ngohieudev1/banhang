"use client";

import { useState } from "react";
import ImageLightbox from "./ImageLightbox";
import { useT } from "@/i18n/LocaleProvider";
import { hasMessage } from "@/i18n/translate";

type ProductGalleryProps = {
  images: string[];
  name: string;
  active: number;
  onChange: (index: number) => void;
  tag?: string;
  onSale?: boolean;
  skus?: Array<{ id: string; name: string; image: string }>;
  skuIndex?: number;
  onSelectSku?: (index: number) => void;
};

export default function ProductGallery({
  images,
  name,
  active,
  onChange,
  tag,
  onSale,
  skus = [],
  skuIndex = 0,
  onSelectSku,
}: ProductGalleryProps) {
  const { t, locale } = useT();
  const tagKey = tag ? `tag.${tag}` : "";
  const tagLabel = tag && hasMessage(locale, tagKey) ? t(tagKey) : tag;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gallery = images.filter(Boolean);
  const current = gallery[active] ?? gallery[0];

  const go = (next: number) => {
    if (gallery.length === 0) return;
    onChange((next + gallery.length) % gallery.length);
  };

  const others = gallery
    .map((img, index) => ({ img, index }))
    .filter((item) => item.index !== active)
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden bg-[#eee]">
        <div className="relative aspect-[4/5] w-full">
          {current && (
            <button
              type="button"
              onClick={() => setLightboxIndex(active)}
              aria-label={t("product.fullscreen")}
              className="absolute inset-0 h-full w-full cursor-zoom-in"
            >
              <img
                src={current}
                alt={t("product.galleryAlt", { name })}
                title={t("product.galleryTitle", { name })}
                className="h-full w-full object-contain"
              />
            </button>
          )}

          <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-1.5">
            {tag && (
              <span className="rounded-full bg-background-50/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground-800 backdrop-blur">
                {tagLabel}
              </span>
            )}
            {onSale && (
              <span className="rounded-full bg-accent-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-background-50">
                {t("card.sale")}
              </span>
            )}
          </div>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(active - 1)}
                aria-label={t("product.prevImage")}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background-50/85 text-foreground-900 backdrop-blur transition-colors hover:bg-background-50 cursor-pointer"
              >
                <i className="ri-arrow-left-s-line text-lg" />
              </button>
              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label={t("product.nextImage")}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background-50/85 text-foreground-900 backdrop-blur transition-colors hover:bg-background-50 cursor-pointer"
              >
                <i className="ri-arrow-right-s-line text-lg" />
              </button>
            </>
          )}
        </div>
      </div>

      {others.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {others.map(({ img, index }) => (
            <button
              key={img}
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={t("product.viewFullscreen", { n: index + 1, total: gallery.length })}
              className="relative aspect-[4/5] overflow-hidden bg-[#eee] cursor-zoom-in"
            >
              <img
                src={img}
                alt={t("product.view", { name, n: index + 1 })}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {skus.length > 1 && (
        <div className="mt-4 pt-4 border-t border-background-200">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-600">
            {t("product.otherSkus")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {skus.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSku?.(i)}
                aria-label={item.name}
                aria-pressed={i === skuIndex}
                className={`relative aspect-[4/5] overflow-hidden rounded-md border-2 transition-colors cursor-pointer ${
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
            ))}
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={gallery}
          name={name}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}