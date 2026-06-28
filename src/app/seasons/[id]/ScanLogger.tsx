"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordScanOutcome } from "./actions";

export default function ScanLogger({ cycleId }: { cycleId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function record(pregnant: boolean) {
    setError(null);
    startTransition(async () => {
      const n = parseInt(count, 10);
      const res = await recordScanOutcome(cycleId, pregnant, pregnant && !Number.isNaN(n) ? n : undefined);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50 dark:border-amber-500/40 dark:bg-neutral-900 dark:text-amber-300"
      >
        Log scan
      </button>
    );
  }

  return (
    <div className="mt-2 w-full rounded-lg border border-amber-200 bg-white p-3 dark:border-amber-500/30 dark:bg-neutral-900">
      <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">Confirmation scan result</p>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Puppies seen (optional)</label>
          <input type="number" min="0" value={count} onChange={(e) => setCount(e.target.value)} placeholder="e.g. 6" className="w-28 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-950" />
        </div>
        <button type="button" onClick={() => record(true)} disabled={isPending} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50">
          Confirmed pregnant
        </button>
        <button type="button" onClick={() => record(false)} disabled={isPending} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
          Not in whelp
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
