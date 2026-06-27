"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDog } from "../../../actions";

type Props = {
  id: string;
  callName: string;
  registeredName: string;
  breed: string;
  sex: string;
  colour: string;
  markings: string;
  dateOfBirth: string;
  microchip: string;
  kcRegNumber: string;
};

export default function EditDogForm(props: Props) {
  const router = useRouter();

  const [callName, setCallName] = useState(props.callName);
  const [registeredName, setRegisteredName] = useState(props.registeredName);
  const [breed, setBreed] = useState(props.breed);
  const [sex, setSex] = useState<"dog" | "bitch">(
    props.sex === "bitch" ? "bitch" : "dog",
  );
  const [colour, setColour] = useState(props.colour);
  const [markings, setMarkings] = useState(props.markings);
  const [dateOfBirth, setDateOfBirth] = useState(props.dateOfBirth);
  const [microchip, setMicrochip] = useState(props.microchip);
  const [kcRegNumber, setKcRegNumber] = useState(props.kcRegNumber);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);

    if (!breed.trim()) {
      setError("Please enter a breed.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateDog({
          id: props.id,
          callName,
          registeredName,
          breed,
          sex,
          colour,
          markings,
          dateOfBirth,
          microchip,
          kcRegNumber,
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
        <label className={labelClass} htmlFor="callName">Call name</label>
        <input id="callName" value={callName} onChange={(e) => setCallName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="registeredName">Registered name</label>
        <input id="registeredName" value={registeredName} onChange={(e) => setRegisteredName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="breed">Breed <span className="text-red-500">*</span></label>
        <input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Sex <span className="text-red-500">*</span></label>
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
        <label className={labelClass} htmlFor="colour">Colour</label>
        <input id="colour" value={colour} onChange={(e) => setColour(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="markings">Markings</label>
        <input id="markings" value={markings} onChange={(e) => setMarkings(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="dob">Date of birth</label>
        <input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="microchip">Microchip number</label>
        <input id="microchip" value={microchip} onChange={(e) => setMicrochip(e.target.value)} inputMode="numeric" className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="kcReg">KC registration number</label>
        <input id="kcReg" value={kcRegNumber} onChange={(e) => setKcRegNumber(e.target.value)} className={inputClass} />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.push(`/dogs/${props.id}`)}
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
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
