// ============================================================
//  src/app/dogs/new/page.tsx — the "add a dog" screen.
//
//  A thin server component: it just sets up the page frame and a
//  "back home" link, then drops in the AddDogForm (the interactive
//  part). The actual saving happens in the addDog server action.
// ============================================================

import Link from "next/link";
import AddDogForm from "./AddDogForm";

export default function NewDogPage() {
  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Home
        </Link>
        <h1 className="text-lg font-medium">Add a dog</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Only breed and sex are required. You can fill in the rest later.
        </p>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <AddDogForm />
      </section>
    </main>
  );
}
