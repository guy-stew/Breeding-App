import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import EditDogForm from "./EditDogForm";

export default async function EditDogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id } = await params;

  const dog = await prisma.dog.findFirst({
    where: { id, breederId: breeder.id, deletedAt: null },
  });

  if (!dog) notFound();

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href={`/dogs/${dog.id}`}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Back to {dog.callName ?? "dog"}
        </Link>
        <h1 className="mt-1 text-lg font-medium">Edit dog</h1>
      </header>

      <EditDogForm
        id={dog.id}
        callName={dog.callName ?? ""}
        registeredName={dog.registeredName ?? ""}
        breed={dog.breed}
        sex={dog.sex}
        colour={dog.colour ?? ""}
        markings={dog.markings ?? ""}
        dateOfBirth={
          dog.dateOfBirth
            ? dog.dateOfBirth.toISOString().slice(0, 10)
            : ""
        }
        microchip={dog.microchip ?? ""}
        kcRegNumber={dog.kcRegNumber ?? ""}
      />
    </div>
  );
}
