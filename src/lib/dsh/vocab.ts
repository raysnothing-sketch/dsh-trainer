/**
 * Akademischer Wortschatz nach Fachbereich und Wortart.
 *
 * Die Daten liegen in thematischen Modulen; dieses Modul führt sie zusammen
 * und stellt die flache Liste für Suche, Filter und Karten-Trainer bereit.
 */

import { campusDomains } from "./vocab-campus";
import { digitalDomains } from "./vocab-digital";
import { gesellschaftDomains } from "./vocab-gesellschaft";
import { lebenDomains } from "./vocab-leben";
import { naturDomains } from "./vocab-natur";
import type { VocabDomain } from "./vocab-types";

export type { VocabDomain, VocabEntry, VocabType } from "./vocab-types";

export const vocabDomains: VocabDomain[] = [
  ...campusDomains,
  ...digitalDomains,
  ...naturDomains,
  ...lebenDomains,
  ...gesellschaftDomains,
];

export const vocabCount = vocabDomains.reduce(
  (total, domain) => total + domain.entries.length,
  0,
);

/** Alle Einträge flach – Grundlage für Suche, Filter und Trainer. */
export const vocabEntries = vocabDomains.flatMap((domain) =>
  domain.entries.map((entry, index) => ({
    ...entry,
    id: `${domain.key}-${index}`,
    domain: domain.key,
    domainTitle: domain.title,
  })),
);
