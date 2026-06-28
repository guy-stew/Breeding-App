// ============================================================
//  src/app/dogs/new/AddDogForm.tsx — the detailed add-a-dog form.
//
//  Client component. Identity is all that's needed to save (breed
//  + sex); Health screening and DNA tests are optional and persist
//  as HealthRecord rows via the addDog server action.
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addDog } from "../../actions";

const DNA_GENES = [
  "CEA (Collie Eye Anomaly)",
  "DM (Degenerative Myelopathy)",
  "TNS (Trapped Neutrophil Syndrome)",
  "CL (Ceroid Lipofuscinosis)",
  "MDR1 (Drug Sensitivity)",
  "Other",
];
const DNA_RESULTS = ["Clear", "Carrier", "Affected"];
const EYE_RESULTS = ["Not tested", "Clear", "Affected"];

type DnaTest = { gene: string; result: string };

export default function AddDogForm() {
  const router = useRouter();

  // Identity
  const [breed, setBreed] = useState("");
  const [callName, setCallName] = useState("");
  const [sex, setSex] = useState<"" | "dog" | "bitch">("");
  const [colour, setColour] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [microchip, setMicrochip] = useState("");
  const [kcRegNumber, setKcRegNumber] = useState("");
  const [external, setExternal] = useState(false);

  // Health screening
  const [hipScore, setHipScore] = useState("");
  const [elbowScore, setElbowScore] = useState("");
  const [eyeTest, setEyeTest] = useState("Not tested");
  const [testDate, setTestDate] = useState("");

  // DNA
  const [dnaTests, setDnaTests] = useState<DnaTest[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addDna() {
    setDnaTests((t) => [...t, { gene: DNA_GENES[0], result: DNA_RESULTS[0] }]);
  }
  function updateDna(i: number, patch: Partial<DnaTest>) {
    setDnaTests((t) => t.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }
  function removeDna(i: number) {
    setDnaTests((t) => t.filter((_, idx) => idx !== i));
  }

  function handleSave() {
    setError(null);
    if (!breed.trim()) return setError("Please enter a breed.");
    if (sex !== "dog" && sex !== "bitch") return setError("Please choose bitch or dog.");

    startTransition(async () => {
      try {
        const result = await addDog({
          callName, breed, sex, colour, dateOfBirth, microchip,
          kcRegNumber, external, hipScore, elbowScore, eyeTest, testDate,
          dnaTests: dnaTests.filter((d) => d.gene.trim()),
        });
        if (result && !result.ok) setError(result.error);
      } catch (e) {
        if (
          e && typeof e === "object" && "digest" in e &&
          typeof (e as { digest?: unknown }).digest === "string" &&
          (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw e;
        }
        setError("Something went wrong saving the dog.");
      }
    });
  }

  const input =
    "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-950";
  const label = "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300";
  const cardClass = "rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900";
  const cardTitle = "mb-4 flex items-center gap-2 text-base font-semibold";

  return (
    <div className="space-y-4">
      {/* Identity */}
      <div className={cardClass}>
        <h2 className={cardTitle}>
          <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
          </svg>
          Identity
        </h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="breed">Breed <span className="text-red-500">*</span></label>
              <input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Border Collie" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="callName">Call name</label>
              <input id="callName" value={callName} onChange={(e) => setCallName(e.target.value)} placeholder="Willow" className={input} />
            </div>
          </div>

          <div>
            <label className={label}>Sex <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {([["bitch", "Bitch (dam)"], ["dog", "Dog (sire)"]] as const).map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSex(val)}
                  className={
                    "rounded-lg border px-4 py-2.5 text-sm font-medium transition " +
                    (sex === val
                      ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-300"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300")
                  }
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="colour">Colour / markings</label>
              <input id="colour" value={colour} onChange={(e) => setColour(e.target.value)} placeholder="Black and white" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="dob">Date of birth</label>
              <input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={input} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="microchip">Microchip number</label>
              <input id="microchip" value={microchip} onChange={(e) => setMicrochip(e.target.value)} placeholder="985 1410 0000 0000" inputMode="numeric" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="kc">KC registration</label>
              <input id="kc" value={kcRegNumber} onChange={(e) => setKcRegNumber(e.target.value)} placeholder="AW01234567" className={input} />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg bg-neutral-100 px-4 py-3 text-sm dark:bg-neutral-800/50">
            <input type="checkbox" checked={external} onChange={(e) => setExternal(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" />
            External dog — a colleague&apos;s stud, kept for reference only
          </label>
        </div>
      </div>

      {/* Health screening */}
      <div className={cardClass}>
        <h2 className={cardTitle}>
          <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h13.5c.621 0 1.125-.504 1.125-1.125V8.625c0-.621-.504-1.125-1.125-1.125H17.25" />
          </svg>
          Health screening
        </h2>
        <p className="-mt-2 mb-4 text-sm text-neutral-500">Used to check breeding eligibility. A failing result blocks matings.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="hip">Hip score</label>
            <input id="hip" value={hipScore} onChange={(e) => setHipScore(e.target.value)} placeholder="e.g. 4:3" className={input} />
            <p className="mt-1 text-xs text-neutral-400">Lower is better · breed median shown on save</p>
          </div>
          <div>
            <label className={label} htmlFor="elbow">Elbow score</label>
            <input id="elbow" value={elbowScore} onChange={(e) => setElbowScore(e.target.value)} placeholder="e.g. 0" className={input} />
            <p className="mt-1 text-xs text-neutral-400">0 is ideal · 0–3 scale</p>
          </div>
          <div>
            <label className={label} htmlFor="eye">Eye test result</label>
            <select id="eye" value={eyeTest} onChange={(e) => setEyeTest(e.target.value)} className={input}>
              {EYE_RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="testDate">Test date</label>
            <input id="testDate" type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className={input} />
          </div>
        </div>
      </div>

      {/* DNA tests */}
      <div className={cardClass}>
        <h2 className={cardTitle}>
          <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
          DNA tests
        </h2>
        <p className="-mt-2 mb-4 text-sm text-neutral-500">Add as many as you have. Each shows clear, carrier, or affected.</p>
        <div className="space-y-2.5">
          {dnaTests.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <select value={d.gene} onChange={(e) => updateDna(i, { gene: e.target.value })} className={input + " flex-1"}>
                {DNA_GENES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={d.result} onChange={(e) => updateDna(i, { result: e.target.value })} className={input + " w-36"}>
                {DNA_RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="button" onClick={() => removeDna(i)} aria-label="Remove DNA test" className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={addDna} className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add DNA test
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save dog"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dogs")}
          className="rounded-lg border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
