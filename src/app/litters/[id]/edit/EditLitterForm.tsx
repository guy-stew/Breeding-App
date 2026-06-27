"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLitter } from "../../../actions";

type Props = {
  id: string;
  name: string;
  whelpDate: string;
  totalBorn: string;
  bornAlive: string;
  notes: string;
  status: string;
};

export default function EditLitterForm(props: Props) {
  const router = useRouter();

  const [name, setName] = useState(props.name);
  const [whelpDate, setWhelpDate] = useState(props.whelpDate);
  const [totalBorn, setTotalBorn] = useState(props.totalBorn);
  const [bornAlive, setBornAlive] = useState(props.bornAlive);
  const [notes, setNotes] = useState(props.notes);
  const [status, setStatus] = useState(props.status);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await updateLitter({
          id: props.id,
          name,
          whelpDate,
          totalBorn,
          bornAlive,
          notes,
          status,
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
        <label className={labelClass} htmlFor="name">Litter name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="whelpDate">
          Whelp date <span className="text-red-500">*</span>
        </label>
        <input id="whelpDate" type="date" value={whelpDate} onChange={(e) => setWhelpDate(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="totalBorn">Total born</label>
          <input id="totalBorn" type="number" min="0" value={totalBorn} onChange={(e) => setTotalBorn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="bornAlive">Born alive</label>
          <input id="bornAlive" type="number" min="0" value={bornAlive} onChange={(e) => setBornAlive(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={inputClass + " appearance-none"}
        >
          <option value="expecting">Expecting</option>
          <option value="whelped">Whelped</option>
          <option value="weaning">Weaning</option>
          <option value="ready">Ready</option>
          <option value="all_homed">All homed</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">Notes</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.push(`/litters/${props.id}`)}
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
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
