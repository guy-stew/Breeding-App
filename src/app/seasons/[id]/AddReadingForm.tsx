"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logProgesterone } from "./actions";

export default function AddReadingForm({ cycleId }: { cycleId: string }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    const value = parseFloat(level);
    if (!date) return setError("Pick a date.");
    if (!(value >= 0)) return setError("Enter a level in ng/ml.");
    startTransition(async () => {
      const res = await logProgesterone(cycleId, date, value);
      if (res.ok) {
        setLevel("");
        setDate("");
        router.refresh();
      } else setError(res.error);
    });
  }

  const input =
    "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-950";

  return (
    <div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-500">Test date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input + " w-full"} />
        </div>
        <div className="w-28">
          <label className="mb-1 block text-xs text-neutral-500">ng/ml</label>
          <input type="number" step="0.1" min="0" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g. 5.4" className={input + " w-full"} />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Add"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
