"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useClickAway } from "./useClickAway";

const SETTINGS = [
  { label: "Language", hint: "English (UK)" },
  { label: "Kennel name", hint: "" },
  { label: "Breeder / kennel address", hint: "" },
  { label: "Licence information", hint: "" },
];

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`rounded-lg p-2 transition hover:bg-white/10 hover:text-white ${
          open ? "bg-white/10 text-white" : "text-slate-300"
        }`}
        aria-label="Settings"
        aria-expanded={open}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Settings
          </p>
          <Link
            href="/settings/breeds"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <span>Breed data</span>
            <span className="text-xs text-neutral-400">KC tests</span>
          </Link>
          <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
          {SETTINGS.map((s) => (
            <button
              key={s.label}
              disabled
              className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-neutral-500 dark:text-neutral-400"
            >
              <span>{s.label}</span>
              <span className="text-xs text-neutral-300 dark:text-neutral-600">
                {s.hint || "Soon"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
