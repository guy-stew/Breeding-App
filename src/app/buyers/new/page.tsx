import Link from "next/link";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import BuyerForm from "../BuyerForm";

export default async function NewBuyerPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href="/buyers"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Buyers
        </Link>
        <h1 className="mt-1 text-lg font-medium">Add a buyer</h1>
      </header>

      <BuyerForm mode="create" />
    </div>
  );
}
