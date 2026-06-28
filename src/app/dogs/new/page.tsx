// ============================================================
//  src/app/dogs/new/page.tsx — the "add a dog" screen.
//  Thin server frame; the interactive part is AddDogForm.
// ============================================================

import Link from "next/link";
import AddDogForm from "./AddDogForm";

export default function NewDogPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <header className="mb-5">
        <Link
          href="/dogs"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Dogs
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Add dog</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Breed and sex are needed to save. Health screening can be added now or later.
        </p>
      </header>

      <AddDogForm />
    </div>
  );
}
