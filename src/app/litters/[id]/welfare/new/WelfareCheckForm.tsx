"use client";

import { createWelfareCheck } from "@/app/actions";

export default function WelfareCheckForm({
  litterId,
}: {
  litterId: string;
}) {
  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";
  const labelClass = "mb-1 block text-xs text-neutral-500";

  return (
    <form action={createWelfareCheck} className="space-y-4">
      <input type="hidden" name="litterId" value={litterId} />

      <div>
        <label className={labelClass} htmlFor="date">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">
          General observations
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="e.g. All puppies nursing well, active and alert"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="damCondition">
          Dam condition
        </label>
        <textarea
          id="damCondition"
          name="damCondition"
          rows={2}
          placeholder="e.g. Eating well, no signs of mastitis, milk supply good"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="concerns">
          Any concerns?
        </label>
        <textarea
          id="concerns"
          name="concerns"
          rows={2}
          placeholder="e.g. Smallest pup not gaining as expected"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="actionTaken">
          Action taken
        </label>
        <textarea
          id="actionTaken"
          name="actionTaken"
          rows={2}
          placeholder="e.g. Supplementary feeding started for smallest pup"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        Save welfare check
      </button>
    </form>
  );
}
