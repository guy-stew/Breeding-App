"use client";

import { useState } from "react";
import Link from "next/link";
import GrowthChart from "./litters/[id]/GrowthChart";

type LitterData = {
  id: string;
  name: string | null;
  whelpDate: string;
  bornAlive: number | null;
  day: number;
  puppies: {
    collarColour: string | null;
    callName: string | null;
    weights: { date: string; weightG: number }[];
  }[];
};

export default function DashboardLitters({
  litters,
}: {
  litters: LitterData[];
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = litters[selectedIdx];

  if (!selected) return null;

  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-medium text-neutral-400">
          Active litter{litters.length !== 1 ? "s" : ""}
        </span>
        <Link
          href="/litters/new"
          className="text-xs font-medium text-blue-600 dark:text-blue-400"
        >
          + New litter
        </Link>
      </div>

      {/* Litter switcher tabs */}
      {litters.length > 1 && (
        <div className="mb-3 flex gap-2">
          {litters.map((litter, idx) => (
            <button
              key={litter.id}
              onClick={() => setSelectedIdx(idx)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                idx === selectedIdx
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {litter.name ?? "Litter"}
            </button>
          ))}
        </div>
      )}

      {/* Selected litter card */}
      <div className="rounded-xl border border-blue-500/30 bg-white p-4 shadow-sm dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <Link
            href={`/litters/${selected.id}`}
            className="font-medium hover:text-blue-600"
          >
            {selected.name ?? "Litter"}
          </Link>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
            Day {selected.day}
          </span>
        </div>
        <div className="mb-3 flex gap-3">
          <div className="flex-1 rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
            <div className="text-xs text-neutral-400">Puppies</div>
            <div className="text-xl font-bold">{selected.puppies.length}</div>
          </div>
          <div className="flex-1 rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
            <div className="text-xs text-neutral-400">Born alive</div>
            <div className="text-xl font-bold">
              {selected.bornAlive ?? "—"}
            </div>
          </div>
        </div>

        {/* Growth chart */}
        {selected.puppies.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs text-neutral-400">Growth chart</p>
            <GrowthChart
              whelpDate={selected.whelpDate}
              puppies={selected.puppies}
            />
          </div>
        )}

        <Link
          href={`/litters/${selected.id}`}
          className="block rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          View litter
        </Link>
      </div>
    </section>
  );
}
