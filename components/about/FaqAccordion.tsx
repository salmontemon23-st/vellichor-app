"use client";

import { useState } from "react";
import { IconChevron } from "./AboutIcons";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={open}
            >
              <span className="font-display text-base font-normal text-ink sm:text-lg">
                {item.question}
              </span>
              <IconChevron
                className={`h-4 w-4 shrink-0 text-ink-dim transition-transform ${open ? "rotate-180 text-amber-deep" : ""}`}
              />
            </button>
            <div
              className={`grid overflow-hidden transition-all duration-200 ease-out ${
                open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <p className="min-h-0 text-sm leading-relaxed text-ink-dim">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
