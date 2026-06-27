import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  enquiry: "Enquiry",
  waitlist: "Waitlist",
  deposit_paid: "Deposit paid",
  collected: "Collected",
};

const STATUS_COLOURS: Record<string, string> = {
  enquiry: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  waitlist: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  deposit_paid: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  collected: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export default async function BuyersPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const buyers = await prisma.buyer.findMany({
    where: { breederId: breeder.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      puppies: {
        where: { deletedAt: null },
        select: {
          collarColour: true,
          dog: { select: { callName: true } },
          litter: { select: { name: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Home
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-medium">Buyers</h1>
          <Link
            href="/buyers/new"
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            + Add buyer
          </Link>
        </div>
      </header>

      {buyers.length === 0 ? (
        <p className="mt-8 text-center text-sm text-neutral-400">
          No buyers yet.{" "}
          <Link href="/buyers/new" className="text-blue-600 dark:text-blue-400">
            Add your first buyer
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {buyers.map((buyer) => (
            <li key={buyer.id}>
              <Link
                href={`/buyers/${buyer.id}`}
                className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {buyer.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{buyer.name}</div>
                  <div className="text-xs text-neutral-500">
                    {buyer.puppies.length > 0
                      ? buyer.puppies
                          .map(
                            (p) =>
                              p.collarColour ?? p.dog.callName ?? "puppy",
                          )
                          .join(", ")
                      : "No puppy assigned"}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOURS[buyer.status] ?? ""}`}
                >
                  {STATUS_LABELS[buyer.status] ?? buyer.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
