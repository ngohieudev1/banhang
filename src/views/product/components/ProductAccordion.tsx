"use client";

import { useState } from "react";

type AccordionSection = {
  id: string;
  title: string;
  icon: string;
  body: string[];
};

type ProductAccordionProps = {
  highlights: string[];
  material: string;
  dimensions: string;
  strapDrop: string;
  shipping: string;
  warranty: string;
};

export default function ProductAccordion({
  highlights,
  material,
  dimensions,
  strapDrop,
  shipping,
  warranty,
}: ProductAccordionProps) {
  const [openId, setOpenId] = useState("highlights");

  const sections: AccordionSection[] = [
    { id: "highlights", title: "Highlights", icon: "ri-sparkling-line", body: highlights },
    {
      id: "materials",
      title: "Materials & dimensions",
      icon: "ri-ruler-2-line",
      body: [material, dimensions, strapDrop],
    },
    { id: "shipping", title: "Shipping & returns", icon: "ri-truck-line", body: [shipping, warranty] },
  ];

  return (
    <div className="mt-8 border-t border-background-200">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id} className="border-b border-background-200">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? "" : section.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <i className={`${section.icon} text-base text-primary-700`} />
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-foreground-950">
                  {section.title}
                </span>
              </span>
              <i
                className={`ri-add-line text-lg text-foreground-500 transition-transform ${
                  isOpen ? "rotate-45" : "rotate-0"
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <ul className="flex flex-col gap-2 pb-5 pl-7">
                  {section.body.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-[13px] leading-relaxed text-foreground-600"
                    >
                      <i className="ri-checkbox-blank-circle-fill mt-1.5 text-[5px] text-accent-500" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}