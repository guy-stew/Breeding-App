"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createLitter } from "../../actions";

type DogOption = { id: string; callName: string };

export default function NewLitterForm({
  dams,
  sires,
}: {
  dams: DogOption[];
  sires: DogOption[];
}) {
  const router = useRouter();

  const [damId, setDamId] = useState("");
  const [sireId, setSireId] = useState("");
  const [matingDate, setMatingDate] = useState("");
  const [method, setMethod] = useState("natural");
  const [name, setName] = useState("");
  const [whelpDate, setWhelpDate] = useState("");
  const [totalBorn, setTotalBorn] = useState("");
  const [bornAlive, setBornAlive] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    if (!damId) { setError("Please select a dam."); return; }
    if (!sireId) { setError("Please select a sire."); return; }
    if (!whelpDate) { setError("Please enter the whelp date."); return; }

    startTransition(async () => {
      const result = await createLitter({
        damId,
        sireId,
        matingDate,
        method,
        name,
        whelpDate,
        totalBorn,
        bornAlive,
        notes,
      });

      if (!result.ok) {
        setError(result.error);
      } else {
        router.push(`/litters/${result.litterId}`);
        router.refresh();
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";
  const labelClass = "mb-1 block text-xs text-neutral-500";
  const selectClass = inputClass + " appearance-none";

  return (
    <>
      <header className="mb-4 px-1">
        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Home
        </Link>
        <h1 className="mt-1 text-lg font-medium">Record a new litter</h1>
      </header>

      <div className="space-y-4">
        {/* Parents */}
        <p className="px-1 text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Parents
        </p>

        <div>
          <label className={labelClass} htmlFor="dam">
            Dam (mother) <span className="text-red-500">*</span>
          </label>
          <select
            id="dam"
            value={damId}
            onChange={(e) => setDamId(e.target.value)}
            className={selectClass}
          >
            <option value="">Choose a dam...</option>
            {dams.map((d) => (
              <option key={d.id} value={d.id}>{d.callName}</option>
            ))}
          </select>
          {dams.length === 0 && (
            <p className="mt-1 text-xs text-neutral-400">
              No bitches found.{" "}
              <Link href="/dogs/new" className="text-blue-600">Add a dog</Link> first.
            </p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="sire">
            Sire (father) <span className="text-red-500">*</span>
          </label>
          <select
            id="sire"
            value={sireId}
            onChange={(e) => setSireId(e.target.value)}
            className={selectClass}
          >
            <option value="">Choose a sire...</option>
            {sires.map((d) => (
              <option key={d.id} value={d.id}>{d.callName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="matingDate">
            Mating date
          </label>
          <input
            id="matingDate"
            type="date"
            value={matingDate}
            onChange={(e) => setMatingDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="method">Method</label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={selectClass}
          >
            <option value="natural">Natural</option>
            <option value="ai_fresh">AI (fresh)</option>
            <option value="ai_chilled">AI (chilled)</option>
            <option value="ai_frozen">AI (frozen)</option>
          </select>
        </div>

        {/* Litter details */}
        <p className="px-1 pt-2 text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Litter details
        </p>

        <div>
          <label className={labelClass} htmlFor="name">
            Litter name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maple's litter"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="whelpDate">
            Whelp date <span className="text-red-500">*</span>
          </label>
          <input
            id="whelpDate"
            type="date"
            value={whelpDate}
            onChange={(e) => setWhelpDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="totalBorn">
              Total born
            </label>
            <input
              id="totalBorn"
              type="number"
              min="0"
              value={totalBorn}
              onChange={(e) => setTotalBorn(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="bornAlive">
              Born alive
            </label>
            <input
              id="bornAlive"
              type="number"
              min="0"
              value={bornAlive}
              onChange={(e) => setBornAlive(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          <Link
            href="/"
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-center text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save litter"}
          </button>
        </div>
      </div>
    </>
  );
}
