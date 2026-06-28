"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type DogRow = {
  id: string;
  name: string;
  breed: string;
  role: "dam" | "sire";
  external: boolean;
  ageLabel: string;
  litters: number;
  pups: number;
  screened: boolean;
};

const AVATAR_COLOURS = [
  "bg-pink-200 text-pink-800",
  "bg-orange-200 text-orange-800",
  "bg-blue-200 text-blue-800",
  "bg-purple-200 text-purple-800",
  "bg-green-200 text-green-800",
  "bg-amber-200 text-amber-800",
  "bg-teal-200 text-teal-800",
  "bg-rose-200 text-rose-800",
];

function avatarColour(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % AVATAR_COLOURS.length;
  return AVATAR_COLOURS[h];
}

type Filter = "all" | "dam" | "sire";

export default function DogsTable({
  rows,
  total,
  dams,
  sires,
}: {
  rows: DogRow[];
  total: number;
  dams: number;
  sires: number;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.role !== filter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.breed.toLowerCase().includes(q);
    });
  }, [rows, query, filter]);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "dam", label: "Dams" },
    { key: "sire", label: "Sires" },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dogs</h1>
          <p className="text-sm text-neutral-500">
            {total} active · {dams} dams · {sires} sires
          </p>
        </div>
        <Link
          href="/dogs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add dog
        </Link>
      </div>

      {/* Search + filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or breed"
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                filter === f.key
                  ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300"
                  : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-500 dark:border-neutral-800">
          <div>Dog</div>
          <div className="w-16 text-right sm:w-20">Age</div>
          <div className="w-14 text-right">Litters</div>
          <div className="w-12 text-right">Pups</div>
          <div className="w-5" />
        </div>

        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-neutral-500">No dogs match your search.</p>
        ) : (
          filtered.map((r) => (
            <Link
              key={r.id}
              href={`/dogs/${r.id}`}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-neutral-100 px-4 py-3 transition last:border-0 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColour(r.name)}`}>
                  {r.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{r.name}</span>
                    {r.external && (
                      <span className="shrink-0 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                        external
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 truncate text-sm text-neutral-500">
                    <span className="truncate">{r.breed} · {r.role}</span>
                    <span>·</span>
                    {r.screened ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Screened
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-neutral-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-16 text-right text-sm text-neutral-600 dark:text-neutral-300 sm:w-20">{r.ageLabel}</div>
              <div className="w-14 text-right text-sm font-medium">{r.litters}</div>
              <div className="w-12 text-right text-sm font-medium">{r.pups}</div>
              <svg className="h-5 w-5 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))
        )}
      </div>

      <p className="mt-3 text-xs text-neutral-400">
        Pups = total puppies across all litters where this dog is the dam. Sires show litters they&apos;ve sired.
      </p>
    </>
  );
}
