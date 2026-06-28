"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { logHeatSign } from "./actions";

const SIGNS: { type: string; label: string; icon: string }[] = [
  { type: "swelling", label: "Swelling", icon: "🔵" },
  { type: "discharge_change", label: "Discharge", icon: "💧" },
  { type: "tail_flagging", label: "Tail flagging", icon: "🚩" },
  { type: "standing", label: "Standing", icon: "🐾" },
];

export default function SignLogger({ cycleId }: { cycleId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function log(type: string) {
    setError(null);
    setBusy(type);
    startTransition(async () => {
      const res = await logHeatSign(cycleId, type);
      setBusy(null);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {SIGNS.map((s) => (
          <button
            key={s.type}
            type="button"
            onClick={() => log(s.type)}
            disabled={isPending}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-xs font-medium text-neutral-600 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
          >
            <span className="text-lg">{s.icon}</span>
            {busy === s.type ? "Saving…" : s.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-neutral-400">Tap a sign you&apos;ve seen today — it&apos;s pinned to today&apos;s date on the timeline.</p>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
