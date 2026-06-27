import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import BuyerForm from "../../BuyerForm";

export default async function EditBuyerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id } = await params;

  const buyer = await prisma.buyer.findFirst({
    where: { id, breederId: breeder.id, deletedAt: null },
  });

  if (!buyer) notFound();

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href={`/buyers/${buyer.id}`}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Back to {buyer.name}
        </Link>
        <h1 className="mt-1 text-lg font-medium">Edit buyer</h1>
      </header>

      <BuyerForm
        mode="edit"
        id={buyer.id}
        name={buyer.name}
        email={buyer.email ?? ""}
        phone={buyer.phone ?? ""}
        address={buyer.address ?? ""}
        notes={buyer.notes ?? ""}
        status={buyer.status}
      />
    </main>
  );
}
