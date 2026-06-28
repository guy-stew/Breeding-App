import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" },
  reserved: { label: "Reserved", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  sold: { label: "Sold", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  kept: { label: "Kept", cls: "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300" },
};

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] p-4 dark:bg-white/[0.04]">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

export default async function ContractsPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const puppies = await prisma.puppy.findMany({
    where: {
      deletedAt: null,
      litter: { breederId: breeder.id, deletedAt: null },
      OR: [{ buyerId: { not: null } }, { status: { in: ["reserved", "sold"] } }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      dog: { select: { id: true, callName: true, breed: true } },
      buyer: { select: { id: true, name: true } },
      litter: {
        select: {
          name: true,
          mating: { select: { dam: { select: { callName: true } }, sire: { select: { callName: true } } } },
        },
      },
    },
  });

  const withBuyer = puppies.filter((p) => p.buyer).length;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Contracts</h1>
        <p className="text-sm text-neutral-500">
          Puppy sale contracts — open a puppy to fill in the buyer details and print.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatTile label="Reserved / sold" value={puppies.length} />
        <StatTile label="Buyer assigned" value={withBuyer} />
        <StatTile label="Need a buyer" value={puppies.length - withBuyer} />
      </div>

      {puppies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">No reserved or sold puppies yet.</p>
          <Link href="/buyers" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            Manage buyers →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {puppies.map((p) => {
            const litterTitle =
              p.litter.mating?.dam?.callName && p.litter.mating?.sire?.callName
                ? `${p.litter.mating.dam.callName} × ${p.litter.mating.sire.callName}`
                : p.litter.name ?? "litter";
            const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.reserved;
            return (
              <Link
                key={p.id}
                href={`/dogs/${p.dogId}/contract`}
                className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 transition last:border-0 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/40"
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: p.collarColour?.toLowerCase() ?? "#9ca3af" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {p.collarColour ? `${p.collarColour} collar` : p.dog.callName ?? "Puppy"}
                    <span className="font-normal text-neutral-500"> · {litterTitle}</span>
                  </p>
                  <p className="text-sm text-neutral-500">
                    {p.buyer ? p.buyer.name : "No buyer yet"} · {p.dog.breed}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>
                  {badge.label}
                </span>
                <span className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400">Open contract →</span>
              </Link>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-xs text-neutral-400">
        Contracts are generated per puppy and printed to PDF from the browser. A stored contract
        library will come with the documents feature.
      </p>
    </div>
  );
}
