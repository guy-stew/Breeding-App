"use client";

import { useState, useTransition } from "react";
import { addPuppy } from "../../../actions";

const COLLAR_COLOURS = [
  "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink",
  "Black", "White", "Brown",
];

export default function AddPuppyForm({
  litterId,
  nextOrder,
}: {
  litterId: string;
  nextOrder: number;
}) {
  const [sex, setSex] = useState<"" | "dog" | "bitch">("");
  const [collarColour, setCollarColour] = useState("");
  const [birthOrder, setBirthOrder] = useState(String(nextOrder));
  const [birthWeightG, setBirthWeightG] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    if (sex !== "dog" && sex !== "bitch") {
      setError("Please choose dog or bitch.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addPuppy({
          litterId,
          sex,
          collarColour,
          birthOrder,
          birthWeightG,
        });
        if (result && !result.ok) {
          setError(result.error);
        }
      } catch (e) {
        if (
          e &&
          typeof e === "object" &&
          "digest" in e &&
          typeof (e as { digest?: unknown }).digest === "string" &&
          (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw e;
        }
        setError("Something went wrong saving.");
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";
  const labelClass = "mb-1 block text-xs text-neutral-500";

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>
          Sex <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {(["dog", "bitch"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSex(s)}
              className={
                "flex-1 rounded-lg border px-4 py-2 text-sm capitalize " +
                (sex === s
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300")
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="collar">Collar colour</label>
        <select
          id="collar"
          value={collarColour}
          onChange={(e) => setCollarColour(e.target.value)}
          className={inputClass + " appearance-none"}
        >
          <option value="">Choose...</option>
          {COLLAR_COLOURS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="birthOrder">Birth order</label>
          <input
            id="birthOrder"
            type="number"
            min="1"
            value={birthOrder}
            onChange={(e) => setBirthOrder(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="birthWeight">Birth weight (g)</label>
          <input
            id="birthWeight"
            type="number"
            min="0"
            value={birthWeightG}
            onChange={(e) => setBirthWeightG(e.target.value)}
            placeholder="e.g. 350"
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Add puppy"}
      </button>
    </div>
  );
}
