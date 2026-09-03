"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

export default function InfoTip({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const id = useId();
  const btnRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const place = useCallback(() => {
    const anchor = btnRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;
    const rect = anchor.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const gap = 8;
    let left = rect.right - tipRect.width;
    let top = rect.bottom + gap;
    if (left < 8) left = 8;
    if (left + tipRect.width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - tipRect.width - 8);
    }
    if (top + tipRect.height > window.innerHeight - 8) {
      top = rect.top - tipRect.height - gap;
    }
    if (top < 8) top = 8;
    setPos({ left, top });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    place();
    const onScroll = () => place();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, place]);

  return (
    <>
      <span
        ref={btnRef}
        className="inline-flex h-4 w-4 rounded-full border border-line text-[10px] text-mist hover:text-chalk hover:border-mist items-center justify-center shrink-0 cursor-help"
        aria-label={`About ${label}`}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        i
      </span>
      {open ? (
        <div
          ref={tipRef}
          id={id}
          role="tooltip"
          className="fixed z-[60] max-w-xs text-[12px] leading-relaxed text-chalk bg-panel border border-line rounded-xl px-3 py-2 shadow-xl shadow-black/10 dark:shadow-black/50 pointer-events-none"
          style={{ left: pos.left, top: pos.top }}
        >
          {text}
        </div>
      ) : null}
    </>
  );
}
