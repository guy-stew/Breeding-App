import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAge(dob: Date | null | undefined): string | null {
  if (!dob) return null;
  const ms = Date.now() - dob.getTime();
  const weeks = Math.floor(ms / (1000 * 60 * 60 * 24 * 7));
  if (weeks < 1) return "Newborn";
  if (weeks === 1) return "1 week old";
  return `${weeks} weeks old`;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, status: "active", deletedAt: null },
    include: {
      puppy: {
        include: {
          dog: {
            select: {
              callName: true,
              registeredName: true,
              breed: true,
              sex: true,
              colour: true,
              markings: true,
              dateOfBirth: true,
              microchip: true,
            },
            include: {
              sire: {
                select: { callName: true, breed: true, colour: true },
              },
              dam: {
                select: { callName: true, breed: true, colour: true },
              },
              healthRecords: {
                where: { deletedAt: null },
                orderBy: { date: "desc" },
                select: { type: true, description: true, date: true },
              },
            },
          },
          litter: {
            select: {
              whelpDate: true,
              name: true,
              breeder: {
                select: {
                  name: true,
                  kennelName: true,
                  email: true,
                  phone: true,
                  isLicensed: true,
                  licenceNumber: true,
                  licenceAuthority: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!listing) notFound();

  const dog = listing.puppy.dog;
  const breeder = listing.puppy.litter.breeder;
  const age = formatAge(dog.dateOfBirth);

  const details: [string, string][] = [
    ["Breed", dog.breed],
    ["Sex", dog.sex === "bitch" ? "Female" : "Male"],
    ["Colour", dog.colour ?? "—"],
    ["Markings", dog.markings ?? "—"],
    ["Date of birth", formatDate(dog.dateOfBirth)],
    ["Age", age ?? "—"],
    ["Microchipped", dog.microchip ? "Yes" : "—"],
  ];

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href="/marketplace"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Back to marketplace
        </Link>
      </header>

      {/* Colour banner */}
      <div
        className="mb-4 h-32 w-full rounded-xl"
        style={{
          backgroundColor:
            listing.puppy.collarColour?.toLowerCase() ?? "#e5e5e5",
        }}
      />

      <h1 className="text-xl font-bold">
        {listing.title || dog.callName || "Puppy"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {dog.breed} · {dog.sex === "bitch" ? "Female" : "Male"}
        {age ? ` · ${age}` : ""}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {listing.priceText || "POA"}
        </span>
      </div>

      {listing.description && (
        <p className="mt-4 whitespace-pre-line rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          {listing.description}
        </p>
      )}

      {/* Puppy details */}
      <section className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <p className="border-b border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-400 dark:border-neutral-800">
          Puppy details
        </p>
        <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-2.5">
              <dt className="text-sm text-neutral-500">{label}</dt>
              <dd className="text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Parentage */}
      {(dog.sire || dog.dam) && (
        <section className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <p className="border-b border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-400 dark:border-neutral-800">
            Parentage
          </p>
          <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {dog.sire && (
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-sm text-neutral-500">Sire</dt>
                <dd className="text-sm font-medium">
                  {dog.sire.callName ?? "—"}
                  {dog.sire.colour ? ` · ${dog.sire.colour}` : ""}
                </dd>
              </div>
            )}
            {dog.dam && (
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-sm text-neutral-500">Dam</dt>
                <dd className="text-sm font-medium">
                  {dog.dam.callName ?? "—"}
                  {dog.dam.colour ? ` · ${dog.dam.colour}` : ""}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Health checks done */}
      {dog.healthRecords.length > 0 && (
        <section className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <p className="border-b border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-400 dark:border-neutral-800">
            Health checks completed
          </p>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {dog.healthRecords.map((rec, i) => (
              <li key={i} className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {rec.type
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  {rec.description ? ` — ${rec.description}` : ""}
                </span>
                <span className="text-xs text-neutral-400">
                  {formatDate(rec.date)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Breeder contact */}
      <section className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <p className="border-b border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-400 dark:border-neutral-800">
          Breeder
        </p>
        <div className="p-4">
          <p className="text-sm font-medium">{breeder.name}</p>
          {breeder.kennelName && (
            <p className="text-sm text-neutral-500">{breeder.kennelName}</p>
          )}
          {breeder.isLicensed && breeder.licenceNumber && (
            <p className="mt-1 text-xs text-neutral-400">
              Licensed: {breeder.licenceNumber}
              {breeder.licenceAuthority
                ? ` (${breeder.licenceAuthority})`
                : ""}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {breeder.email && (
              <a
                href={`mailto:${breeder.email}`}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Email breeder
              </a>
            )}
            {breeder.phone && (
              <a
                href={`tel:${breeder.phone}`}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-center text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
              >
                Call
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
