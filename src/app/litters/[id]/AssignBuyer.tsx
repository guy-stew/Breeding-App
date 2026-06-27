"use client";

import { useState, useTransition } from "react";
import { assignBuyer } from "../../actions";

type BuyerOption = { id: string; name: string };

export default function AssignBuyer({
  puppyId,
  currentBuyerId,
  buyers,
}: {
  puppyId: string;
  currentBuyerId: string | null;
  buyers: BuyerOption[];
}) {
  const [value, setValue] = useState(currentBuyerId ?? "");
  const [isPending, startTransition] = useTransition();

  function handleChange(newValue: string) {
    setValue(newValue);
    startTransition(async () => {
      await assignBuyer(puppyId, newValue || null);
    });
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      onClick={(e) => e.preventDefault()}
      className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-600 appearance-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
    >
      <option value="">No buyer</option>
      {buyers.map((b) => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>
  );
}
