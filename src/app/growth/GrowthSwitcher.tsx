"use client";

import { useState } from "react";
import Link from "next/link";
import GrowthChart from "../litters/[id]/GrowthChart";

export type GrowthLitter = {
  id: string;
  title: string;
  whelpDate: string; // ISO
  day: number;
  puppyCount: number;
  puppies: {
    collarColour: string | null;
    callName: string | null;
    weights: { date: string; weightG: number }[];
  }[];
};

export default function GrowthSwitcher({ litters }: { litters: GrowthLitter[] }) {
  const [idx, setIdx] = useState(0);
  const selected = litters[idx];
  if (!selected) return null;

  return (
    <div>
      {litters.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {litters.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setIdx(i)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                i === idx
                  ? "bg-blue-600 text-white"
                  : "bg-black/[0.04] text-neutral-600 hover:bg-black/[0.07] dark:bg-white/[0.06] dark:text-neutral-300 dark:hover:bg-white/[0.1]"
              }`}
            >
              {l.title}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <Link href={`/litters/${selected.id}`} className="font-semibold hover:text-blue-600 dark:hover:text-blue-400">
              {selected.title}
            </Link>
            <p className="text-sm text-neutral-500">
              Day {selected.day} · {selected.puppyCount} pup{selected.puppyCount === 1 ? "" : "s"}
            </p>
          </div>
          <Link href={`/litters/${selected.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Open litter →
          </Link>
        </div>
        <GrowthChart whelpDate={selected.whelpDate} puppies={selected.puppies} />
      </div>
    </div>
  );
}
