"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePuppyCollar } from "@/app/actions";

const COLLAR_COLOURS = [
  "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink",
  "Black", "White", "Brown",
];

export default function CollarColourPicker({
  puppyId,
  currentColour,
}: {
  puppyId: string;
  currentColour: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSelect(colour: string) {
    setOpen(false);
    startTransition(async () => {
      await updatePuppyCollar(puppyId, colour);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
        title="Change collar colour"
        disabled={isPending}
      >
        {isPending ? "…" : "✎"}
      </button>
    );
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {COLLAR_COLOURS.map((c) => (
        <button
          key={c}
          onClick={() => handleSelect(c)}
          className={`rounded-full px-2 py-0.5 text-xs transition ${
            c === currentColour
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          {c}
        </button>
      ))}
      <button
        onClick={() => setOpen(false)}
        className="rounded-full px-2 py-0.5 text-xs text-neutral-400 hover:text-neutral-600"
      >
        Cancel
      </button>
    </div>
  );
}
