"use client";

import { useState } from "react";

import type { DshCopy } from "@/lib/dsh/copy";
import type { MathTerm } from "@/lib/dsh/math";
import { cn } from "@/lib/utils";

type TrainerTerm = MathTerm & { id: string; chapter: string };

type Question = {
  term: TrainerTerm;
  options: string[];
  answer: string;
};

const ROUND_SIZE = 10;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function buildRound(terms: TrainerTerm[]): Question[] {
  const picked = shuffle(terms).slice(0, Math.min(ROUND_SIZE, terms.length));
  return picked.map((term) => {
    const distractors = shuffle(terms.filter((entry) => entry.meaning !== term.meaning))
      .slice(0, 3)
      .map((entry) => entry.meaning);
    return {
      term,
      answer: term.meaning,
      options: shuffle([term.meaning, ...distractors]),
    };
  });
}

export function MathTrainer({ terms, copy }: { terms: TrainerTerm[]; copy: DshCopy }) {
  const [round, setRound] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const current = round[index];
  const finished = round.length > 0 && index >= round.length;

  function start() {
    setRound(buildRound(terms));
    setIndex(0);
    setChoice(null);
    setScore(0);
  }

  function pick(option: string) {
    if (choice) return;
    setChoice(option);
    if (option === current.answer) setScore((value) => value + 1);
  }

  function next() {
    setChoice(null);
    setIndex((value) => value + 1);
  }

  return (
    <section id="trainer" className="shell mt-16 scroll-mt-28">
      <div className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="dsh-margin-note">{copy.math.terms}</p>
            <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)]">{copy.math.trainerTitle}</h2>
            <p className="mt-2 max-w-xl font-display text-[0.98rem] leading-relaxed text-mute">
              {copy.math.trainerLead}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[0.6rem] tracking-[0.12em] text-mute uppercase">
            {round.length > 0 ? `${Math.min(index + 1, round.length)} / ${round.length}` : `${ROUND_SIZE} ×`}
          </span>
        </div>

        {round.length === 0 ? (
          <button
            type="button"
            onClick={start}
            className="mt-6 bg-violet px-5 py-3 text-sm font-medium text-ink-card transition-colors hover:bg-violet/90"
          >
            {copy.math.trainerStart}
          </button>
        ) : finished ? (
          <div className="mt-6">
            <p className="font-mono text-[0.6rem] tracking-[0.16em] text-lime uppercase">
              {copy.math.trainerDone}
            </p>
            <p className="mt-3 font-display text-[2.4rem] leading-none text-chalk tabular-nums">
              {score}
              <span className="text-[1rem] text-mute"> / {round.length}</span>
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-6 border border-line px-4 py-2 text-xs text-mute transition-colors hover:border-violet hover:text-violet"
            >
              {copy.math.trainerRestart}
            </button>
          </div>
        ) : current ? (
          <div className="mt-6">
            <p className="font-mono text-[0.58rem] tracking-[0.14em] text-mute uppercase">
              {copy.math.trainerQuestion} «{current.term.term}»?
            </p>
            {current.term.symbol ? (
              <p className="mt-2 font-display text-[1.6rem] text-cyan">{current.term.symbol}</p>
            ) : null}

            <div className="mt-5 grid gap-2">
              {current.options.map((option) => {
                const isAnswer = option === current.answer;
                const selected = choice === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => pick(option)}
                    disabled={Boolean(choice)}
                    className={cn(
                      "border px-4 py-3 text-left font-display text-[0.95rem] leading-relaxed transition-colors",
                      !choice && "border-line bg-ink hover:border-violet hover:bg-ink-soft/60",
                      choice && isAnswer && "border-lime/60 bg-lime/[0.06] text-chalk",
                      choice && selected && !isAnswer && "border-violet/60 bg-violet/[0.06] text-chalk",
                      choice && !selected && !isAnswer && "border-line-soft text-mute/80",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {choice ? (
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-dashed border-line pt-4">
                <p
                  className={cn(
                    "font-mono text-[0.6rem] tracking-[0.14em] uppercase",
                    choice === current.answer ? "text-lime" : "text-violet",
                  )}
                >
                  {choice === current.answer ? copy.math.trainerCorrect : copy.math.trainerWrong}
                </p>
                <p className="font-mono text-[0.6rem] tracking-[0.14em] text-mute uppercase">
                  {copy.math.trainerScore}: {score}
                </p>
                <button
                  type="button"
                  onClick={next}
                  className="ml-auto bg-violet px-4 py-2 text-xs font-medium text-ink-card transition-colors hover:bg-violet/90"
                >
                  {copy.math.trainerNext}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
