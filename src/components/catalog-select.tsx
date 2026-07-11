"use client";

import { useEffect, useId, useRef, useState } from "react";

type Option = { value: string; label: string };

type CatalogSelectProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  testId?: string;
};

export function CatalogSelect({ label, value, options, onChange, testId }: CatalogSelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative block text-xs text-slate-400 ${open ? "z-50" : "z-0"}`}
    >
      {label}
      <button
        type="button"
        data-testid={testId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-white/20 bg-slate-950/80 px-3 py-2 text-left text-sm text-white focus:border-emerald-500 focus:outline-none"
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <span className="ml-2 text-slate-500" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-white/15 bg-slate-950 py-1 shadow-xl shadow-black/50"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value || "__all"}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`w-full px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "text-white hover:bg-white/10"
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
