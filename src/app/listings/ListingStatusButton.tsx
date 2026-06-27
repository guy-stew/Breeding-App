"use client";

import { useTransition } from "react";
import { updateListingStatus } from "../actions";

export default function ListingStatusButton({
  listingId,
  currentStatus,
}: {
  listingId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(newStatus: string) {
    startTransition(async () => {
      await updateListingStatus(listingId, newStatus);
    });
  }

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-600 appearance-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
    >
      <option value="active">Active</option>
      <option value="sold">Sold</option>
      <option value="withdrawn">Withdrawn</option>
    </select>
  );
}
