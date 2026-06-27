"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addProgesteroneTest } from "../../../../actions";

export default function AddProgTestForm({
  cycleId,
  dogId,
}: {
  cycleId: string;
  dogId: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [level, setLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(level);
    if (isNaN(parsed) || parsed < 0) {
      setError("Enter a valid level in ng/ml.");
      return;
    }

    startTransition(async () => {
      const res = await addProgesteroneTest({
        cycleId,
        dogId,
        date,
        levelNgMl: parsed,
        notes,
      });
      if (!res.ok) {
        setError(res.error);
      } else {
        setLevel("");
        setNotes("");
        router.refresh();
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";
  const labelClass = "mb-1 block text-xs text-neutral-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="testDate">
            Date
          </label>
          <input
            id="testDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="testLevel">
            Level (ng/ml)
          </label>
          <input
            id="testLevel"
            type="number"
            step="0.1"
            min="0"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="e.g. 5.2"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="testNotes">
          Notes
        </label>
        <input
          id="testNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Vet name, lab used"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Add test result"}
      </button>
    </form>
  );
}
