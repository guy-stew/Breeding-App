import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import PrintButton from "./PrintButton";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${grams} g`;
}

export default async function InfoPackPage({
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
      sire: {
        select: {
          callName: true,
          registeredName: true,
          breed: true,
          colour: true,
          microchip: true,
          kcRegNumber: true,
        },
      },
      dam: {
        select: {
          callName: true,
          registeredName: true,
          breed: true,
          colour: true,
          microchip: true,
          kcRegNumber: true,
        },
      },
      weightLogs: {
        where: { deletedAt: null },
        orderBy: { date: "asc" },
      },
      puppyRecord: {
        select: {
          birthWeightG: true,
          collarColour: true,
          birthOrder: true,
          litter: { select: { whelpDate: true, name: true } },
        },
      },
      healthRecords: {
        where: { deletedAt: null },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!dog) notFound();

  return (
    <div className="print-page">
      {/* Controls — hidden when printing */}
      <div className="no-print mx-auto flex max-w-2xl items-center justify-between p-4">
        <Link
          href={`/dogs/${dog.id}`}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          ← Back to {dog.callName ?? "dog"}
        </Link>
        <PrintButton />
      </div>

      {/* Info pack document */}
      <article className="mx-auto max-w-2xl bg-white p-8 text-black dark:bg-white">
        <h1 className="mb-1 text-center text-xl font-bold">
          Puppy Information Pack
        </h1>
        {breeder.kennelName && (
          <p className="mb-6 text-center text-sm text-neutral-500">
            {breeder.kennelName}
          </p>
        )}

        {/* Puppy details */}
        <Section title="Your Puppy">
          <Table>
            <Row label="Call name" value={dog.callName} />
            <Row label="Registered name" value={dog.registeredName} />
            <Row label="Breed" value={dog.breed} />
            <Row
              label="Sex"
              value={dog.sex === "bitch" ? "Female" : "Male"}
            />
            <Row
              label="Colour / markings"
              value={
                [dog.colour, dog.markings].filter(Boolean).join(", ") || null
              }
            />
            <Row label="Date of birth" value={formatDate(dog.dateOfBirth)} />
            <Row label="Microchip number" value={dog.microchip} />
            <Row label="KC registration" value={dog.kcRegNumber} />
            {dog.puppyRecord?.birthWeightG && (
              <Row
                label="Birth weight"
                value={formatWeight(dog.puppyRecord.birthWeightG)}
              />
            )}
          </Table>
        </Section>

        {/* Parentage */}
        {(dog.sire || dog.dam) && (
          <Section title="Parentage">
            {dog.dam && (
              <>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Dam (mother)
                </p>
                <Table>
                  <Row label="Name" value={dog.dam.callName} />
                  <Row label="Registered name" value={dog.dam.registeredName} />
                  <Row label="Breed" value={dog.dam.breed} />
                  <Row label="Colour" value={dog.dam.colour} />
                  <Row label="Microchip" value={dog.dam.microchip} />
                  <Row label="KC reg" value={dog.dam.kcRegNumber} />
                </Table>
              </>
            )}
            {dog.sire && (
              <>
                <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Sire (father)
                </p>
                <Table>
                  <Row label="Name" value={dog.sire.callName} />
                  <Row
                    label="Registered name"
                    value={dog.sire.registeredName}
                  />
                  <Row label="Breed" value={dog.sire.breed} />
                  <Row label="Colour" value={dog.sire.colour} />
                  <Row label="Microchip" value={dog.sire.microchip} />
                  <Row label="KC reg" value={dog.sire.kcRegNumber} />
                </Table>
              </>
            )}
          </Section>
        )}

        {/* Weight history */}
        {dog.weightLogs.length > 0 && (
          <Section title="Weight Record">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-left text-xs text-neutral-500">
                  <th className="py-1.5 font-normal">Date</th>
                  <th className="py-1.5 text-right font-normal">Weight</th>
                  {dog.puppyRecord && (
                    <th className="py-1.5 text-right font-normal">Age</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {dog.weightLogs.map((log) => {
                  const ageDays = dog.dateOfBirth
                    ? Math.floor(
                        (log.date.getTime() - dog.dateOfBirth.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : null;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-neutral-200"
                    >
                      <td className="py-1.5">{formatDate(log.date)}</td>
                      <td className="py-1.5 text-right font-medium">
                        {formatWeight(log.weightG)}
                      </td>
                      {dog.puppyRecord && (
                        <td className="py-1.5 text-right text-neutral-500">
                          {ageDays !== null ? `Day ${ageDays}` : "—"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>
        )}

        {/* Feeding guide */}
        <Section title="Feeding Guide">
          <p className="text-sm leading-relaxed">
            Your puppy is currently eating{" "}
            <strong>__________________________________</strong> (brand and
            type). We recommend continuing with this food for at least the
            first two weeks to avoid stomach upset. If you wish to change
            food, do so gradually over 7–10 days by mixing increasing amounts
            of the new food with the current food.
          </p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-left text-xs text-neutral-500">
                <th className="py-1.5 font-normal">Age</th>
                <th className="py-1.5 font-normal">Meals per day</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-200">
                <td className="py-1.5">8–12 weeks</td>
                <td className="py-1.5">4 meals</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="py-1.5">3–6 months</td>
                <td className="py-1.5">3 meals</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="py-1.5">6–12 months</td>
                <td className="py-1.5">2 meals</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="py-1.5">12 months+</td>
                <td className="py-1.5">1–2 meals</td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* Healthcare */}
        <Section title="Healthcare Record">
          <p className="mb-3 text-sm leading-relaxed">
            Please bring this page to your first vet visit so your
            veterinary surgeon can see what has already been done.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-left text-xs text-neutral-500">
                <th className="py-1.5 font-normal">Treatment</th>
                <th className="py-1.5 font-normal">Product / details</th>
                <th className="py-1.5 font-normal">Date</th>
                <th className="py-1.5 font-normal">Next due</th>
              </tr>
            </thead>
            <tbody>
              {dog.healthRecords.length > 0
                ? dog.healthRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className="border-b border-neutral-200"
                    >
                      <td className="py-2">
                        {rec.type
                          .replace("_", " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </td>
                      <td className="py-2">
                        {rec.description ?? "—"}
                        {rec.result ? ` (${rec.result})` : ""}
                      </td>
                      <td className="py-2">{formatDate(rec.date)}</td>
                      <td className="py-2">
                        {rec.nextDueDate ? formatDate(rec.nextDueDate) : "—"}
                      </td>
                    </tr>
                  ))
                : [
                    "1st vaccination",
                    "2nd vaccination",
                    "Worming (1)",
                    "Worming (2)",
                    "Worming (3)",
                    "Flea treatment",
                  ].map((treatment) => (
                    <tr
                      key={treatment}
                      className="border-b border-neutral-200"
                    >
                      <td className="py-2">{treatment}</td>
                      <td className="py-2">___________________</td>
                      <td className="py-2">___________</td>
                      <td className="py-2">___________</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </Section>

        {/* Microchip */}
        <Section title="Microchip Information">
          <p className="text-sm leading-relaxed">
            Your puppy has been microchipped as required by UK law. The
            microchip number is{" "}
            <strong>{dog.microchip ?? "_______________"}</strong>. The
            breeder's details are currently registered as the keeper. You
            must transfer the registration into your name within{" "}
            <strong>7 days</strong> of taking the puppy home. Contact the
            microchip database provider to update.
          </p>
        </Section>

        {/* Breeder contact */}
        <Section title="Breeder Contact">
          <p className="text-sm leading-relaxed">
            If you have any questions or concerns about your puppy at any
            point in its life, please don't hesitate to get in touch. A
            responsible breeder wants to hear from you — good news and
            concerns alike.
          </p>
          <div className="mt-3 rounded border border-neutral-200 p-3 text-sm">
            <p className="font-semibold">{breeder.name}</p>
            {breeder.kennelName && <p>{breeder.kennelName}</p>}
            {breeder.email && <p>{breeder.email}</p>}
            {breeder.phone && <p>{breeder.phone}</p>}
          </div>
        </Section>
      </article>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <table className="mb-2 w-full text-sm">
      <tbody>{children}</tbody>
    </table>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <tr className="border-b border-neutral-200">
      <td className="py-1.5 pr-4 text-neutral-500">{label}</td>
      <td className="py-1.5 font-medium">{value || "—"}</td>
    </tr>
  );
}
