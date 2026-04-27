'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: readonly FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={item.q}
            className={`overflow-hidden rounded-2xl border transition-all ${
              isOpen
                ? 'border-[#0E1541]/20 bg-white shadow-[0_4px_30px_-12px_rgba(14,21,65,0.15)]'
                : 'border-[#0E1541]/10 bg-white/60 hover:border-[#0E1541]/20 hover:bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[16px] font-semibold text-[#0E1541] sm:text-[17px]">
                {item.q}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#0E1541]/60 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-[15px] leading-relaxed text-[#0E1541]/70">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
