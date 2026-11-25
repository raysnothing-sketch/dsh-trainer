"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { DshCopy } from "@/lib/dsh/copy";
import { LESETEXT_POINTS, STRUKTUREN_POINTS, levelTone } from "@/lib/dsh";
import { listeningModule, speakingModule, writingModule } from "@/lib/dsh/modules";
import { levelFromPoints, scoreText } from "@/lib/dsh/module-scoring";
import { emptyAnswers, evaluateSimulation } from "@/lib/dsh/scoring";
import {
  clearExamDraft,
  loadExamDraft,
  loadSettings,
  recordExamAttempt,
  saveExamDraft,
  type ExamPartScores,
} from "@/lib/dsh/storage";
import type { DshLevelKey, DshSimulation } from "@/lib/dsh/types";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const EXAM_SECONDS = 180 * 60;
const RANK: Record<DshLevelKey, number> = { none: 0, dsh1: 1, dsh2: 2, dsh3: 3 };

type SectionId = "leseverstehen" | "strukturen" | "hoeren" | "sprechen" | "schreiben";

type Result = {
  parts: ExamPartScores;
  points: number;
  max: number;
  percent: number;
  level: DshLevelKey;
  targetReached: boolean;
};

function formatTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function scoreExam(simulation: DshSimulation, answers: Record<string, string>, target: DshLevelKey): Result {
  const sim = evaluateSimulation(simulation, answers);

  const listening = round(
    listeningModule.questions.reduce((sum, question) => {
      if (question.kind === "choice") {
        return sum + (answers[question.id] === question.correct ? question.points : 0);
      }
      return sum + scoreText(answers[question.id] ?? "", question.sampleAnswer ?? "", question.criteria ?? []).points;
    }, 0),
  );

  const speaking = round(
    speakingModule.tasks.reduce(
      (sum, task) => sum + scoreText(answers[task.id] ?? "", task.sampleAnswer, task.criteria).points,
      0,
    ),
  );

  const writing = round(
    writingModule.tasks.reduce(
      (sum, task) => sum + scoreText(answers[task.id] ?? "", task.sampleOutline, task.criteria).points,
      0,
    ),
  );

  const parts: ExamPartScores = {
    leseverstehen: sim.leseverstehen,
    strukturen: sim.strukturen,
    hoeren: { points: listening, max: listeningModule.maxPoints },
    sprechen: { points: speaking, max: speakingModule.maxPoints },
    schreiben: { points: writing, max: writingModule.maxPoints },
  };
  const points = round(Object.values(parts).reduce((sum, part) => sum + part.points, 0));
  const max = Object.values(parts).reduce((sum, part) => sum + part.max, 0);
  const level = levelFromPoints(points, max);

  return {
    parts,
    points,
    max,
    percent: level.percent,
    level: level.key,
    targetReached: RANK[level.key] >= RANK[target],
  };
}

