"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useT } from "@/i18n/LocaleProvider";
import type { ReviewSummary } from "@/lib/reviews";

type ProductReviewsProps = {
  slug: string;
  summary: ReviewSummary;
};

const STARS = [1, 2, 3, 4, 5];

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5 text-accent-600" aria-hidden="true">
      {STARS.map((n) => (
        <i key={n} className={n <= Math.round(value) ? "ri-star-fill" : "ri-star-line"} />
      ))}
    </span>
  );
}

const fieldClass =
  "mt-1.5 w-full rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-sm text-foreground-950 placeholder:text-foreground-400 focus:border-foreground-950 focus:outline-none";
const labelClass = "block text-[11px] font-bold uppercase tracking-[0.14em] text-foreground-900";

export default function ProductReviews({ slug, summary }: ProductReviewsProps) {
  const { t, locale } = useT();
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dateFormat = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const countLabel =
    summary.count === 1 ? t("reviews.countOne") : t("reviews.count", { count: summary.count });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (rating < 1) {
      setStatus("error");
      setMessage(t("reviews.errorRating"));
      return;
    }

    setSubmitting(true);
    setStatus("idle");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          rating,
          authorName: String(formData.get("authorName") ?? ""),
          comment: String(formData.get("comment") ?? ""),
        }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage(t("reviews.thanks"));
        setRating(0);
        form.reset();
      } else {
        setStatus("error");
        setMessage(t("reviews.errorGeneric"));
      }
    } catch {
      setStatus("error");
      setMessage(t("reviews.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="mx-auto max-w-site scroll-mt-28 border-t border-background-200 px-4 py-12 md:px-8 md:py-16"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h2
            id="reviews-title"
            className="font-heading text-2xl font-extrabold uppercase tracking-[-0.02em] text-foreground-950 md:text-3xl"
          >
            {t("reviews.title")}
          </h2>

          {summary.count > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <Stars value={summary.average} />
              <span
                className="text-sm font-semibold text-foreground-900"
                aria-label={t("reviews.stars", { rating: summary.average })}
              >
                {summary.average}
              </span>
              <span className="text-sm text-foreground-500">{countLabel}</span>
            </div>
          )}

          {summary.count === 0 ? (
            <p className="mt-6 text-sm text-foreground-600">{t("reviews.empty")}</p>
          ) : (
            <ul className="mt-6 flex flex-col">
              {summary.reviews.map((review) => (
                <li key={review.id} className="border-t border-background-200 py-5 first:border-t-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars value={review.rating} />
                    <span className="sr-only">{t("reviews.stars", { rating: review.rating })}</span>
                    <span className="text-sm font-bold text-foreground-950">{review.authorName}</span>
                    <time
                      dateTime={review.createdAt}
                      className="text-[12px] text-foreground-500"
                    >
                      {dateFormat.format(new Date(review.createdAt))}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-foreground-700">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-5" noValidate>
          <h3 className="font-heading text-base font-extrabold uppercase tracking-[0.12em] text-foreground-950">
            {t("reviews.write")}
          </h3>

          <div className="mt-5 flex flex-col gap-4">
            <fieldset>
              <legend className={labelClass}>{t("reviews.rating")}</legend>
              <div className="mt-2 flex items-center gap-1">
                {STARS.map((n) => (
                  <label key={n} className="cursor-pointer text-2xl text-accent-600">
                    <input
                      type="radio"
                      name="rating"
                      value={n}
                      checked={rating === n}
                      onChange={() => setRating(n)}
                      className="peer sr-only"
                    />
                    <span className="sr-only">{t("reviews.ratingOption", { n })}</span>
                    <i
                      aria-hidden="true"
                      className={`block rounded peer-focus-visible:ring-2 peer-focus-visible:ring-foreground-950 ${
                        n <= rating ? "ri-star-fill" : "ri-star-line"
                      }`}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="review-name" className={labelClass}>
                {t("reviews.name")}
              </label>
              <input
                id="review-name"
                name="authorName"
                type="text"
                required
                maxLength={80}
                autoComplete="name"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="review-comment" className={labelClass}>
                {t("reviews.comment")}
              </label>
              <textarea
                id="review-comment"
                name="comment"
                required
                rows={5}
                maxLength={2000}
                placeholder={t("reviews.commentPlaceholder")}
                className={`${fieldClass} resize-y`}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-foreground-950 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {submitting ? t("reviews.sending") : t("reviews.submit")}
            </button>

            <div className="min-h-5 text-[12px]" role="status" aria-live="polite">
              {status === "success" && (
                <p className="flex items-center gap-2 text-foreground-800">
                  <i className="ri-check-line" />
                  {message}
                </p>
              )}
              {status === "error" && (
                <p className="flex items-center gap-2 text-accent-700">
                  <i className="ri-error-warning-line" />
                  {message}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
