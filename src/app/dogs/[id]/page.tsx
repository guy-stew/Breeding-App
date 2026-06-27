import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ageFromDob(dob: Date | null | undefined): string | null {
  if (!dob) return null;
  const ms = Date.now() - dob.getTime();
  const totalDays = Math.floor(ms / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  if (years > 0) return `${years}y ${months}m`;
  if (months > 0) return `${months}m`;
  return `${totalDays}d`;
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${grams} g`;
}

export default async function DogProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id } = await params;

  const dog = await prisma.dog.findFirst({
    where: { id, breederId: breeder.id, deletedAt: null },
    include: {
      sire: { select: { id: true, callName: true } },
      dam: { select: { id: true, callName: true } },
      weightLogs: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 10,
      },
      puppyRecord: {
        select: {
          collarColour: true,
          birthOrder: true,
          birthWeightG: true,
          status: true,
          litter: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!dog) notFound();

  const age = ageFromDob(dog.dateOfBirth);
  const latestWeight = dog.weightLogs[0];

  // Detail rows: label + value pairs
  const details: [string, string][] = [
    ["Registered name", dog.registeredName ?? "—"],
    ["Breed", dog.breed],
    ["Sex", dog.sex === "bitch" ? "Bitch" : "Dog"],
    ["Colour", dog.colour ?? "—"],
    ["Markings", dog.markings ?? "—"],
    ["Date of birth", formatDate(dog.dateOfBirth)],
    ["Age", age ?? "—"],
    ["Microchip", dog.microchip ?? "—"],
    ["KC reg", dog.kcRegNumber ?? "—"],
    ["Status", dog.status],
    ["Ownership", dog.ownership.replace("_", "-")],
    ["C-sections", String(dog.caesareanCount)],
  ];

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Home
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-medium">
            {dog.callName ?? "Unnamed dog"}
          </h1>
          <Link
            href={`/dogs/${dog.id}/edit`}
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            Edit
          </Link>
        </div>
      </header>

      {/* Puppy info banner */}
      {dog.puppyRecord && (
        <div className="mb-4 rounded-xl border border-blue-500/40 bg-blue-50 p-3 dark:bg-blue-950">
          <p className="text-sm">
            <span className="font-medium">
              {dog.puppyRecord.collarColour} collar
            </span>{" "}
            — puppy #{dog.puppyRecord.birthOrder} in{" "}
            <Link
              href={`/litters/${dog.puppyRecord.litter.id}`}
              className="font-medium text-blue-600 dark:text-blue-400"
            >
              {dog.puppyRecord.litter.name ?? "litter"}
            </Link>
          </p>
          {dog.puppyRecord.birthWeightG && (
            <p className="mt-1 text-xs text-neutral-500">
              Birth weight: {formatWeight(dog.puppyRecord.birthWeightG)}
            </p>
          )}
        </div>
      )}

      {/* Details card */}
      <section className="mb-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-2.5">
              <dt className="text-sm text-neutral-500">{label}</dt>
              <dd className="text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Parents */}
      {(dog.sire || dog.dam) && (
        <section className="mb-5">
          <p className="mb-2 px-1 text-xs text-neutral-400">Parents</p>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {dog.sire && (
              <Link
                href={`/dogs/${dog.sire.id}`}
                className="flex justify-between px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <span className="text-sm text-neutral-500">Sire</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {dog.sire.callName ?? "Unknown"}
                </span>
              </Link>
            )}
            {dog.dam && (
              <Link
                href={`/dogs/${dog.dam.id}`}
                className="flex justify-between border-t border-neutral-200 px-4 py-2.5 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
              >
                <span className="text-sm text-neutral-500">Dam</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {dog.dam.callName ?? "Unknown"}
                </span>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Paperwork */}
      <section className="mb-5">
        <p className="mb-2 px-1 text-xs text-neutral-400">Paperwork</p>
        <div className="flex gap-2">
          <Link
            href={`/dogs/${dog.id}/contract`}
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-center text-sm font-medium hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            Puppy contract
          </Link>
          <Link
            href={`/dogs/${dog.id}/info-pack`}
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-center text-sm font-medium hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            Info pack
          </Link>
        </div>
      </section>

      {/* Recent weights */}
      <section>
        <p className="mb-2 px-1 text-xs text-neutral-400">
          Recent weights
          {latestWeight && (
            <span className="ml-2 font-medium text-neutral-600 dark:text-neutral-300">
              (latest: {formatWeight(latestWeight.weightG)})
            </span>
          )}
        </p>
        {dog.weightLogs.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            No weights recorded yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-400 dark:border-neutral-800">
                  <th className="px-4 py-2 font-normal">Date</th>
                  <th className="px-4 py-2 text-right font-normal">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {dog.weightLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2">{formatDate(log.date)}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatWeight(log.weightG)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
