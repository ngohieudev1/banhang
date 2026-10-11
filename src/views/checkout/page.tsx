"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatVnd } from "@/mocks/products";
import {
  shippingCountries,
  shippingMethods,
  vietnamCities,
} from "@/mocks/checkout";
import CheckoutHeader from "./components/CheckoutHeader";
import CheckoutField from "./components/CheckoutField";
import OrderSummary from "./components/OrderSummary";
import { useT } from "@/i18n/LocaleProvider";

export default function CheckoutPage() {
  const { t } = useT();
  const { items, subtotal, clearCart, closeCart } = useCart();

  const shippingMethodId = "standard";
  const [shippingQuote, setShippingQuote] = useState<{ key: string; fee: number } | null>(null);
  const productKey = JSON.stringify([...new Set(items.map((item) => item.productId))].sort());
  const [billingSame, setBillingSame] = useState(true);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    closeCart();
    window.scrollTo({ top: 0 });
  }, [closeCart]);

  const selectedMethod =
    shippingMethods.find((method) => method.id === shippingMethodId) ?? shippingMethods[0];

  useEffect(() => {
    if (productKey === "[]") return;
    const controller = new AbortController();
    fetch("/api/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: JSON.parse(productKey) }),
      signal: controller.signal,
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok || typeof result.shippingFee !== "number") throw new Error("shipping");
      setShippingQuote({ key: productKey, fee: result.shippingFee });
    }).catch(() => {
      if (!controller.signal.aborted) setFormError(t("checkout.errorGeneric"));
    });
    return () => controller.abort();
  }, [productKey, t]);

  const shippingReady = shippingQuote?.key === productKey;
  const shippingFee = shippingReady ? shippingQuote.fee : 0;
  const total = subtotal + shippingFee;

  const orderItemsText = useMemo(
    () =>
      items
        .map(
          (item) =>
            `${item.quantity} x ${item.name} (${item.color}${
              item.strap ? `, ${item.strap}` : ""
            }${item.skuCode ? `, SKU ${item.skuCode}` : ""}) = ${formatVnd(item.price * item.quantity)}`,
        )
        .join(" | "),
    [items],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!shippingReady || submitting) return;
    const form = event.currentTarget;
    const formData = new FormData(form);

    const field = (name: string) => String(formData.get(name) ?? "");

    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: field("email"),
          firstName: field("first_name"),
          lastName: field("last_name"),
          address: field("address"),
          apartment: field("apartment"),
          city: field("city"),
          postalCode: field("postal_code"),
          phone: field("phone"),
          country: field("country"),
          shippingMethodId,
          items: items.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            color: item.color,
            quantity: item.quantity,
          })),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        orderNumber?: string;
        error?: string;
      } | null;

      if (response.ok && result?.ok && result.orderNumber) {
        setOrderNumber(result.orderNumber);
        setStatus("success");
        clearCart();
        window.scrollTo({ top: 0 });
      } else {
        setStatus("error");
        setFormError(
          result?.error === "out_of_stock"
            ? t("checkout.errorStock")
            : t("checkout.errorGeneric"),
        );
      }
    } catch {
      setStatus("error");
      setFormError(t("checkout.errorNetwork"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <CheckoutHeader />

      <main className="flex-1">
        {status === "success" ? (
          <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center md:py-24">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-800">
              <i className="ri-checkbox-circle-fill text-3xl" />
            </span>
            <h1 className="mt-6 font-heading text-2xl font-extrabold uppercase tracking-[0.1em] text-foreground-950 md:text-3xl">
              {t("checkout.successTitle")}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-foreground-600">
              {t("checkout.successBody")}
            </p>

            <div className="mt-6 w-full rounded-lg border border-background-200 bg-background-100 px-5 py-4 text-left">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-foreground-600">{t("checkout.orderNumber")}</span>
                <span className="font-heading font-extrabold tracking-[0.08em] text-foreground-950">
                  {orderNumber}
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[12px]">
                <span className="text-foreground-600">{t("checkout.paymentMethod")}</span>
                <span className="font-semibold text-foreground-950">{t("checkout.codShort")}</span>
              </div>
            </div>

            <p className="mt-5 flex items-start gap-2 rounded-md bg-primary-100/60 px-4 py-3 text-left text-[11px] leading-relaxed text-primary-900">
              <i className="ri-whatsapp-line mt-0.5 text-sm" />
              {t("checkout.callNote")}
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-foreground-950 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-background-50 transition-colors hover:bg-foreground-800 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line" />
              {t("checkout.continue")}
            </Link>
          </section>
        ) : items.length === 0 ? (
          <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center md:py-28">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-100">
              <i className="ri-shopping-bag-3-line text-3xl text-foreground-400" />
            </span>
            <h1 className="mt-6 font-heading text-lg font-extrabold uppercase tracking-[0.14em] text-foreground-900">
              {t("checkout.emptyTitle")}
            </h1>
            <p className="mt-2 text-sm text-foreground-500">
              {t("checkout.emptyBody")}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-foreground-950 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-background-50 transition-colors hover:bg-foreground-800 whitespace-nowrap cursor-pointer"
            >
              {t("checkout.explore")}
            </Link>
          </section>
        ) : (
          <div className="mx-auto max-w-site px-4 py-8 md:px-8 md:py-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
              <form
                data-readdy-form
                id="cod-checkout"
                onSubmit={handleSubmit}
                className="flex flex-col gap-8"
              >
                {/* Contact */}
                <section>
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-foreground-950">
                      {t("checkout.contact")}
                    </h2>
                    <Link
                      href="/account"
                      className="text-[12px] font-semibold text-accent-700 underline-offset-2 hover:underline"
                    >
                      {t("checkout.login")}
                    </Link>
                  </div>
                  <div className="mt-3">
                    <CheckoutField
                      label={t("checkout.emailOrPhone")}
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder={t("checkout.emailPlaceholder")}
                    />
                  </div>
                </section>

                {/* Shipping */}
                <section>
                  <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-foreground-950">
                    {t("checkout.shipping")}
                  </h2>

                  <div className="mt-3 flex flex-col gap-3">
                    <div className="rounded-md border border-background-300 bg-background-50 px-3.5 py-2.5 transition-colors focus-within:border-foreground-900">
                      <label
                        htmlFor="country"
                        className="block text-[10px] font-bold uppercase tracking-[0.12em] text-foreground-500"
                      >
                        {t("checkout.country")}
                      </label>
                      <select
                        id="country"
                        name="country"
                        defaultValue="vn"
                        className="mt-1 w-full bg-transparent text-sm text-foreground-950 outline-none cursor-pointer"
                      >
                        {shippingCountries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {t(`checkout.country.${country.id}`)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <CheckoutField
                        label={t("checkout.firstName")}
                        name="first_name"
                        autoComplete="given-name"
                      />
                      <CheckoutField
                        label={t("checkout.lastName")}
                        name="last_name"
                        required
                        autoComplete="family-name"
                      />
                    </div>

                    <CheckoutField
                      label={t("checkout.address")}
                      name="address"
                      required
                      autoComplete="street-address"
                    />
                    <CheckoutField
                      label={t("checkout.apartment")}
                      name="apartment"
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <CheckoutField
                        label={t("checkout.city")}
                        name="city"
                        required
                        autoComplete="address-level2"
                        placeholder={vietnamCities[0]}
                      />
                      <CheckoutField
                        label={t("checkout.postalOptional")}
                        name="postal_code"
                        autoComplete="postal-code"
                      />
                    </div>

                    <CheckoutField
                      label={t("checkout.phone")}
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="090 123 4567"
                    />

                    <label className="mt-1 flex items-center gap-2.5 text-[12px] text-foreground-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="save_info"
                        value="true"
                        className="h-4 w-4 rounded border-background-400 accent-primary-600 cursor-pointer"
                      />
                      {t("checkout.saveInfo")}
                    </label>
                  </div>
                </section>

                {/* Shipping method */}
                <section>
                  <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-foreground-950">
                    {t("checkout.shippingMethod")}
                  </h2>
                  <div className="mt-3 flex flex-col gap-2.5">
                    {shippingMethods.filter((method) => method.id === "standard").map((method) => {
                      const active = method.id === shippingMethodId;
                      const fee = shippingFee;
                      return (
                        <button
                          type="button"
                          key={method.id}
                          className={`flex items-center justify-between rounded-md border px-4 py-3.5 text-left transition-colors cursor-pointer ${
                            active
                              ? "border-foreground-900 bg-background-100"
                              : "border-background-300 bg-background-50 hover:border-foreground-500"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                active ? "border-foreground-900" : "border-background-400"
                              }`}
                            >
                              {active && (
                                <span className="h-2 w-2 rounded-full bg-foreground-900" />
                              )}
                            </span>
                            <span className="flex flex-col">
                              <span className="text-[13px] font-bold text-foreground-950">
                                {t(`checkout.method.${method.id}`)}
                              </span>
                              <span className="text-[11px] text-foreground-500">
                                {t(`checkout.method.${method.id}.desc`)}
                              </span>
                            </span>
                          </span>
                          <span className="text-[13px] font-bold text-foreground-950">
                            {!shippingReady ? t("checkout.processing") : fee === 0 ? t("checkout.free") : formatVnd(fee)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Payment */}
                <section>
                  <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-foreground-950">
                    {t("checkout.payment")}
                  </h2>
                  <p className="mt-1 text-[12px] text-foreground-500">
                    {t("checkout.paymentSecure")}
                  </p>

                  <div className="mt-3 overflow-hidden rounded-md border border-foreground-900">
                    <div className="flex items-center gap-3 bg-background-100 px-4 py-3.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-foreground-900">
                        <span className="h-2 w-2 rounded-full bg-foreground-900" />
                      </span>
                      <span className="text-[13px] font-bold text-foreground-950">
                        {t("checkout.cod")}
                      </span>
                    </div>
                    <div className="border-t border-background-200 bg-background-100/60 px-4 py-3">
                      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-foreground-600">
                        <i className="ri-information-line mt-0.5 text-sm text-primary-700" />
                        {t("checkout.summaryCod")}
                      </p>
                    </div>
                  </div>
                  <input type="hidden" name="payment_method" value="COD" />
                </section>

                {/* Billing address */}
                <section>
                  <h2 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-foreground-950">
                    {t("checkout.billing")}
                  </h2>
                  <div className="mt-3 overflow-hidden rounded-md border border-foreground-900">
                    <button
                      type="button"
                      onClick={() => setBillingSame(true)}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer ${
                        billingSame ? "bg-background-100" : "bg-background-50"
                      }`}
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-foreground-900">
                        {billingSame && <span className="h-2 w-2 rounded-full bg-foreground-900" />}
                      </span>
                      <span className="text-[13px] font-semibold text-foreground-950">
                        {t("checkout.billingSame")}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingSame(false)}
                      className={`flex w-full items-center gap-3 border-t border-background-200 px-4 py-3.5 text-left transition-colors cursor-pointer ${
                        billingSame ? "bg-background-50" : "bg-background-100"
                      }`}
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-foreground-900">
                        {!billingSame && (
                          <span className="h-2 w-2 rounded-full bg-foreground-900" />
                        )}
                      </span>
                      <span className="text-[13px] font-semibold text-foreground-950">
                        {t("checkout.billingDifferent")}
                      </span>
                    </button>
                  </div>

                  {!billingSame && (
                    <div className="mt-3 flex flex-col gap-3">
                      <CheckoutField label={t("checkout.billingAddress")} name="billing_address" />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <CheckoutField label={t("checkout.city")} name="billing_city" />
                        <CheckoutField label={t("checkout.postal")} name="billing_postal_code" />
                      </div>
                    </div>
                  )}
                </section>

                {/* Hidden order payload */}
                <input type="hidden" name="order_items" value={orderItemsText} />
                <input type="hidden" name="order_subtotal" value={String(subtotal)} />
                <input type="hidden" name="order_shipping_fee" value={String(shippingFee)} />
                <input type="hidden" name="order_total" value={String(total)} />
                <input type="hidden" name="shipping_method" value={selectedMethod.label} />

                <div>
                  <button
                    type="submit"
                    disabled={submitting || !shippingReady}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground-950 px-6 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-lock-2-line text-base" />
                    {submitting ? t("checkout.processing") : t("checkout.complete")}
                  </button>

                  {formError && (
                    <p className="mt-3 flex items-start gap-2 rounded-md bg-background-100 px-3.5 py-2.5 text-[12px] leading-relaxed text-accent-700">
                      <i className="ri-error-warning-line mt-0.5 text-sm" />
                      {formError}
                    </p>
                  )}

                  <p className="mt-3 text-center text-[11px] leading-relaxed text-foreground-500">
                    {t("checkout.agreePrefix")}
                    <Link href="/" className="underline underline-offset-2 hover:text-foreground-800">
                      {t("checkout.terms")}
                    </Link>
                    {t("checkout.and")}
                    <Link href="/" className="underline underline-offset-2 hover:text-foreground-800">
                      {t("checkout.privacy")}
                    </Link>
                    {t("checkout.agreeSuffix")}
                  </p>
                </div>
              </form>

              <aside className="order-first lg:order-last">
                <div className="lg:sticky lg:top-24">
                  <OrderSummary
                    items={items}
                    subtotal={subtotal}
                    shippingFee={shippingFee}
                    total={total}
                    shippingReady={shippingReady}
                  />
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-background-200 bg-background-50">
        <div className="mx-auto flex max-w-site flex-col gap-2 px-4 py-6 text-[11px] text-foreground-500 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <span>{t("footer.rights")}</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-colors hover:text-foreground-900">
              {t("checkout.refund")}
            </Link>
            <Link href="/" className="transition-colors hover:text-foreground-900">
              {t("checkout.shippingLink")}
            </Link>
            <Link href="/" className="transition-colors hover:text-foreground-900">
              {t("checkout.contactLink")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}