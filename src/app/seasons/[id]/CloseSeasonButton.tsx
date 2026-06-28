"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { closeSeason } from "./actions";

export default function CloseSeasonButton({ cycleId }: { cycleId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function close() {
    startTransition(async () => {
      const res = await closeSeason(cycleId);
      if (res.ok) router.refresh();
    });
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
        Close this season
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-neutral-500">She went out of season without mating?</span>
      <button type="button" onClick={close} disabled={isPending} className="font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400">
        {isPending ? "Closing…" : "Yes, close it"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
        Cancel
      </button>
    </div>
  );
}
