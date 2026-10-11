"use client";

import type { CartItem } from "@/hooks/useCart";
import { formatVnd } from "@/mocks/products";
import { useT } from "@/i18n/LocaleProvider";

type OrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingReady: boolean;
};

export default function OrderSummary({
  items,
  subtotal,
  shippingFee,
  total,
  shippingReady,
}: OrderSummaryProps) {
  const { t } = useT();

  return (
    <div className="rounded-lg border border-background-200 bg-background-100 p-5 md:p-6">
      <h2 className="font-heading text-sm font-extrabold uppercase tracking-[0.16em] text-foreground-950">
        {t("checkout.summary")}
      </h2>

      {shippingReady && shippingFee === 0 && (
        <p className="mt-3 flex items-center gap-2 rounded-md bg-primary-100/70 px-3 py-2 text-[11px] font-semibold text-primary-900">
          <i className="ri-checkbox-circle-fill text-sm" />
          {t("checkout.summaryFree")}
        </p>
      )}

      <ul className="mt-5 flex flex-col divide-y divide-background-200">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3.5 py-4 first:pt-0">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md border border-background-200 bg-background-50">
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground-900 px-1 text-[10px] font-bold text-background-50">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col">
              <span className="font-heading text-[11px] font-extrabold uppercase tracking-[0.06em] text-foreground-950">
                {item.name}
              </span>
              <span className="mt-0.5 text-[11px] text-foreground-500">
                {item.color}
                {item.strap ? ` \u00b7 ${item.strap}` : ""}
              </span>
              <span className="mt-auto pt-2 text-[12px] font-bold text-foreground-950">
                {formatVnd(item.price * item.quantity)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2.5 border-t border-background-200 pt-4">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-foreground-600">{t("checkout.summarySubtotal")}</span>
          <span className="font-semibold text-foreground-950">{formatVnd(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-1.5 text-foreground-600">
            {t("checkout.summaryShipping")}
            <i className="ri-question-line text-xs text-foreground-400" />
          </span>
          <span className="font-semibold text-foreground-950">
            {!shippingReady ? t("checkout.processing") : shippingFee === 0 ? t("checkout.free") : formatVnd(shippingFee)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-background-200 pt-4">
        <span className="font-heading text-sm font-extrabold uppercase tracking-[0.12em] text-foreground-950">
          {t("checkout.summaryTotal")}
        </span>
        <span className="font-heading text-lg font-extrabold text-foreground-950">
          {shippingReady ? formatVnd(total) : t("checkout.processing")}
        </span>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-foreground-500">
        <i className="ri-shield-check-line mt-0.5 text-sm text-primary-700" />
        {t("checkout.summaryCod")}
      </p>
    </div>
  );
}