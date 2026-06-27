"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBuyer, updateBuyer } from "../actions";

type Props =
  | { mode: "create" }
  | {
      mode: "edit";
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      notes: string;
      status: string;
    };

export default function BuyerForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";

  const [name, setName] = useState(isEdit ? props.name : "");
  const [email, setEmail] = useState(isEdit ? props.email : "");
  const [phone, setPhone] = useState(isEdit ? props.phone : "");
  const [address, setAddress] = useState(isEdit ? props.address : "");
  const [notes, setNotes] = useState(isEdit ? props.notes : "");
  const [status, setStatus] = useState(isEdit ? props.status : "enquiry");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEdit) {
          const result = await updateBuyer({
            id: props.id,
            name,
            email,
            phone,
            address,
            notes,
            status,
          });
          if (result && !result.ok) setError(result.error);
        } else {
          const result = await createBuyer({
            name,
            email,
            phone,
            address,
            notes,
            status,
          });
          if (!result.ok) {
            setError(result.error);
          } else {
            router.push(`/buyers/${result.buyerId}`);
            router.refresh();
          }
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
        <label className={labelClass} htmlFor="name">
          Name <span className="text-red-500">*</span>
        </label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="phone">Phone</label>
        <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="address">Address</label>
        <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass + " appearance-none"}>
          <option value="enquiry">Enquiry</option>
          <option value="waitlist">Waitlist</option>
          <option value="deposit_paid">Deposit paid</option>
          <option value="collected">Collected</option>
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="notes">Notes</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any notes about this buyer..." className={inputClass} />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
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
          {isPending ? "Saving..." : isEdit ? "Save changes" : "Add buyer"}
        </button>
      </div>
    </div>
  );
}
