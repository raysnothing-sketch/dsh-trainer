/**
 * Gemeinsame Typen für den akademischen Wortschatz.
 *
 * `type` bestimmt die Wortart. Bei Substantiven enthält `term` Artikel und
 * Plural („die Hypothese, -n“), bei Verben den Infinitiv. `forms` ergänzt
 * bei Bedarf wichtige Flexionsformen („stellte, hat gestellt“) bzw.
 * Steigerungsformen („genauer, am genauesten“).
 */

export const vocabTypeKeys = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "other",
] as const;

export type VocabType = (typeof vocabTypeKeys)[number];

export type VocabEntry = {
  term: string;
  type: VocabType;
  forms?: string;
  glossEn: string;
  glossFr: string;
  definition: string;
  example: string;
  collocation?: string;
};

export type VocabDomain = {
  key: string;
  title: string;
  lead: string;
  entries: VocabEntry[];
};
