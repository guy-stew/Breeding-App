// ============================================================
//  Breed health-test parsing.
//
//  The KC data lists tests as free text bullets, e.g.
//    "• DNA test: degenerative myelopathy (DM)"
//    "• Hip testing (BVA/KC Hip Dysplasia Scheme)"
//    "• Eye testing & gonioscopy for PLA (BVA/KC/ISDS Eye Scheme)"
//    "• Breathing testing/BOAS (KC Respiratory Function Grading Scheme)"
//
//  We classify each into a category the Add Dog form understands
//  (hip / elbow / eye / dna / screening) so it can render the right
//  fields. Used by both the seed and the in-app CSV refresh.
// ============================================================

export type TestCategory = "hip" | "elbow" | "eye" | "dna" | "screening";

export type BreedTest = {
  category: TestCategory;
  label: string; // human label, e.g. "Degenerative myelopathy"
  code?: string; // e.g. "DM"
  raw: string; // original text, preserved for display/audit
  importedOnly?: boolean; // "[imported dogs must be tested]"
};

export type ParsedBreed = {
  name: string;
  top10: boolean;
  geneticDiversityPriority: boolean;
  breedClubScheme: boolean;
  breedWatch: boolean;
  goodPractice: BreedTest[];
  bestPractice: BreedTest[];
};

function capitalise(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const EMPTY_CELL = /^(—|-|–|none listed|none|n\/a)$/i;

function classifyTest(raw0: string): BreedTest {
  let raw = raw0.replace(/\s+/g, " ").trim();
  const importedOnly = /\[imported dogs must be tested\]/i.test(raw);
  raw = raw.replace(/\[imported dogs must be tested\]/gi, "").trim();
  const lower = raw.toLowerCase();

  if (lower.startsWith("dna test")) {
    const body = raw.replace(/^dna test:\s*/i, "");
    const m = body.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    const label = (m ? m[1] : body).trim();
    const code = m ? m[2].trim() : undefined;
    return { category: "dna", label: capitalise(label), code, raw: raw0.trim(), importedOnly };
  }
  if (/hip testing/i.test(raw)) {
    return { category: "hip", label: "Hip score (BVA/KC Hip Dysplasia Scheme)", raw: raw0.trim(), importedOnly };
  }
  if (/elbow testing/i.test(raw)) {
    return { category: "elbow", label: "Elbow score (BVA/KC Elbow Dysplasia Scheme)", raw: raw0.trim(), importedOnly };
  }
  if (/eye testing|gonioscopy/i.test(raw)) {
    const label = raw.replace(/\s*\(.*$/, "").trim() || "Eye test (BVA/KC/ISDS Eye Scheme)";
    return { category: "eye", label, raw: raw0.trim(), importedOnly };
  }
  // Everything else is a scheme-based screening (BOAS, MVD heart, IVDD
  // spine, BAER hearing, CM/SM, etc.) — keep the descriptive name.
  const label = raw.replace(/\s*\(.*$/, "").trim() || raw;
  return { category: "screening", label, raw: raw0.trim(), importedOnly };
}

/** Parse a single Good/Best Practice cell into structured tests. */
export function parseTestCell(cell: string | null | undefined): BreedTest[] {
  if (!cell) return [];
  const cleaned = cell.replace(/•/g, "•").trim();
  if (!cleaned || EMPTY_CELL.test(cleaned)) return [];
  return cleaned
    .split(/•|\n|\r/)
    .map((s) => s.trim())
    .filter((p) => p && !EMPTY_CELL.test(p))
    .map(classifyTest);
}

// ---- Row → breed mapping (shared by CSV + markdown sources) -------------

function isYes(v: string | undefined): boolean {
  return !!v && /yes/i.test(v.trim());
}

/** Given a header row + data rows, build ParsedBreed[]. */
export function rowsToBreeds(rows: string[][]): ParsedBreed[] {
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (sub: string) => header.findIndex((h) => h.includes(sub));

  const iName = idx("breed"); // first "breed" column
  const iTop10 = idx("top 10");
  const iGood = idx("good practice");
  const iBest = idx("best practice");
  const iDiversity = idx("genetic diversity");
  const iClub = idx("breed-club");
  const iWatch = idx("conformation");

  const out: ParsedBreed[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = (row[iName] ?? "").trim();
    if (!name) continue;
    out.push({
      name,
      top10: isYes(row[iTop10]),
      geneticDiversityPriority: isYes(row[iDiversity]),
      breedClubScheme: isYes(row[iClub]),
      breedWatch: isYes(row[iWatch]),
      goodPractice: parseTestCell(row[iGood]),
      bestPractice: parseTestCell(row[iBest]),
    });
  }
  return out;
}

/** Minimal but correct CSV parser (quotes, escaped quotes, embedded newlines). */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Parse a GitHub-flavoured markdown table into rows (skips the `:-:` line). */
export function parseMarkdownTable(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("|")) continue;
    const cells = t.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue; // separator row
    rows.push(cells);
  }
  return rows;
}

export function breedsFromCsv(text: string): ParsedBreed[] {
  return rowsToBreeds(parseCsv(text));
}

export function breedsFromMarkdown(text: string): ParsedBreed[] {
  // Markdown escapes punctuation with backslashes (e.g. "\[imported…\]",
  // "GR\_PRA2"). Strip them so classification + display are clean.
  const unescaped = text.replace(/\\(.)/g, "$1");
  return rowsToBreeds(parseMarkdownTable(unescaped));
}
