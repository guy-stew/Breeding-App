"use client";

import { useState } from "react";
import Link from "next/link";

type DogData = {
  id: string;
  callName: string | null;
  registeredName: string | null;
  breed: string;
  sex: string;
  colour: string | null;
  markings: string | null;
  dateOfBirth: string | null;
  microchip: string | null;
  kcRegNumber: string | null;
  sire: {
    callName: string | null;
    registeredName: string | null;
    microchip: string | null;
    kcRegNumber: string | null;
  } | null;
  dam: {
    callName: string | null;
    registeredName: string | null;
    microchip: string | null;
    kcRegNumber: string | null;
  } | null;
  puppyRecord: { priceP: number | null } | null;
};

type BreederData = {
  name: string;
  kennelName: string | null;
  email: string | null;
  phone: string | null;
  licenceNumber: string | null;
  licenceAuthority: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "_______________";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function penceToDisplay(pence: number | null): string {
  if (!pence) return "";
  return `£${(pence / 100).toFixed(2)}`;
}

export default function ContractView({
  dog,
  breeder,
}: {
  dog: DogData;
  breeder: BreederData;
}) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [salePrice, setSalePrice] = useState(
    dog.puppyRecord?.priceP ? penceToDisplay(dog.puppyRecord.priceP) : "",
  );
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [showPreview, setShowPreview] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900";
  const labelClass = "mb-1 block text-xs text-neutral-500";

  if (showPreview) {
    return (
      <div className="print-page">
        {/* Print / back controls */}
        <div className="no-print mx-auto flex max-w-2xl items-center justify-between p-4">
          <button
            onClick={() => setShowPreview(false)}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            ← Edit details
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Print / Save as PDF
          </button>
        </div>

        {/* Contract document */}
        <article className="mx-auto max-w-2xl bg-white p-8 text-black dark:bg-white">
          <h1 className="mb-1 text-center text-xl font-bold">
            Puppy Sale Contract
          </h1>
          {breeder.kennelName && (
            <p className="mb-6 text-center text-sm text-neutral-500">
              {breeder.kennelName}
            </p>
          )}

          {/* 1. Parties */}
          <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide">
            1. Parties
          </h2>
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold">Breeder (Seller)</p>
              <p>{breeder.name}</p>
              {breeder.kennelName && <p>{breeder.kennelName}</p>}
              {breeder.email && <p>{breeder.email}</p>}
              {breeder.phone && <p>{breeder.phone}</p>}
              {breeder.licenceNumber && (
                <p className="mt-1 text-xs text-neutral-500">
                  Licence: {breeder.licenceNumber}
                  {breeder.licenceAuthority &&
                    ` (${breeder.licenceAuthority})`}
                </p>
              )}
            </div>
            <div>
              <p className="font-semibold">Buyer</p>
              <p>{buyerName || "_______________"}</p>
              <p className="whitespace-pre-line">
                {buyerAddress || "_______________"}
              </p>
              {buyerEmail && <p>{buyerEmail}</p>}
              {buyerPhone && <p>{buyerPhone}</p>}
            </div>
          </div>

          {/* 2. Puppy description */}
          <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide">
            2. Description of Puppy
          </h2>
          <table className="mb-4 w-full text-sm">
            <tbody>
              <Row label="Breed" value={dog.breed} />
              <Row
                label="Sex"
                value={dog.sex === "bitch" ? "Female" : "Male"}
              />
              <Row label="Call name" value={dog.callName} />
              <Row label="Registered name" value={dog.registeredName} />
              <Row label="Colour / markings" value={[dog.colour, dog.markings].filter(Boolean).join(", ") || null} />
              <Row label="Date of birth" value={formatDate(dog.dateOfBirth)} />
              <Row label="Microchip" value={dog.microchip} />
              <Row label="KC registration" value={dog.kcRegNumber} />
            </tbody>
          </table>

          {/* 3. Parentage */}
          <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide">
            3. Parentage
          </h2>
          <table className="mb-4 w-full text-sm">
            <tbody>
              <Row
                label="Sire"
                value={
                  dog.sire
                    ? `${dog.sire.callName ?? ""}${dog.sire.registeredName ? ` (${dog.sire.registeredName})` : ""}`
                    : null
                }
              />
              {dog.sire?.microchip && (
                <Row label="Sire microchip" value={dog.sire.microchip} />
              )}
              <Row
                label="Dam"
                value={
                  dog.dam
                    ? `${dog.dam.callName ?? ""}${dog.dam.registeredName ? ` (${dog.dam.registeredName})` : ""}`
                    : null
                }
              />
              {dog.dam?.microchip && (
                <Row label="Dam microchip" value={dog.dam.microchip} />
              )}
            </tbody>
          </table>

          {/* 4. Sale */}
          <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide">
            4. Sale
          </h2>
          <table className="mb-4 w-full text-sm">
            <tbody>
              <Row label="Sale price" value={salePrice || "_______________"} />
              <Row label="Date of sale" value={formatDate(saleDate)} />
            </tbody>
          </table>

          {/* 5. Breeder declarations */}
          <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide">
            5. Breeder Declarations
          </h2>
          <ol className="mb-4 list-inside list-decimal space-y-1.5 text-sm leading-relaxed">
            <li>
              The puppy has been raised in a clean, safe home environment and
              has been socialised appropriately for its age.
            </li>
            <li>
              The puppy has been health-checked by a veterinary surgeon and, to
              the best of the breeder's knowledge, is in good health at the
              point of sale.
            </li>
            <li>
              The puppy has received age-appropriate vaccinations and worming
              treatments, details of which are provided in the accompanying
              puppy information pack.
            </li>
            <li>
              The puppy has been microchipped in accordance with UK law and the
              breeder's details are currently registered as the keeper.
            </li>
            {breeder.licenceNumber && (
              <li>
                The breeder holds a valid animal activities licence (number:{" "}
                {breeder.licenceNumber}) issued by{" "}
                {breeder.licenceAuthority ?? "the local authority"}.
              </li>
            )}
          </ol>

          {/* 6. Buyer responsibilities */}
          <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide">
            6. Buyer Responsibilities
          </h2>
          <ol className="mb-4 list-inside list-decimal space-y-1.5 text-sm leading-relaxed">
            <li>
              The buyer agrees to transfer the microchip registration into
              their name within 7 days of collection.
            </li>
            <li>
              The buyer agrees to provide appropriate food, shelter,
              veterinary care, exercise, and socialisation for the life of the
              dog.
            </li>
            <li>
              The buyer agrees to have the puppy checked by their own
              veterinary surgeon within 72 hours of collection. If a
              significant health issue is found at this check that was not
              disclosed by the breeder, the buyer should contact the breeder
              immediately to discuss options.
            </li>
            <li>
              The buyer agrees not to rehome, sell, or surrender the dog
              without first offering the breeder the opportunity to take the
              dog back.
            </li>
            <li>
              The buyer agrees to keep the breeder reasonably informed of the
              dog's welfare and to allow the breeder to follow up if concerns
              arise.
            </li>
          </ol>

          {/* 7. Return policy */}
          <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide">
            7. Return Policy
          </h2>
          <p className="mb-4 text-sm leading-relaxed">
            If at any point the buyer is unable to keep the dog, the breeder
            asks to be contacted first so that the dog can be returned or
            rehomed responsibly. The breeder will accept the dog back at any
            age. Refund terms, if applicable, will be discussed on a
            case-by-case basis.
          </p>

          {/* 8. Limitation */}
          <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide">
            8. Limitation of Liability
          </h2>
          <p className="mb-4 text-sm leading-relaxed">
            This contract does not override the buyer's statutory rights under
            the Consumer Rights Act 2015 or any other applicable legislation.
            The breeder's liability is limited to the sale price of the puppy.
          </p>

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="mb-8 font-semibold">Breeder signature</p>
              <div className="border-b border-black" />
              <p className="mt-1 text-xs text-neutral-500">
                {breeder.name} — Date: ___________
              </p>
            </div>
            <div>
              <p className="mb-8 font-semibold">Buyer signature</p>
              <div className="border-b border-black" />
              <p className="mt-1 text-xs text-neutral-500">
                {buyerName || "_______________"} — Date: ___________
              </p>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Form view
  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href={`/dogs/${dog.id}`}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Back to {dog.callName ?? "dog"}
        </Link>
        <h1 className="mt-1 text-lg font-medium">Generate contract</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Enter the buyer's details below. The puppy and breeder info will be
          filled in automatically.
        </p>
      </header>

      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="buyerName">
            Buyer name <span className="text-red-500">*</span>
          </label>
          <input
            id="buyerName"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Full name"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="buyerAddress">
            Buyer address
          </label>
          <textarea
            id="buyerAddress"
            value={buyerAddress}
            onChange={(e) => setBuyerAddress(e.target.value)}
            rows={3}
            placeholder="Street, town, postcode"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="buyerEmail">
            Buyer email
          </label>
          <input
            id="buyerEmail"
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="buyerPhone">
            Buyer phone
          </label>
          <input
            id="buyerPhone"
            type="tel"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="salePrice">
            Sale price
          </label>
          <input
            id="salePrice"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="e.g. £2,500"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="saleDate">
            Date of sale / collection
          </label>
          <input
            id="saleDate"
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Link
            href={`/dogs/${dog.id}`}
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-center text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Preview contract
          </button>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <tr className="border-b border-neutral-200">
      <td className="py-1.5 pr-4 text-neutral-500">{label}</td>
      <td className="py-1.5 font-medium">{value || "—"}</td>
    </tr>
  );
}
