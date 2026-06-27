import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  enquiry: "Enquiry",
  waitlist: "Waitlist",
  deposit_paid: "Deposit paid",
  collected: "Collected",
};

export default async function BuyerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id } = await params;

  const buyer = await prisma.buyer.findFirst({
    where: { id, breederId: breeder.id, deletedAt: null },
    include: {
      puppies: {
        where: { deletedAt: null },
        include: {
          dog: { select: { id: true, callName: true, breed: true } },
          litter: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!buyer) notFound();

  const details: [string, string][] = [
    ["Email", buyer.email ?? "—"],
    ["Phone", buyer.phone ?? "—"],
    ["Address", buyer.address ?? "—"],
    ["Status", STATUS_LABELS[buyer.status] ?? buyer.status],
    [
      "Added",
      buyer.createdAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    ],
  ];

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href="/buyers"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Buyers
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-medium">{buyer.name}</h1>
          <Link
            href={`/buyers/${buyer.id}/edit`}
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            Edit
          </Link>
        </div>
      </header>

      {/* Details card */}
      <section className="mb-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-2.5">
              <dt className="text-sm text-neutral-500">{label}</dt>
              <dd className="text-sm font-medium whitespace-pre-line text-right">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {buyer.notes && (
        <section className="mb-5">
          <p className="mb-2 px-1 text-xs text-neutral-400">Notes</p>
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 whitespace-pre-line dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            {buyer.notes}
          </p>
        </section>
      )}

      {/* Linked puppies */}
      <section>
        <p className="mb-2 px-1 text-xs text-neutral-400">
          Linked puppies · {buyer.puppies.length}
        </p>
        {buyer.puppies.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            No puppies assigned to this buyer yet.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {buyer.puppies.map((puppy) => (
              <li key={puppy.id}>
                <Link
                  href={`/dogs/${puppy.dog.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {puppy.collarColour ?? puppy.dog.callName ?? "Puppy"}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {puppy.dog.breed} ·{" "}
                      {puppy.litter.name ?? "litter"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick link to generate contract */}
      {buyer.puppies.length > 0 && (
        <div className="mt-4">
          <Link
            href={`/dogs/${buyer.puppies[0].dog.id}/contract`}
            className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white"
          >
            Generate contract for {buyer.puppies[0].collarColour ?? "puppy"}
          </Link>
        </div>
      )}
    </div>
  );
}
