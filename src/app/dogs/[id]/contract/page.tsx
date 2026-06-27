import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import ContractView from "./ContractView";

export default async function ContractPage({
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
      sire: { select: { callName: true, registeredName: true, microchip: true, kcRegNumber: true } },
      dam: { select: { callName: true, registeredName: true, microchip: true, kcRegNumber: true } },
      puppyRecord: {
        select: {
          birthWeightG: true,
          collarColour: true,
          priceP: true,
          litter: {
            select: { whelpDate: true, name: true },
          },
        },
      },
    },
  });

  if (!dog) notFound();

  // Serialise dates for the client component.
  const dogData = {
    id: dog.id,
    callName: dog.callName,
    registeredName: dog.registeredName,
    breed: dog.breed,
    sex: dog.sex,
    colour: dog.colour,
    markings: dog.markings,
    dateOfBirth: dog.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    microchip: dog.microchip,
    kcRegNumber: dog.kcRegNumber,
    sire: dog.sire
      ? {
          callName: dog.sire.callName,
          registeredName: dog.sire.registeredName,
          microchip: dog.sire.microchip,
          kcRegNumber: dog.sire.kcRegNumber,
        }
      : null,
    dam: dog.dam
      ? {
          callName: dog.dam.callName,
          registeredName: dog.dam.registeredName,
          microchip: dog.dam.microchip,
          kcRegNumber: dog.dam.kcRegNumber,
        }
      : null,
    puppyRecord: dog.puppyRecord
      ? { priceP: dog.puppyRecord.priceP }
      : null,
  };

  const breederData = {
    name: breeder.name,
    kennelName: breeder.kennelName,
    email: breeder.email,
    phone: breeder.phone,
    licenceNumber: breeder.licenceNumber,
    licenceAuthority: breeder.licenceAuthority,
  };

  return <ContractView dog={dogData} breeder={breederData} />;
}
