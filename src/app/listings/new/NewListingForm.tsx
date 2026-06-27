"use client";

import { useState, useTransition } from "react";
import { createListing } from "../../actions";

type PuppyOption = { id: string; label: string };

export default function NewListingForm({
  puppies,
}: {
  puppies: PuppyOption[];
}) {
  const [puppyId, setPuppyId] = useState(puppies[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceText, setPriceText] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createListing({ puppyId, title, description, priceText });
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
        <label className={labelClass} htmlFor="puppyId">
          Puppy <span className="text-red-500">*</span>
        </label>
        <select
          id="puppyId"
          value={puppyId}
          onChange={(e) => setPuppyId(e.target.value)}
          className={inputClass}
        >
          {puppies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="title">
          Listing title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Beautiful golden Labrador puppy"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-neutral-400">
          Optional — defaults to puppy name if left blank.
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Tell potential buyers about this puppy — temperament, health checks done, what's included..."
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="priceText">
          Price
        </label>
        <input
          id="priceText"
          value={priceText}
          onChange={(e) => setPriceText(e.target.value)}
          placeholder="e.g. £2,500 or POA"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Publishing…" : "Publish listing"}
      </button>
    </form>
  );
}
