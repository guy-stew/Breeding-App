// ============================================================
//  src/app/weigh-in/WeighInRow.tsx — one puppy's input row.
//
//  This is a "client component" (note "use client" at the top):
//  it runs in the browser because it's interactive — you type a
//  number, flip between grams and kilograms, and hit Save. The
//  home screen and the weigh-in list are server components that
//  read data; THIS little piece is the bit you actually touch.
//
//  When you hit Save it calls the logWeight server action, which
//  does the real writing. So: browser (this file) -> server
//  action -> database.
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { logWeight } from "../actions";

type Props = {
  dogId: string;
  collarColour: string | null;
  callName: string | null;
  birthOrder: number | null;
  // Last recorded weight in grams, or null if never weighed.
  lastWeightG: number | null;
  lastWeightDate: Date | null;
};

// Show a grams figure as a friendly string: small pups in grams,
// bigger ones in kg. 480 -> "480 g", 4500 -> "4.5 kg".
function prettyWeight(g: number): string {
  if (g < 1000) return `${g} g`;
  return `${(g / 1000).toFixed(2).replace(/\.?0+$/, "")} kg`;
}

export default function WeighInRow({
  dogId,
  collarColour,
  callName,
  birthOrder,
  lastWeightG,
  lastWeightDate,
}: Props) {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<"g" | "kg">("g");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  // What we show as the puppy's label: collar colour first (that's
  // how you tell look-alike pups apart at whelping), then a name or
  // birth order as a fallback.
  const label =
    collarColour ??
    callName ??
    (birthOrder != null ? `Pup ${birthOrder}` : "Puppy");

  function handleSave() {
    setMessage(null);

    const typed = parseFloat(value);
    if (!Number.isFinite(typed) || typed <= 0) {
      setIsError(true);
      setMessage("Enter a weight.");
      return;
    }

    // Convert to grams for storage. If they typed kg, multiply up.
    const grams = unit === "kg" ? typed * 1000 : typed;

    startTransition(async () => {
      const result = await logWeight(dogId, grams);
      if (result.ok) {
        setIsError(false);
        setMessage(`Saved ${prettyWeight(result.weightG)}`);
        setValue(""); // clear, ready for the next pup
      } else {
        setIsError(true);
        setMessage(result.error);
      }
    });
  }

  // Save on Enter too, so you can weigh a whole litter without
  // ever leaving the keyboard: type, Enter, next pup.
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  }

  return (
    <li className="flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {birthOrder ?? "•"}
          </div>
          <div>
            <div className="text-sm font-medium">{label}</div>
            <div className="text-xs text-neutral-500">
              {lastWeightG != null
                ? `Last: ${prettyWeight(lastWeightG)}`
                : "Not weighed yet"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Weight"
          aria-label={`Weight for ${label}`}
          className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm tabular-nums focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
        />

        {/* g / kg toggle — most newborn weigh-ins are grams, hence default. */}
        <div className="flex overflow-hidden rounded-lg border border-neutral-300 text-xs dark:border-neutral-700">
          {(["g", "kg"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={
                "px-3 py-2 " +
                (unit === u
                  ? "bg-blue-600 text-white"
                  : "bg-white text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300")
              }
            >
              {u}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>

      {message && (
        <p
          className={
            "px-1 text-xs " +
            (isError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")
          }
        >
          {message}
        </p>
      )}
    </li>
  );
}
