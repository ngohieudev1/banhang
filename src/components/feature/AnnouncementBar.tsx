"use client";

import { createContext, useContext } from "react";

export const AnnouncementsContext = createContext<string[]>([]);

export default function AnnouncementBar() {
  const messages = useContext(AnnouncementsContext);
  if (!messages.length) return null;
  const loop = [...messages, ...messages];

  return (
    <div className="w-full bg-accent-950 text-background-50 overflow-hidden">
      <div className="flex w-max animate-cf-marquee">
        {loop.map((msg, index) => (
          <span
            key={`${msg}-${index}`}
            className="flex items-center gap-3 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap"
          >
            <i className="ri-truck-line text-[13px] text-primary-400" />
            {msg}
            <span className="text-primary-400/70">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
