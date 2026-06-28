import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import BreedImportForm from "./BreedImportForm";

function formatDateTime(d: Date) {
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function BreedSettingsPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const [count, lastImport] = await Promise.all([
    prisma.breed.count({ where: { deletedAt: null } }),
    prisma.breedDataImport.findFirst({ orderBy: { importedAt: "desc" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link href="/dogs" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Dogs
      </Link>

      <h1 className="mt-2 text-2xl font-bold tracking-tight">Breed data</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Breed-specific KC health tests that power the Add Dog form. The KC updates these
        roughly twice a year — refresh them here when they change.
      </p>

      {/* Status */}
      <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">Currently loaded</p>
            <p className="text-2xl font-bold tracking-tight">{count} breeds</p>
          </div>
          <div className="text-right text-sm text-neutral-500">
            {lastImport ? (
              <>
                <p>Last updated</p>
                <p className="font-medium text-neutral-700 dark:text-neutral-300">{formatDateTime(lastImport.importedAt)}</p>
                {lastImport.source && <p className="text-xs">{lastImport.source}</p>}
              </>
            ) : (
              <p>No imports recorded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* How to refresh */}
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-sm dark:border-blue-500/30 dark:bg-blue-500/5">
        <p className="font-semibold text-blue-900 dark:text-blue-200">How to refresh</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-blue-800/90 dark:text-blue-200/90">
          <li>Open your KC breed-data Google Sheet.</li>
          <li><strong>File → Download → Comma-separated values (.csv)</strong> (the breed tab).</li>
          <li>Upload that file below (or paste its contents) and import.</li>
        </ol>
        <p className="mt-2 text-xs text-blue-800/70 dark:text-blue-200/70">
          The CSV needs a header row with a <code>Breed</code> column plus the Good/Best Practice columns.
          Importing fully replaces the current breed list.
        </p>
      </div>

      <BreedImportForm />
    </div>
  );
}
