import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import ListingStatusButton from "./ListingStatusButton";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  sold: "Sold",
  withdrawn: "Withdrawn",
};

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  sold: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  withdrawn: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export default async function ListingsPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const listings = await prisma.listing.findMany({
    where: {
      deletedAt: null,
      puppy: { litter: { breederId: breeder.id } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      puppy: {
        include: {
          dog: { select: { callName: true, breed: true, sex: true, colour: true } },
          litter: { select: { name: true } },
        },
      },
    },
  });

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
          <h1 className="text-lg font-medium">My listings</h1>
          <Link
            href="/listings/new"
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            + New listing
          </Link>
        </div>
      </header>

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        Active listings appear on the{" "}
        <Link href="/marketplace" className="font-medium underline">
          public marketplace
        </Link>
        .
      </div>

      {listings.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
          No listings yet.{" "}
          <Link href="/listings/new" className="text-blue-600 dark:text-blue-400">
            Create your first listing
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {listings.map((listing) => (
            <li key={listing.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {listing.title ||
                      listing.puppy.dog.callName ||
                      listing.puppy.collarColour ||
                      "Puppy"}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {listing.puppy.dog.breed} ·{" "}
                    {listing.puppy.dog.sex === "bitch" ? "Female" : "Male"}
                    {listing.puppy.dog.colour
                      ? ` · ${listing.puppy.dog.colour}`
                      : ""}
                    {listing.priceText ? ` · ${listing.priceText}` : ""}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-400">
                    {listing.puppy.litter.name ?? "Litter"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASSES[listing.status] ?? ""}`}
                  >
                    {STATUS_LABELS[listing.status] ?? listing.status}
                  </span>
                  <ListingStatusButton
                    listingId={listing.id}
                    currentStatus={listing.status}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
