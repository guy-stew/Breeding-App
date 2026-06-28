import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import DogsTable, { type DogRow } from "./DogsTable";

const DAY = 1000 * 60 * 60 * 24;

function ageLabel(dob: Date | null): string {
  if (!dob) return "—";
  const months = Math.floor((Date.now() - dob.getTime()) / DAY / 30.44);
  if (months < 24) return `${Math.max(0, months)} mo`;
  return `${Math.floor(months / 12)} yrs`;
}

const SCREENING_TYPES = ["hip_score", "elbow_score", "eye_test", "dna_test"] as const;

export default async function DogsPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const dogs = await prisma.dog.findMany({
    where: {
      deletedAt: null,
      breederId: breeder.id,
      puppyRecord: null,
      status: "active",
    },
    orderBy: [{ callName: "asc" }],
    include: {
      healthRecords: {
        where: { deletedAt: null, type: { in: [...SCREENING_TYPES] } },
        select: { id: true },
      },
      mathingsAsDam: {
        where: { deletedAt: null },
        include: { litter: { include: { puppies: { where: { deletedAt: null }, select: { id: true } } } } },
      },
      matingsAsSire: {
        where: { deletedAt: null },
        include: { litter: { include: { puppies: { where: { deletedAt: null }, select: { id: true } } } } },
      },
    },
  });

  const rows: DogRow[] = dogs.map((d) => {
    const isDam = d.sex === "bitch";
    const matings = isDam ? d.mathingsAsDam : d.matingsAsSire;
    const withLitter = matings.filter((m) => m.litter);
    const pups = withLitter.reduce((n, m) => n + (m.litter?.puppies.length ?? 0), 0);
    return {
      id: d.id,
      name: d.callName || d.registeredName || "Unnamed",
      breed: d.breed,
      role: isDam ? "dam" : "sire",
      external: d.ownership === "external",
      ageLabel: ageLabel(d.dateOfBirth),
      litters: withLitter.length,
      pups,
      screened: d.healthRecords.length > 0,
    };
  });

  const dams = rows.filter((r) => r.role === "dam").length;
  const sires = rows.length - dams;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <DogsTable rows={rows} total={rows.length} dams={dams} sires={sires} />
    </div>
  );
}
