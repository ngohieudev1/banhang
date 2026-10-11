"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/LocaleProvider";

type ImageLightboxProps = {
  images: string[];
  name: string;
  startIndex: number;
  onClose: () => void;
};

export default function ImageLightbox({ images, name, startIndex, onClose }: ImageLightboxProps) {
  const { t } = useT();
  const [current, setCurrent] = useState(startIndex);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    slideRefs.current[startIndex]?.scrollIntoView({ block: "start" });
  }, [startIndex]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrent(Number((entry.target as HTMLElement).dataset.index));
          }
        });
      },
      { root, threshold: 0.6 },
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [images]);

  useEffect(() => {
    thumbRefs.current[current]?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const goTo = (index: number) => {
    slideRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("product.imagesLabel", { name })}
      className="fixed inset-0 z-[100] flex bg-[#eee]"
    >
      <div ref={scrollRef} className="h-full flex-1 overflow-y-auto">
        {images.map((img, i) => (
          <div
            key={img}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            data-index={i}
            className="flex h-screen w-full items-center justify-center p-4 md:pr-28"
          >
            <img
              src={img}
              alt={t("product.view", { name, n: i + 1 })}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>

      <div className="absolute right-0 top-0 flex h-full w-20 flex-col gap-2 overflow-y-auto bg-background-50/80 p-2 backdrop-blur md:w-24">
        {images.map((img, i) => (
          <button
            key={img}
            type="button"
            ref={(el) => {
              thumbRefs.current[i] = el;
            }}
            onClick={() => goTo(i)}
            aria-label={t("product.goToImage", { n: i + 1, total: images.length })}
            aria-current={i === current}
            className={`relative aspect-[4/5] w-full shrink-0 overflow-hidden border-2 bg-[#eee] cursor-pointer ${
              i === current ? "border-foreground-950" : "border-transparent hover:border-foreground-400"
            }`}
          >
            <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={t("product.close")}
        className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background-50 text-foreground-950 shadow cursor-pointer"
      >
        <i className="ri-close-line text-xl" />
      </button>
    </div>
  );
}
