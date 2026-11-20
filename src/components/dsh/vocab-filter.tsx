"use client";

import { useState } from "react";

import type { DshCopy } from "@/lib/dsh/copy";
import { cn } from "@/lib/utils";

/**
 * Filtre la liste du vocabulaire, rendue côté serveur.
 *
 * La liste complète reste dans le HTML – utile pour l'impression et les
 * moteurs de recherche – et ce composant ne fait que masquer les entrées qui
 * ne correspondent pas à la recherche ou au domaine choisi.
 */
export function VocabFilter({
  domains,
  total,
  copy,
}: {
  domains: { key: string; title: string; count: number }[];
  total: number;
  copy: DshCopy;
}) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<string>("all");
  const [visible, setVisible] = useState(total);

  function apply(nextQuery: string, nextDomain: string) {
    const root = document.getElementById("wortschatz-liste");
    if (!root) return;

    const needle = nextQuery.trim().toLowerCase();
    let shown = 0;

    root.querySelectorAll<HTMLElement>("[data-vocab-entry]").forEach((entry) => {
      const matchesQuery = !needle || (entry.dataset.search ?? "").includes(needle);
      const matchesDomain = nextDomain === "all" || entry.dataset.domain === nextDomain;
      const show = matchesQuery && matchesDomain;
      entry.hidden = !show;
      if (show) shown += 1;
    });

    root.querySelectorAll<HTMLElement>("[data-vocab-domain]").forEach((section) => {
      const entries = section.querySelectorAll<HTMLElement>("[data-vocab-entry]");
      section.hidden = Array.from(entries).every((entry) => entry.hidden);
    });

    setVisible(shown);
  }

  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">{copy.vocab.search}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              apply(event.target.value, domain);
            }}
            placeholder={copy.vocab.search}
            className="w-full border border-line bg-ink px-3.5 py-2.5 text-[0.9rem] text-chalk placeholder:text-mute/80 focus:border-cyan focus:outline-none"
          />
        </label>
        <p
          aria-live="polite"
          className="shrink-0 font-mono text-[0.58rem] tracking-[0.12em] text-mute uppercase"
        >
          {visible} / {total} {copy.vocab.entries}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => {
            setDomain("all");
            apply(query, "all");
          }}
          aria-pressed={domain === "all"}
          className={cn(
            "border px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.1em] uppercase transition-colors",
            domain === "all"
              ? "border-violet bg-violet text-ink-card"
              : "border-line text-mute hover:border-mute/60 hover:text-chalk",
          )}
        >
          {copy.vocab.all}
        </button>
        {domains.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => {
              setDomain(entry.key);
              apply(query, entry.key);
            }}
            aria-pressed={domain === entry.key}
            className={cn(
              "border px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.1em] uppercase transition-colors",
              domain === entry.key
                ? "border-cyan/60 bg-cyan/15 text-cyan"
                : "border-line text-mute hover:border-mute/60 hover:text-chalk",
            )}
          >
            {entry.title} · {entry.count}
          </button>
        ))}
      </div>
    </div>
  );
}
