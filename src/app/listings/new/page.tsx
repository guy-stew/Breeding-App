import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import NewListingForm from "./NewListingForm";

export default async function NewListingPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  // Find puppies that don't already have a listing and are available/reserved.
  const puppies = await prisma.puppy.findMany({
    where: {
      deletedAt: null,
      listing: null,
      status: { in: ["available", "reserved"] },
      litter: { breederId: breeder.id, deletedAt: null },
    },
    include: {
      dog: { select: { callName: true, breed: true, sex: true, colour: true } },
      litter: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href="/listings"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Back to listings
        </Link>
        <h1 className="mt-1 text-lg font-medium">New listing</h1>
      </header>

      {puppies.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
          No available puppies to list. All puppies either already have
          listings or are sold/kept.
        </p>
      ) : (
        <NewListingForm
          puppies={puppies.map((p) => ({
            id: p.id,
            label: `${p.dog.callName || p.collarColour || "Pup"} — ${p.dog.breed}, ${p.dog.sex === "bitch" ? "F" : "M"}${p.dog.colour ? `, ${p.dog.colour}` : ""} (${p.litter.name ?? "litter"})`,
          }))}
        />
      )}
    </main>
  );
}
