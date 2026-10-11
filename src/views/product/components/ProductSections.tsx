"use client";

import { useState } from "react";
import { useT } from "@/i18n/LocaleProvider";
import { hasMessage } from "@/i18n/translate";

type Section = {
  id: string;
  title: string;
  lines?: string[];
  rows?: [string, string][];
};

type ProductSectionsProps = {
  story: string;
  highlights: string[];
  details: [string, string][];
  legal: [string, string][];
};

export default function ProductSections({ story, highlights, details, legal }: ProductSectionsProps) {
  const { t, locale } = useT();
  const [openId, setOpenId] = useState("story");

  // Dữ liệu từ API là chuỗi gốc; dịch khi có sẵn bản dịch, không thì giữ nguyên.
  const tr = (prefix: string, text: string) => {
    const key = `${prefix}.${text}`;
    return hasMessage(locale, key) ? t(key) : text;
  };
  const translateRows = (rows: [string, string][]): [string, string][] =>
    rows.map(([label, value]) => [tr("spec.label", label), tr("spec.value", value)]);

  const sections: Section[] = [
    { id: "story", title: t("product.section.story"), lines: [story] },
    { id: "set", title: t("product.section.set"), lines: highlights },
    { id: "details", title: t("product.section.details"), rows: translateRows(details) },
    { id: "legal", title: t("product.section.legal"), rows: translateRows(legal) },
  ];

  return (
    <div className="mt-8 border-t border-background-300">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id} className="border-b border-background-300">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? "" : section.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-left cursor-pointer"
            >
              <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-foreground-950">
                {section.title}
              </span>
              <i
                className={`ri-add-line text-lg text-foreground-500 transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                {section.lines && (
                  <div className="flex flex-col gap-2 pb-5">
                    {section.lines.map((line) => (
                      <p key={line} className="text-[13px] leading-relaxed text-foreground-600">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
                {section.rows && (
                  <dl className="pb-5 text-[13px]">
                    {section.rows.map(([label, value]) => (
                      <div
                        key={label}
                        className="grid grid-cols-3 gap-4 border-t border-background-200 py-2.5 first:border-t-0"
                      >
                        <dt className="font-semibold text-foreground-900">{label}</dt>
                        <dd className="col-span-2 text-foreground-600">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