export function FullExam({
  locale,
  copy,
  simulation,
  simulations,
  hrefHub,
}: {
  locale: Locale;
  copy: DshCopy;
  simulation: DshSimulation;
  simulations: { slug: string; title: string }[];
  hrefHub: string;
}) {
  const router = useRouter();
  const fieldIds = useMemo(() => {
    const base = Object.keys(emptyAnswers(simulation));
    return [
      ...base,
      ...listeningModule.questions.map((question) => question.id),
      ...speakingModule.tasks.map((task) => task.id),
      ...writingModule.tasks.map((task) => task.id),
    ];
  }, [simulation]);

  const [draft] = useState(() => loadExamDraft());
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = loadExamDraft();
    return saved?.simulationId === simulation.id ? { ...saved.answers } : {};
  });
  const [phase, setPhase] = useState<"intro" | "work" | "results">("intro");
  const [section, setSection] = useState<SectionId>("leseverstehen");
  const [remaining, setRemaining] = useState(EXAM_SECONDS);
  const [result, setResult] = useState<Result | null>(null);
  const [target] = useState<DshLevelKey>(() => loadSettings().targetLevel);

  const sectionIds: SectionId[] = ["leseverstehen", "strukturen", "hoeren", "sprechen", "schreiben"];
  const sectionLabel: Record<SectionId, string> = {
    leseverstehen: copy.exam.parts.reading,
    strukturen: copy.exam.parts.structures,
    hoeren: copy.exam.parts.listening,
    sprechen: copy.exam.parts.speaking,
    schreiben: copy.exam.parts.writing,
  };

  const answered = fieldIds.filter((id) => answers[id]?.trim()).length;
  const progress = fieldIds.length === 0 ? 0 : Math.round((answered / fieldIds.length) * 100);

  useEffect(() => {
    if (phase !== "work") return;
    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) return 0;
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "work") return;
    const handle = window.setTimeout(
      () => saveExamDraft({ simulationId: simulation.id, answers, savedAt: new Date().toISOString() }),
      500,
    );
    return () => window.clearTimeout(handle);
  }, [answers, phase, simulation.id]);

  function update(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function start() {
    setPhase("work");
    setRemaining(EXAM_SECONDS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (answered === 0) return;
    if (answered < fieldIds.length && !window.confirm(copy.exam.confirm)) return;
    const score = scoreExam(simulation, answers, target);
    setResult(score);
    setPhase("results");
    clearExamDraft();
    recordExamAttempt({
      at: new Date().toISOString(),
      simulationId: simulation.id,
      parts: score.parts,
      points: score.points,
      max: score.max,
      percent: score.percent,
      level: score.level,
      targetLevel: target,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setAnswers({});
    setResult(null);
    setSection("leseverstehen");
    setPhase("intro");
  }

  return (
    <div className="pb-20">
      <header className="shell border-b border-line pt-12 pb-10 sm:pt-16">
        <p className="dsh-margin-note">{copy.exam.kicker}</p>
        <h1 className="mt-4 max-w-4xl text-[clamp(2.2rem,5vw,3.7rem)] leading-[1.03]">
          {copy.exam.title}
        </h1>
        <p className="mt-5 max-w-2xl font-display text-[1.05rem] leading-relaxed text-mute">
          {copy.exam.lead}
        </p>
        <p className="mt-4 font-mono text-[0.58rem] tracking-[0.1em] text-mute uppercase">
          {copy.exam.scope} · {copy.levels[target].label}
        </p>
      </header>

      {phase === "intro" ? (
        <section className="shell mt-10 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="panel p-6 sm:p-8">
            <p className="dsh-margin-note">{copy.exam.select}</p>
            <label className="mt-4 block font-display text-[1.15rem] text-chalk" htmlFor="exam-simulation">
              {simulation.title}
            </label>
            <select
              id="exam-simulation"
              value={simulation.slug}
              onChange={(event) =>
                router.push(`/${locale}/pruefung?slug=${encodeURIComponent(event.target.value)}`)
              }
              className="mt-3 w-full border border-line bg-ink-soft px-3 py-2.5 font-display text-[0.92rem] text-chalk"
            >
              {simulations.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {entry.title}
                </option>
              ))}
            </select>
            <p className="mt-5 font-display text-[0.9rem] leading-relaxed text-mute">{simulation.subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={start}
                className="bg-violet px-5 py-3 text-sm font-medium text-ink-card transition-colors hover:bg-violet/90"
              >
                {draft?.simulationId === simulation.id ? copy.exam.resume : copy.exam.start}
              </button>
              <Link
                href={hrefHub}
                className="border border-line px-5 py-3 text-sm text-chalk transition-colors hover:border-violet hover:text-violet"
              >
                {copy.exam.back}
              </Link>
            </div>
          </div>
          <div className="panel p-6 sm:p-8">
            <p className="dsh-margin-note">{copy.exam.tableHead.part}</p>
            <ol className="mt-4 divide-y divide-line">
              {sectionIds.map((id, index) => (
                <li key={id} className="flex items-center justify-between gap-4 py-3 font-display text-[0.92rem]">
                  <span className="text-chalk">
                    <span className="mr-3 font-mono text-[0.65rem] text-mute">0{index + 1}</span>
                    {sectionLabel[id]}
                  </span>
                  <span className="shrink-0 font-mono text-[0.72rem] text-mute tabular-nums">
                    {{ leseverstehen: LESETEXT_POINTS, strukturen: STRUKTUREN_POINTS, hoeren: listeningModule.maxPoints, sprechen: speakingModule.maxPoints, schreiben: writingModule.maxPoints }[id]}{" "}
                    {copy.exam.points}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-line pt-4 font-mono text-[0.56rem] leading-relaxed text-mute">
              {copy.exam.note}
            </p>
          </div>
        </section>
      ) : null}

      {phase === "work" ? (
        <section className="shell mt-8">
          <div className="sticky top-16 z-30 -mx-3 border border-line bg-ink/95 px-3 py-3 backdrop-blur-sm sm:mx-0 sm:px-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {sectionIds.map((id, index) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSection(id)}
                    className={cn(
                      "border px-2.5 py-1.5 font-mono text-[0.58rem] tracking-[0.08em] uppercase transition-colors",
                      section === id
                        ? "border-violet bg-violet text-ink-card"
                        : "border-line text-mute hover:border-violet hover:text-violet",
                    )}
                  >
                    0{index + 1} · {sectionLabel[id]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[0.6rem] text-mute uppercase">{copy.exam.timeLeft}</span>
                <span
                  className={cn(
                    "font-mono text-[1.05rem] tabular-nums",
                    remaining < 300 ? "text-amber-300" : "text-chalk",
                  )}
                >
                  {formatTime(remaining)}
                </span>
              </div>
            </div>
            <div className="mt-3 h-1 bg-line">
              <div className="h-full bg-cyan transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="panel mt-5 p-5 sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
              <h2 className="text-[1.4rem]">{sectionLabel[section]}</h2>
              <span className="font-mono text-[0.6rem] text-mute uppercase tabular-nums">
                {answered} / {fieldIds.length}
              </span>
            </div>
            <div className="mt-5">
              {section === "leseverstehen" ? (
                <div className="space-y-7">
                  {simulation.leseverstehen.map((question) => {
                    if (question.kind === "open") {
                      return (
                        <ExamField
                          key={question.id}
                          id={question.id}
                          number={question.number}
                          label={question.prompt}
                          value={answers[question.id] ?? ""}
                          onChange={update}
                          multiline
                        />
                      );
                    }
                    if (question.kind === "vocab") {
                      return (
                        <fieldset key={question.id} className="space-y-3">
                          <legend className="dsh-stamp text-cyan">{question.number}</legend>
                          <p className="font-display text-[0.95rem] text-chalk">{question.prompt}</p>
                          {question.items.map((item) => (
                            <ExamField
                              key={item.id}
                              id={item.id}
                              label={item.prompt}
                              value={answers[item.id] ?? ""}
                              onChange={update}
                            />
                          ))}
                        </fieldset>
                      );
                    }
                    return (
                      <fieldset key={question.id} className="space-y-3">
                        <legend className="dsh-stamp text-cyan">{question.number}</legend>
                        {question.statements.map((statement) => (
                          <ExamField
                            key={statement.id}
                            id={statement.id}
                            label={statement.text}
                            value={answers[statement.id] ?? ""}
                            onChange={update}
                            options={[
                              { value: "true", label: copy.sim.correct },
                              { value: "false", label: copy.sim.incorrect },
                            ]}
                          />
                        ))}
                      </fieldset>
                    );
                  })}
                </div>
              ) : null}

              {section === "strukturen" ? (
                <div className="space-y-6">
                  {simulation.strukturen.map((task) => (
                    <ExamField
                      key={task.id}
                      id={task.id}
                      number={task.label}
                      label={task.instruction || task.prompt}
                      hint={task.prompt}
                      value={answers[task.id] ?? ""}
                      onChange={update}
                      multiline
                    />
                  ))}
                </div>
              ) : null}

              {section === "hoeren" ? (
                <div className="space-y-6">
                  {listeningModule.questions.map((question) =>
                    question.kind === "choice" ? (
                      <fieldset key={question.id} className="space-y-2">
                        <legend className="font-display text-[0.95rem] text-chalk">
                          <span className="mr-2 font-mono text-[0.65rem] text-mute">{question.number}</span>
                          {question.prompt}
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {(question.options ?? []).map((option) => (
                            <label
                              key={option.id}
                              className={cn(
                                "flex cursor-pointer items-center gap-2 border px-3 py-2 font-display text-[0.85rem] transition-colors",
                                answers[question.id] === option.id
                                  ? "border-violet bg-violet/10 text-chalk"
                                  : "border-line text-mute hover:border-violet",
                              )}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={option.id}
                                checked={answers[question.id] === option.id}
                                onChange={() => update(question.id, option.id)}
                                className="accent-violet"
                              />
                              {option.text}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ) : (
                      <ExamField
                        key={question.id}
                        id={question.id}
                        number={question.number}
                        label={question.prompt}
                        value={answers[question.id] ?? ""}
                        onChange={update}
                        multiline
                      />
                    ),
                  )}
                </div>
              ) : null}

              {section === "sprechen" ? (
                <div className="space-y-7">
                  {speakingModule.tasks.map((task) => (
                    <ExamField
                      key={task.id}
                      id={task.id}
                      number={task.number}
                      label={task.prompt}
                      hint={task.title}
                      value={answers[task.id] ?? ""}
                      onChange={update}
                      multiline
                    />
                  ))}
                </div>
              ) : null}

              {section === "schreiben" ? (
                <div className="space-y-7">
                  {writingModule.tasks.map((task) => (
                    <ExamField
                      key={task.id}
                      id={task.id}
                      number={task.number}
                      label={task.prompt}
                      hint={task.guide.join(" · ")}
                      value={answers[task.id] ?? ""}
                      onChange={update}
                      multiline
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <button
                type="button"
                onClick={() => {
                  const index = sectionIds.indexOf(section);
                  if (index > 0) setSection(sectionIds[index - 1]);
                }}
                disabled={section === sectionIds[0]}
                className="border border-line px-4 py-2.5 text-xs text-chalk transition-colors hover:border-violet hover:text-violet disabled:opacity-40"
              >
                ← {copy.exam.previous}
              </button>
              {section === sectionIds[sectionIds.length - 1] ? (
                <button
                  type="button"
                  onClick={submit}
                  className="bg-violet px-5 py-3 text-sm font-medium text-ink-card transition-colors hover:bg-violet/90"
                >
                  {copy.exam.submit}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const index = sectionIds.indexOf(section);
                    if (index < sectionIds.length - 1) setSection(sectionIds[index + 1]);
                  }}
                  className="bg-violet px-5 py-3 text-sm font-medium text-ink-card transition-colors hover:bg-violet/90"
                >
                  {copy.exam.next} →
                </button>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {phase === "results" && result ? (
        <section className="shell mt-10">
          <div className="panel relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-violet" />
            <p className="dsh-margin-note">{copy.exam.result}</p>
            <div className="mt-4 flex flex-wrap items-center gap-8">
              <p className="font-display text-[3rem] leading-none text-chalk tabular-nums">
                {result.points}
                <span className="text-base text-mute"> / {result.max}</span>
              </p>
              <div>
                <p className={cn("font-mono text-sm tracking-[0.14em] uppercase", levelTone(result.level).text)}>
                  {copy.levels[result.level].label}
                </p>
                <p className="mt-1 font-mono text-[0.65rem] text-mute">{result.percent} %</p>
              </div>
              <p
                className={cn(
                  "border px-3 py-2 font-mono text-[0.6rem] tracking-[0.1em] uppercase",
                  result.targetReached
                    ? "border-lime/40 bg-lime/10 text-lime"
                    : "border-amber-300/40 bg-amber-300/10 text-amber-300",
                )}
              >
                {result.targetReached ? copy.exam.targetReached : copy.exam.targetMissing} ·{" "}
                {copy.levels[target].label}
              </p>
            </div>
            <p className="mt-5 max-w-2xl font-display text-[0.92rem] leading-relaxed text-mute">
              {copy.exam.resultLead}
            </p>
          </div>

          <div className="panel mt-4 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[0.55rem] tracking-[0.14em] text-mute uppercase">
                  <th className="px-4 py-3">{copy.exam.tableHead.part}</th>
                  <th className="px-4 py-3 text-right">{copy.exam.tableHead.points}</th>
                  <th className="px-4 py-3 text-right">{copy.exam.tableHead.share}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sectionIds.map((id) => {
                  const part = result.parts[id];
                  const share = part.max === 0 ? 0 : Math.round((part.points / part.max) * 100);
                  return (
                    <tr key={id}>
                      <td className="px-4 py-3 font-display text-[0.92rem] text-chalk">{sectionLabel[id]}</td>
                      <td className="px-4 py-3 text-right font-mono text-[0.8rem] text-chalk tabular-nums">
                        {part.points} / {part.max}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[0.72rem] text-mute tabular-nums">
                        {share} %
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={restart}
              className="bg-violet px-5 py-3 text-sm font-medium text-ink-card transition-colors hover:bg-violet/90"
            >
              {copy.exam.restart}
            </button>
            <Link
              href={`/${locale}/fortschritt`}
              className="border border-line px-5 py-3 text-sm text-chalk transition-colors hover:border-violet hover:text-violet"
            >
              {copy.nav.dashboard}
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ExamField({
  id,
  number,
  label,
  hint,
  value,
  onChange,
  multiline,
  options,
}: {
  id: string;
  number?: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (id: string, value: string) => void;
  multiline?: boolean;
  options?: { value: string; label: string }[];
}) {
  const inputClass =
    "mt-2 w-full border border-line bg-ink-soft/60 px-3 py-2.5 font-display text-[0.9rem] leading-relaxed text-chalk outline-none transition-colors focus:border-violet";
  const heading = (
    <>
      {number ? <span className="mr-2 font-mono text-[0.65rem] text-mute">{number}</span> : null}
      {label}
    </>
  );

  if (options) {
    return (
      <div>
        <span id={`${id}-label`} className="block font-display text-[0.92rem] leading-relaxed text-chalk">
          {heading}
        </span>
        {hint ? <p className="mt-1 font-mono text-[0.62rem] leading-relaxed text-mute">{hint}</p> : null}
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-label`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={value === option.value}
              onClick={() => onChange(id, option.value)}
              className={cn(
                "border px-4 py-2 font-mono text-[0.65rem] tracking-[0.08em] uppercase transition-colors",
                value === option.value
                  ? "border-violet bg-violet text-ink-card"
                  : "border-line text-mute hover:border-violet hover:text-violet",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="font-display text-[0.92rem] leading-relaxed text-chalk">
        {heading}
      </label>
      {hint ? <p className="mt-1 font-mono text-[0.62rem] leading-relaxed text-mute">{hint}</p> : null}
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(id, event.target.value)}
          rows={4}
          className={cn(inputClass, "resize-y")}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(id, event.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}
