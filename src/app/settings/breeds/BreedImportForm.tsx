"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importBreedsCsv } from "../../breed-actions";

export default function BreedImportForm() {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setCsv(await file.text());
    setMsg(null);
  }

  function handleImport() {
    setMsg(null);
    if (!csv.trim()) {
      setMsg({ ok: false, text: "Upload a CSV file or paste its contents first." });
      return;
    }
    startTransition(async () => {
      const res = await importBreedsCsv(csv);
      if (res.ok) {
        setMsg({ ok: true, text: `Imported ${res.count} breeds.` });
        setCsv("");
        setFileName(null);
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  const input =
    "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-950";

  return (
    <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Upload CSV
      </label>
      <input type="file" accept=".csv,text/csv" onChange={handleFile} className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 dark:text-neutral-400" />
      {fileName && <p className="mt-1 text-xs text-neutral-500">Loaded: {fileName}</p>}

      <p className="my-3 text-center text-xs uppercase tracking-wider text-neutral-400">or paste</p>

      <textarea
        value={csv}
        onChange={(e) => { setCsv(e.target.value); setFileName(null); setMsg(null); }}
        rows={5}
        placeholder="Breed,Top 10 breed,Good Practice tests…&#10;Border Collie,,• Eye testing…,…"
        className={input + " font-mono text-xs"}
      />

      {msg && (
        <p className={`mt-3 text-sm ${msg.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {msg.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleImport}
        disabled={isPending}
        className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Importing…" : "Import & replace breed data"}
      </button>
    </div>
  );
}
