"use client";

import { useRef, useState } from "react";
import { useClickAway } from "./useClickAway";

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-950";

export default function BreedCombobox({
  breeds,
  value,
  onChange,
  onSelect,
  placeholder,
  id,
}: {
  breeds: string[];
  value: string;
  onChange: (v: string) => void;
  onSelect?: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, () => setOpen(false), open);

  const q = value.trim().toLowerCase();
  const matches = q
    ? breeds.filter((b) => b.toLowerCase().includes(q)).slice(0, 8)
    : breeds.slice(0, 8);

  function choose(name: string) {
    onChange(name);
    onSelect?.(name);
    setOpen(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (open && matches[active]) {
        e.preventDefault();
        choose(matches[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="breed-listbox"
        className={inputClass}
      />
      {open && matches.length > 0 && (
        <ul
          id="breed-listbox"
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {matches.map((b, i) => (
            <li key={b} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(b)}
                className={`block w-full px-3.5 py-2 text-left text-sm transition ${
                  i === active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                {b}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
