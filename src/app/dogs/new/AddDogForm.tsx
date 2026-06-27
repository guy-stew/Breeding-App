// ============================================================
//  src/app/dogs/new/AddDogForm.tsx — the add-a-dog form.
//
//  A client component (it's interactive — you type, pick, save).
//  It collects the fields and hands them to the addDog server
//  action. On success the action redirects home, so this form
//  doesn't need to do anything after a good save.
//
//  Required: breed, sex. Everything else is optional — a dog you
//  add in a hurry can be fleshed out later.
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addDog } from "../../actions";

export default function AddDogForm() {
  const router = useRouter();

  const [callName, setCallName] = useState("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState<"" | "dog" | "bitch">("");
  const [colour, setColour] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [microchip, setMicrochip] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);

    // Quick checks in the browser so the obvious misses are caught
    // instantly. The server action checks again — never trust the
    // browser alone — but this gives a faster nudge.
    if (!breed.trim()) {
      setError("Please enter a breed.");
      return;
    }
    if (sex !== "dog" && sex !== "bitch") {
      setError("Please choose dog or bitch.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addDog({
          callName,
          breed,
          sex,
          colour,
          dateOfBirth,
          microchip,
        });
        // We only get a value back if something went WRONG. A
        // successful save redirects on the server and never returns
        // here. (The redirect surfaces as a thrown signal we let
        // pass through below.)
        if (result && !result.ok) {
          setError(result.error);
        }
      } catch (e) {
        // Next.js signals a redirect by throwing a special error.
        // We must re-throw it so the navigation actually happens,
        // and only treat anything else as a real failure.
        if (
          e &&
          typeof e === "object" &&
          "digest" in e &&
          typeof (e as { digest?: unknown }).digest === "string" &&
          (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw e;
        }
        setError("Something went wrong saving the dog.");
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";
  const labelClass = "mb-1 block text-xs text-neutral-500";

  return (
    <div className="space-y-4">
      {/* Call name */}
      <div>
        <label className={labelClass} htmlFor="callName">
          Call name
        </label>
        <input
          id="callName"
          value={callName}
          onChange={(e) => setCallName(e.target.value)}
          placeholder="e.g. Maple"
          className={inputClass}
        />
      </div>

      {/* Breed (required) */}
      <div>
        <label className={labelClass} htmlFor="breed">
          Breed <span className="text-red-500">*</span>
        </label>
        <input
          id="breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="e.g. Cocker Spaniel"
          className={inputClass}
        />
      </div>

      {/* Sex (required) — a simple two-button choice */}
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

      {/* Colour (optional) */}
      <div>
        <label className={labelClass} htmlFor="colour">
          Colour
        </label>
        <input
          id="colour"
          value={colour}
          onChange={(e) => setColour(e.target.value)}
          placeholder="e.g. golden"
          className={inputClass}
        />
      </div>

      {/* Date of birth (optional) */}
      <div>
        <label className={labelClass} htmlFor="dob">
          Date of birth
        </label>
        <input
          id="dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Microchip (optional) */}
      <div>
        <label className={labelClass} htmlFor="microchip">
          Microchip number
        </label>
        <input
          id="microchip"
          value={microchip}
          onChange={(e) => setMicrochip(e.target.value)}
          placeholder="15 digits"
          inputMode="numeric"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save dog"}
        </button>
      </div>
    </div>
  );
}
