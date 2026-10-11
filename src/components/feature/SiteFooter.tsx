"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useT } from "@/i18n/LocaleProvider";
import { ADMIN_URL } from "@/lib/payload";

const footerLinks: Record<string, string> = {
  bags: "/?filter=all#products",
  newArrivals: "/?filter=new#products",
  bestSellers: "/?filter=best#products",
  miniBags: "/?filter=mini#products",
  sale: "/?filter=sale#products",
  shipping: "/shipping",
  returns: "/returns",
  sizeGuide: "/size-guide",
  trackOrder: `${ADMIN_URL}/find-order`,
  about: "/about",
  stores: "/stores",
  contact: "/contact",
};

const footerColumns = [
  {
    title: "footer.col.shop",
    links: ["bags", "newArrivals", "bestSellers", "miniBags", "sale"],
  },
  {
    title: "footer.col.support",
    links: ["shipping", "returns", "sizeGuide", "trackOrder"],
  },
  {
    title: "footer.col.company",
    links: ["about", "stores", "contact"],
  },
];

const socials = [
  { icon: "ri-instagram-line", label: "Instagram" },
  { icon: "ri-facebook-circle-line", label: "Facebook" },
  { icon: "ri-tiktok-line", label: "TikTok" },
];

export default function SiteFooter() {
  const { t, brandName } = useT();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(formData.get("email") ?? "") }),
      });

      if (response.ok) {
        setStatus("success");
        setFormMessage(t("footer.thanks"));
        form.reset();
      } else {
        setStatus("error");
        setFormError(t("footer.errorGeneric"));
      }
    } catch {
      setStatus("error");
      setFormError(t("footer.errorNetwork"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-accent-950 text-background-100">
      <div className="mx-auto max-w-site px-4 py-14 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="max-w-md">
            <h2 className="font-heading text-2xl font-extrabold uppercase tracking-[0.2em] text-background-50">
              {brandName}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-background-200/80">
              {t("footer.tagline")}
            </p>

            <form
              id="newsletter-signup"
              onSubmit={handleSubmit}
              className="mt-8"
            >
              <label
                htmlFor="newsletter-email"
                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-primary-400"
              >
                {t("footer.joinList")}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  required
                  placeholder={t("footer.emailPlaceholder")}
                  className="w-full flex-1 rounded-md border border-background-100/20 bg-background-50/5 px-4 py-2.5 text-sm text-background-50 placeholder:text-background-200/50 focus:border-primary-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-950 transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? t("footer.sending") : t("footer.subscribe")}
                  <i className="ri-arrow-right-line" />
                </button>
              </div>

              <div className="mt-3 min-h-5 text-[12px]">
                {status === "success" && (
                  <p className="flex items-center gap-2 text-primary-400">
                    <i className="ri-check-line" />
                    {formMessage}
                  </p>
                )}
                {status === "error" && (
                  <p className="flex items-center gap-2 text-background-200">
                    <i className="ri-error-warning-line" />
                    {formError}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-primary-400">
                  {t(column.title)}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link
                        href={footerLinks[link]}
                        className="text-[13px] text-background-200/80 transition-colors hover:text-background-50"
                      >
                        {t(`footer.link.${link}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-background-100/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] uppercase tracking-[0.14em] text-background-200/60">
            {t("footer.rights")}
          </p>

          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href="/"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-background-100/20 text-background-100 transition-colors hover:border-primary-400 hover:text-primary-400"
              >
                <i className={`${social.icon} text-base`} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}