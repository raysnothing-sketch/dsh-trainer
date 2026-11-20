"use client";

import { useState } from "react";

import type { DshCopy } from "@/lib/dsh/copy";
import type { VocabEntry } from "@/lib/dsh/vocab";
import { vocabTypeKeys } from "@/lib/dsh/vocab-types";
import { cn } from "@/lib/utils";

type TrainerEntry = VocabEntry & { id: string; domain: string; domainTitle: string };

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function VocabTrainer({
  entries,
  domains,
  copy,
}: {
  entries: TrainerEntry[];
  domains: { key: string; title: string }[];
  copy: DshCopy;
}) {
  const [domain, setDomain] = useState("all");
  const [wordType, setWordType] = useState("all");
  const [deck, setDeck] = useState<TrainerEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const current = deck[0];
  const finished = total > 0 && deck.length === 0;
  const progress = total === 0 ? 0 : Math.round(reviewed / total * 100);

  function start(nextDomain = domain, nextType = wordType) {
    const pool = entries.filter(
      (entry) =>
        (nextDomain === "all" || entry.domain === nextDomain) &&
        (nextType === "all" || entry.type === nextType),
    );
    setDomain(nextDomain);
    setWordType(nextType);
    setDeck(shuffle(pool));
    setTotal(pool.length);
    setReviewed(0);
    setFlipped(false);
  }

  function known() {
    setDeck((previous) => previous.slice(1));
    setReviewed((value) => value + 1);
    setFlipped(false);
  }

  function again() {
    setDeck((previous) =>
      previous.length <= 1 ? previous : [...previous.slice(1), previous[0]],
    );
    setFlipped(false);
  }

  const typeCounts = Object.fromEntries(
    vocabTypeKeys.map((key) => [
      key,
      entries.filter((entry) =>
        (domain === "all" || entry.domain === domain) && entry.type === key,
      ).length,
    ]),
  ) as Record<string, number>;

  return (
    <section id="karten" className="shell mt-12 scroll-mt-28">
      <div className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="dsh-margin-note">{copy.vocab.trainerTitle}</p>
            <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)]">{copy.vocab.trainerTitle}</h2>
            <p className="mt-2 max-w-xl font-display text-[0.98rem] leading-relaxed text-mute">
              {copy.vocab.trainerLead}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[0.6rem] tracking-[0.12em] text-mute uppercase">
            {copy.vocab.progressLabel} {reviewed} / {total || entries.length}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => start("all", wordType)}
            aria-pressed={domain === "all"}
            className={cn(
              "border px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.1em] uppercase transition-colors",
              domain === "all"
                ? "border-violet bg-violet text-ink-card"
                : "border-line text-mute hover:border-mute/60 hover:text-chalk",
            )}
          >
            {copy.vocab.all} · {entries.length}
          </button>
          {domains.map((entry) => {
            const count = entries.filter((item) => item.domain === entry.key).length;
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => start(entry.key, wordType)}
                aria-pressed={domain === entry.key}
                className={cn(
                  "border px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.1em] uppercase transition-colors",
                  domain === entry.key
                    ? "border-cyan/60 bg-cyan/15 text-cyan"
                    : "border-line text-mute hover:border-mute/60 hover:text-chalk",
                )}
              >
                {entry.title} · {count}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-dashed border-line pt-3">
          <button
            type="button"
            onClick={() => start(domain, "all")}
            aria-pressed={wordType === "all"}
            className={cn(
              "border px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.1em] uppercase transition-colors",
              wordType === "all"
                ? "border-violet bg-violet text-ink-card"
                : "border-line text-mute hover:border-mute/60 hover:text-chalk",
            )}
          >
            {copy.vocab.allTypes}
          </button>
          {vocabTypeKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => start(domain, key)}
              aria-pressed={wordType === key}
              className={cn(
                "border px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.1em] uppercase transition-colors",
                wordType === key
                  ? "border-cyan/60 bg-cyan/15 text-cyan"
                  : "border-line text-mute hover:border-mute/60 hover:text-chalk",
              )}
            >
              {copy.vocab.types[key]} · {typeCounts[key]}
            </button>
          ))}
        </div>

        <div className="mt-3 h-1 w-full bg-line">
          <div className="h-full bg-violet transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>

        {total === 0 ? (
          <button
            type="button"
            onClick={() => start()}
            className="mt-6 bg-violet px-5 py-3 text-sm font-medium text-ink-card transition-colors hover:bg-violet/90"
          >
            {copy.vocab.trainerStart}
          </button>
        ) : finished ? (
          <div className="mt-6">
            <p className="font-mono text-[0.6rem] tracking-[0.16em] text-lime uppercase">
              {copy.vocab.trainerDone}
            </p>
            <p className="mt-3 font-display text-[2.2rem] leading-none text-chalk tabular-nums">
              {reviewed}
              <span className="text-[1rem] text-mute"> / {total}</span>
            </p>
            <button
              type="button"
              onClick={() => start()}
              className="mt-6 border border-line px-4 py-2 text-xs text-mute transition-colors hover:border-violet hover:text-violet"
            >
              {copy.vocab.trainerRestart}
            </button>
          </div>
        ) : current ? (
          <div className="mt-6">
            <article className="border border-line bg-ink px-5 py-6 sm:px-7 sm:py-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="dsh-margin-note">{current.domainTitle}</p>
                  <p className="mt-1 font-mono text-[0.55rem] tracking-[0.12em] text-cyan uppercase">
                    {copy.vocab.types[current.type]}
                  </p>
                </div>
                <span className="font-mono text-[0.55rem] text-mute tabular-nums">
                  {deck.length} ↺
                </span>
              </div>

              <p className="mt-5 font-display text-[clamp(1.5rem,3.4vw,2.1rem)] leading-tight text-chalk">
                {current.term}
              </p>
              {current.forms ? (
                <p className="mt-1 font-mono text-[0.68rem] text-cyan">{current.forms}</p>
              ) : null}

              {flipped ? (
                <div className="mt-5 space-y-4 border-t border-dashed border-line pt-5">
                  <div>
                    <p className="font-mono text-[0.52rem] tracking-[0.14em] text-violet uppercase">
                      {copy.vocab.definition}
                    </p>
                    <p className="mt-1 font-display text-[1rem] leading-relaxed text-chalk/90">
                      {current.definition}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[0.52rem] tracking-[0.14em] text-mute uppercase">
                      {copy.vocab.example}
                    </p>
                    <p className="mt-1 font-display text-[0.92rem] leading-relaxed text-chalk/80">
                      «{current.example}»
                    </p>
                  </div>
                  {current.collocation ? (
                    <p className="font-mono text-[0.6rem] tracking-[0.1em] text-cyan uppercase">
                      {copy.vocab.collocation}: {current.collocation}
                    </p>
                  ) : null}
                  <p className="font-mono text-[0.58rem] tracking-[0.08em] text-mute uppercase">
                    {copy.vocab.en}: {current.glossEn} · {copy.vocab.fr}: {current.glossFr}
                  </p>
                </div>
              ) : (
                <p className="mt-5 border-t border-dashed border-line pt-5 font-mono text-[0.58rem] tracking-[0.12em] text-mute uppercase">
                  {copy.vocab.trainerHint}
                </p>
              )}
            </article>

            <div className="mt-4 flex flex-wrap gap-2">
              {!flipped ? (
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  className="bg-violet px-5 py-2.5 text-sm font-medium text-ink-card transition-colors hover:bg-violet/90"
                >
                  {copy.vocab.flip}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={known}
                    className="bg-lime px-5 py-2.5 text-sm font-medium text-ink-card transition-colors hover:bg-lime/90"
                  >
                    {copy.vocab.known}
                  </button>
                  <button
                    type="button"
                    onClick={again}
                    className="border border-line px-5 py-2.5 text-sm text-mute transition-colors hover:border-violet hover:text-violet"
                  >
                    {copy.vocab.again}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
