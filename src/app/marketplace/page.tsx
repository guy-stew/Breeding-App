import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatAge(dob: Date | null | undefined): string | null {
  if (!dob) return null;
  const ms = Date.now() - dob.getTime();
  const weeks = Math.floor(ms / (1000 * 60 * 60 * 24 * 7));
  if (weeks < 1) return "Newborn";
  if (weeks === 1) return "1 week old";
  return `${weeks} weeks old`;
}

export default async function MarketplacePage() {
  const listings = await prisma.listing.findMany({
    where: { status: "active", deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      puppy: {
        include: {
          dog: {
            include: {
              photos: {
                where: { deletedAt: null },
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
          litter: {
            select: {
              breeder: {
                select: { kennelName: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-2xl p-4">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Available Puppies</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Browse puppies from registered breeders
        </p>
      </header>

      {listings.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
          No puppies available right now. Check back soon!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => {
            const dog = listing.puppy.dog;
            const breeder = listing.puppy.litter.breeder;
            const age = formatAge(dog.dateOfBirth);

            return (
              <Link
                key={listing.id}
                href={`/marketplace/${listing.id}`}
                className="block overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                {/* Photo or colour banner */}
                {dog.photos[0] ? (
                  <img
                    src={dog.photos[0].url}
                    alt={listing.title || dog.callName || "Puppy"}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-40 w-full"
                    style={{
                      backgroundColor:
                        listing.puppy.collarColour?.toLowerCase() ?? "#e5e5e5",
                    }}
                  />
                )}

                <div className="p-4">
                  <h2 className="text-sm font-bold">
                    {listing.title || dog.callName || "Puppy"}
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {dog.breed} ·{" "}
                    {dog.sex === "bitch" ? "Female" : "Male"}
                    {dog.colour ? ` · ${dog.colour}` : ""}
                  </p>
                  {age && (
                    <p className="mt-0.5 text-xs text-neutral-400">{age}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {listing.priceText || "POA"}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {breeder.kennelName || breeder.name}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
