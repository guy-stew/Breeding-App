"use client";

import { useState, useTransition } from "react";
import { addHealthRecord } from "../../../../actions";

const TYPES = [
  { value: "vaccination", label: "Vaccination" },
  { value: "worming", label: "Worming" },
  { value: "flea_treatment", label: "Flea treatment" },
  { value: "vet_check", label: "Vet check" },
  { value: "dna_test", label: "DNA test" },
  { value: "hip_score", label: "Hip score" },
  { value: "elbow_score", label: "Elbow score" },
  { value: "eye_test", label: "Eye test" },
  { value: "other", label: "Other" },
];

export default function AddHealthRecordForm({ dogId }: { dogId: string }) {
  const [type, setType] = useState("vaccination");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextDueDate, setNextDueDate] = useState("");
  const [vet, setVet] = useState("");
  const [result, setResult] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const showResult = [
    "dna_test",
    "hip_score",
    "elbow_score",
    "eye_test",
  ].includes(type);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await addHealthRecord({
        dogId,
        type,
        description,
        date,
        nextDueDate,
        vet,
        result: showResult ? result : "",
        notes,
      });
      if (!res.ok) setError(res.error);
    });
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";
  const labelClass = "mb-1 block text-xs text-neutral-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div>
        <label className={labelClass} htmlFor="type">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          Product / details
        </label>
        <input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === "vaccination"
              ? "e.g. Nobivac DHPPi"
              : type === "worming"
                ? "e.g. Milbemax"
                : type === "flea_treatment"
                  ? "e.g. Frontline Plus"
                  : "Details"
          }
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="date">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="nextDueDate">
          Next due date
        </label>
        <input
          id="nextDueDate"
          type="date"
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="vet">
          Vet / practice
        </label>
        <input
          id="vet"
          value={vet}
          onChange={(e) => setVet(e.target.value)}
          placeholder="e.g. Village Vets"
          className={inputClass}
        />
      </div>

      {showResult && (
        <div>
          <label className={labelClass} htmlFor="result">
            Result / score
          </label>
          <input
            id="result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder={
              type === "hip_score"
                ? "e.g. 4/4"
                : type === "elbow_score"
                  ? "e.g. 0/0"
                  : type === "eye_test"
                    ? "e.g. Clear"
                    : "Result"
            }
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save health record"}
      </button>
    </form>
  );
}
