"use client";

import { useEffect, useId, useRef, useState } from "react";

type Option = { value: string; label: string };

type AutocompleteProps = {
  label: string;
  placeholder: string;
  valueLabel: string;
  required?: boolean;
  disabled?: boolean;
  testId?: string;
  error?: string;
  fetchOptions: (query: string) => Promise<Option[]>;
  onSelect: (option: Option | null) => void;
  onQueryChange?: (query: string) => void;
  minChars?: number;
  debounceMs?: number;
};

export function AutocompleteField({
  label,
  placeholder,
  valueLabel,
  required,
  disabled,
  testId,
  error,
  fetchOptions,
  onSelect,
  onQueryChange,
  minChars = 2,
  debounceMs = 300,
}: AutocompleteProps) {
  const listId = useId();
  const [query, setQuery] = useState(valueLabel);
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const skipFetch = useRef(false);

  useEffect(() => {
    setQuery(valueLabel);
  }, [valueLabel]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (skipFetch.current) {
      skipFetch.current = false;
      return;
    }
    if (disabled) return;
    if (query.trim().length < minChars) {
      setOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const next = await fetchOptions(query.trim());
        setOptions(next);
        setOpen(true);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, disabled, minChars, debounceMs, fetchOptions]);

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-sm text-slate-400">{label}</label>
      <input
        type="text"
        data-testid={testId}
        required={required}
        disabled={disabled}
        value={query}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          onQueryChange?.(next);
          onSelect(null);
        }}
        onFocus={() => {
          if (options.length > 0) {
            setOpen(true);
            return;
          }
          if (!disabled && query.trim().length >= minChars) {
            void (async () => {
              setLoading(true);
              try {
                const next = await fetchOptions(query.trim());
                setOptions(next);
                if (next.length > 0) setOpen(true);
              } catch {
                setOptions([]);
              } finally {
                setLoading(false);
              }
            })();
          }
        }}
        className={`mt-1 w-full rounded-lg border bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:outline-none disabled:opacity-50 ${
          error ? "border-red-500" : "border-white/20 focus:border-emerald-500"
        }`}
        placeholder={placeholder}
      />
      {loading && <p className="mt-1 text-xs text-slate-500">…</p>}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {open && options.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-white/15 bg-slate-900 py-1 shadow-xl"
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-emerald-500/20"
                onClick={() => {
                  skipFetch.current = true;
                  setQuery(opt.label);
                  setOpen(false);
                  setOptions([]);
                  onSelect(opt);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
