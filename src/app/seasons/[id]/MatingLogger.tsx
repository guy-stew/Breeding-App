"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logMating } from "./actions";

export default function MatingLogger({ cycleId, sires }: { cycleId: string; sires: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sireId, setSireId] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    if (!sireId) return setError("Choose a sire.");
    if (!date) return setError("Pick the mating date.");
    startTransition(async () => {
      const res = await logMating(cycleId, sireId, date);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  const input =
    "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-neutral-700 dark:bg-neutral-950";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
      >
        ♥ Log a mating
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 dark:border-green-500/30 dark:bg-green-500/5">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[10rem] flex-1">
          <label className="mb-1 block text-xs text-neutral-500">Sire</label>
          <select value={sireId} onChange={(e) => setSireId(e.target.value)} className={input + " w-full"}>
            <option value="">Choose…</option>
            {sires.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Mating date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
        </div>
        <button type="button" onClick={submit} disabled={isPending} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50">
          {isPending ? "Saving…" : "Log mating"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      <p className="mt-2 text-xs text-neutral-500">Logging a mating moves this season to the pregnancy view. You can add a second cover date the same way.</p>
    </div>
  );
}
