"use client";

import Link from "next/link";
import { useState } from "react";

import { levelTone } from "@/lib/dsh";
import type { DshCopy } from "@/lib/dsh/copy";
import {
  buildSkillStats,
  collectReviewErrors,
  type ProgressIndex,
  type ReviewError,
  type SkillStat,
} from "@/lib/dsh/progress";
import { levelFromPoints } from "@/lib/dsh/module-scoring";
import {
  loadDrillStats,
  loadExamAttempts,
  loadModuleAttempts,
  loadProgress,
  loadSettings,
  saveTargetLevel,
  type DrillStats,
} from "@/lib/dsh/storage";
import type { DshLevelKey } from "@/lib/dsh/types";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Activity = {
  id: string;
  kind: "simulation" | "module" | "exam";
  title: string;
  href: string;
  at: string;
  points: number;
  max: number;
  percent: number;
  level: DshLevelKey;
  hasDetail: boolean;
};

type Snapshot = {
  activities: Activity[];
  skills: SkillStat[];
  errors: ReviewError[];
  drills: DrillStats;
  target: DshLevelKey;
};

const LEVEL_RANK: Record<DshLevelKey, number> = { none: 0, dsh1: 1, dsh2: 2, dsh3: 3 };
const TARGET_LEVELS: DshLevelKey[] = ["dsh1", "dsh2", "dsh3"];

const LEVEL_ORDER: DshLevelKey[] = ["dsh3", "dsh2", "dsh1", "none"];
const LEVEL_BAR: Record<DshLevelKey, string> = {
  dsh3: "bg-lime",
  dsh2: "bg-cyan",
  dsh1: "bg-violet",
  none: "bg-mute",
};
const SKILL_BAR = [
  "bg-violet",
  "bg-cyan",
  "bg-lime",
  "bg-amber-300",
  "bg-violet/70",
  "bg-cyan/70",
  "bg-lime/70",
  "bg-amber-300/70",
  "bg-mute",
];

function safePercent(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

function levelLabel(level: DshLevelKey, copy: DshCopy): string {
  return copy.levels[level]?.label ?? copy.levels.none.label;
}

function moduleLabel(moduleId: string, copy: DshCopy): string {
  if (moduleId.startsWith("hoeren")) return copy.modules.nav.listening;
  if (moduleId.startsWith("sprechen")) return copy.modules.nav.speaking;
  if (moduleId.startsWith("schreiben")) return copy.modules.nav.writing;
  return moduleId;
}

function formatDate(value: string, locale: Locale): string {
  const tag = locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : "en-GB";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat(tag, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildSnapshot(index: ProgressIndex, locale: Locale, copy: DshCopy): Snapshot {
  const simulationAttempts = loadProgress().attempts;
  const moduleAttempts = loadModuleAttempts();
  const byId = new Map(index.simulations.map((source) => [source.id, source]));

  const simActivities: Activity[] = simulationAttempts.map((attempt) => {
    const source = byId.get(attempt.simulationId);
    return {
      id: attempt.simulationId,
      kind: "simulation",
      title: source?.title ?? attempt.simulationId,
      href: source ? `/${locale}${source.path}` : `/${locale}`,
      at: attempt.at,
      points: attempt.points,
      max: attempt.max,
      percent: safePercent(attempt.percent),
      level: attempt.level,
      hasDetail: Boolean(attempt.detail),
    };
  });

  const moduleActivities: Activity[] = moduleAttempts.map((attempt) => ({
    id: attempt.moduleId,
    kind: "module",
    title: moduleLabel(attempt.moduleId, copy),
    href: `/${locale}/${attempt.moduleId.split("-")[0]}`,
    at: attempt.at,
    points: attempt.points,
    max: attempt.max,
    percent: safePercent(attempt.percent),
    level: attempt.level,
    hasDetail: Boolean(attempt.detail),
  }));

  const examActivities: Activity[] = loadExamAttempts().map((attempt) => ({
    id: `exam-${attempt.at}`,
    kind: "exam",
    title: copy.exam.nav,
    href: `/${locale}/pruefung`,
    at: attempt.at,
    points: attempt.points,
    max: attempt.max,
    percent: safePercent(attempt.percent),
    level: attempt.level,
    hasDetail: true,
  }));

  return {
    activities: [...simActivities, ...moduleActivities, ...examActivities].sort((a, b) =>
      b.at.localeCompare(a.at),
    ),
    skills: buildSkillStats(index, simulationAttempts, moduleAttempts),
    errors: collectReviewErrors(index, simulationAttempts, moduleAttempts),
    drills: loadDrillStats(),
    target: loadSettings().targetLevel,
  };
}

/**
 * Tableau de bord personnel : lit uniquement les données déjà enregistrées
 * par les entraîneurs dans le navigateur. Aucun compte, aucun appel réseau.
 * Chargé sans SSR par `DashboardClient` pour éviter toute divergence
 * d'hydratation avec le `localStorage`.
 */
export function Dashboard({
  locale,
  copy,
  index,
}: {
  locale: Locale;
  copy: DshCopy;
  index: ProgressIndex;
}) {
  const [snapshot] = useState<Snapshot>(() => buildSnapshot(index, locale, copy));
  const { activities, skills, errors, drills } = snapshot;
  const [target, setTarget] = useState<DshLevelKey>(snapshot.target);

  const latest = activities[0];
  const average = activities.length
    ? Math.round(activities.reduce((sum, item) => sum + item.percent, 0) / activities.length)
    : 0;
  const best = activities.length ? Math.max(...activities.map((item) => item.percent)) : 0;
  const gradedSkills = skills.filter((skill) => skill.count > 0);
  const currentLevel = levelFromPoints(average, 100).key;
  const targetReached = LEVEL_RANK[currentLevel] >= LEVEL_RANK[target];

  return (
    <div className="pb-20">
      <header className="shell border-b border-line pt-12 pb-10 sm:pt-16">
        <p className="dsh-margin-note">{copy.dashboard.kicker}</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.2rem,5vw,3.7rem)] leading-[1.03]">
          {copy.dashboard.title}
        </h1>
        <p className="mt-5 max-w-2xl font-display text-[1.05rem] leading-relaxed text-mute">
          {copy.dashboard.lead}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="font-mono text-[0.58rem] tracking-[0.1em] text-mute uppercase">
            {copy.dashboard.localNote}
          </p>
          <Link
            href={`/${locale}/fortschritt/bericht`}
            className="border-b border-line pb-0.5 font-mono text-[0.58rem] tracking-[0.1em] text-mute uppercase transition-colors hover:border-violet hover:text-violet"
          >
            {copy.dashboard.report} →
          </Link>
        </div>
      </header>

      {activities.length === 0 ? (
        <section className="shell mt-10">
          <div className="panel p-8 sm:p-12">
            <p className="dsh-margin-note">{copy.dashboard.kicker}</p>
            <h2 className="mt-3 text-[clamp(1.6rem,3vw,2.2rem)]">{copy.dashboard.empty}</h2>
            <p className="mt-3 max-w-xl font-display text-[0.98rem] leading-relaxed text-mute">
              {copy.dashboard.emptyLead}
            </p>
            <Link
              href={`/${locale}`}
              className="mt-6 inline-block bg-violet px-5 py-3 text-sm font-medium text-ink-card transition-colors hover:bg-violet/90"
            >
              {copy.dashboard.emptyCta}
            </Link>
          </div>
        </section>
      ) : (
        <section className="shell mt-10">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatTile label={copy.dashboard.attempts} value={String(activities.length)} />
            <StatTile label={copy.dashboard.average} value={`${average} %`} accent="text-cyan" />
            <StatTile label={copy.dashboard.best} value={`${best} %`} accent="text-lime" />
            <StatTile
              label={copy.dashboard.currentLevel}
              value={latest ? levelLabel(latest.level, copy) : copy.dashboard.noLevel}
              small
            />
            <StatTile
              label={copy.dashboard.drills}
              value={`${drills.correct} / ${drills.answered}`}
              accent="text-violet"
              small
            />
          </dl>

          <div className="panel mt-4 flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="dsh-margin-note">{copy.dashboard.target}</p>
              <p className="mt-2 font-display text-[0.95rem] leading-relaxed text-chalk">
                {copy.dashboard.targetLead}
              </p>
              {activities.length > 0 ? (
                <p
                  className={cn(
                    "mt-2 font-mono text-[0.6rem] tracking-[0.1em] uppercase",
                    targetReached ? "text-lime" : "text-amber-300",
                  )}
                >
                  {targetReached ? copy.dashboard.targetReached : copy.dashboard.targetMissing}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label={copy.dashboard.target}>
              {TARGET_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={target === level}
                  onClick={() => {
                    saveTargetLevel(level);
                    setTarget(level);
                  }}
                  className={cn(
                    "border px-4 py-2.5 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-colors",
                    target === level
                      ? "border-violet bg-violet text-ink-card"
                      : "border-line text-mute hover:border-violet hover:text-violet",
                  )}
                >
                  {copy.levels[level].label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="panel p-5 sm:p-7">
              <p className="dsh-margin-note">{copy.dashboard.trend}</p>
              <h2 className="mt-2 text-[1.35rem]">{copy.dashboard.trend}</h2>
              <p className="mt-1 font-display text-[0.88rem] text-mute">{copy.dashboard.trendLead}</p>
              <TrendChart values={activities.slice(0, 12).reverse().map((item) => item.percent)} copy={copy} />
            </div>

            <div className="panel p-5 sm:p-7">
              <p className="dsh-margin-note">{copy.dashboard.levels}</p>
              <h2 className="mt-2 text-[1.35rem]">{copy.dashboard.levels}</h2>
              <p className="mt-1 font-display text-[0.88rem] text-mute">{copy.dashboard.levelsLead}</p>
              <div className="mt-6 space-y-4">
                {LEVEL_ORDER.map((level) => {
                  const count = activities.filter((item) => item.level === level).length;
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between font-mono text-[0.6rem] tracking-[0.1em] uppercase">
                        <span className={levelTone(level).text}>{copy.levels[level].label}</span>
                        <span className="text-mute tabular-nums">{count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-line">
                        <div
                          className={cn("h-full", LEVEL_BAR[level])}
                          style={{ width: `${(count / Math.max(1, activities.length)) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {gradedSkills.length > 0 ? (
            <div className="panel mt-4 p-5 sm:p-7">
              <p className="dsh-margin-note">{copy.dashboard.skills}</p>
              <h2 className="mt-2 text-[1.35rem]">{copy.dashboard.skills}</h2>
              <p className="mt-1 font-display text-[0.88rem] text-mute">{copy.dashboard.skillsLead}</p>
              <div className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-2">
                {gradedSkills.map((skill, index) => (
                  <div key={skill.skill}>
                    <div className="flex items-baseline justify-between gap-3 font-mono text-[0.6rem] tracking-[0.08em] uppercase">
                      <span className="min-w-0 truncate text-chalk">
                        {copy.skills[skill.skill] ?? skill.skill}
                      </span>
                      <span className="shrink-0 tabular-nums text-mute">
                        {skill.percent} % · {skill.count}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-line">
                      <div
                        className={cn("h-full", SKILL_BAR[index % SKILL_BAR.length])}
                        style={{ width: `${skill.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="panel mt-4 p-5 sm:p-7">
            <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="dsh-margin-note">{copy.dashboard.errors}</p>
                <h2 className="mt-2 text-[1.35rem]">{copy.dashboard.errors}</h2>
                <p className="mt-1 font-display text-[0.88rem] text-mute">{copy.dashboard.errorsLead}</p>
              </div>
              <span className="font-mono text-[0.58rem] tracking-[0.12em] text-mute uppercase">
                {errors.length}
              </span>
            </div>

            {errors.length === 0 ? (
              <p className="mt-5 font-display text-[0.92rem] leading-relaxed text-mute">
                {copy.dashboard.errorsEmpty}
              </p>
            ) : (
              <div className="mt-2 max-h-[34rem] divide-y divide-line overflow-y-auto pr-1">
                {errors.map((error) => (
                  <details key={error.key} className="group py-3.5">
                    <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center border border-violet/50 bg-violet/10 font-mono text-[0.6rem] text-violet">
                        {error.number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[0.92rem] leading-relaxed text-chalk">
                          {error.prompt}
                        </span>
                        <span className="mt-1 block font-mono text-[0.58rem] tracking-[0.08em] text-mute uppercase">
                          {error.sourceTitle} · {copy.skills[error.skill] ?? error.skill}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[0.95rem] text-mute transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="mt-3 grid gap-3 pl-10 sm:grid-cols-2">
                      <AnswerBox label={copy.dashboard.yourAnswer} value={error.given} tone="text-amber-300" />
                      <AnswerBox label={copy.dashboard.solution} value={error.expected} tone="text-lime" />
                      {error.explanation ? (
                        <div className="sm:col-span-2">
                          <p className="font-mono text-[0.55rem] tracking-[0.14em] text-mute uppercase">
                            {copy.dashboard.hint}
                          </p>
                          <p className="mt-1 font-display text-[0.82rem] leading-relaxed text-chalk/80">
                            {error.explanation}
                          </p>
                        </div>
                      ) : null}
                      <Link
                        href={`/${locale}${error.path}`}
                        className="inline-flex w-fit items-center border-b border-line pb-0.5 font-mono text-[0.6rem] tracking-[0.1em] text-mute uppercase transition-colors hover:border-violet hover:text-violet sm:col-span-2"
                      >
                        {copy.dashboard.openExercise} →
                      </Link>
                    </div>
                  </details>
                ))}
              </div>
            )}
            <p className="mt-4 border-t border-line pt-3 font-mono text-[0.56rem] leading-relaxed text-mute">
              {copy.dashboard.errorsNote}
            </p>
          </div>

          <div className="panel mt-4 p-5 sm:p-7">
            <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="dsh-margin-note">{copy.dashboard.latest}</p>
                <h2 className="mt-2 text-[1.35rem]">{copy.dashboard.recent}</h2>
                <p className="mt-1 font-display text-[0.88rem] text-mute">{copy.dashboard.recentLead}</p>
              </div>
              <span className="font-mono text-[0.58rem] tracking-[0.12em] text-mute uppercase">
                {Math.min(8, activities.length)} / {activities.length}
              </span>
            </div>

            <ol className="mt-2 divide-y divide-line">
              {activities.slice(0, 8).map((item, index) => (
                <li key={`${item.kind}-${item.id}-${item.at}-${index}`} className="flex items-center gap-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="dsh-stamp text-cyan">
                        {item.kind === "simulation"
                          ? copy.dashboard.simulation
                          : item.kind === "exam"
                            ? copy.exam.nav
                            : moduleLabel(item.id, copy)}
                      </p>
                      {item.hasDetail ? (
                        <span className="border border-line px-1.5 py-0.5 font-mono text-[0.5rem] tracking-[0.1em] text-mute uppercase">
                          {copy.dashboard.detailBadge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate font-display text-[1rem] text-chalk">{item.title}</p>
                    <p className="mt-0.5 font-mono text-[0.56rem] tracking-[0.08em] text-mute uppercase">
                      {formatDate(item.at, locale)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[1.15rem] leading-none text-chalk tabular-nums">
                      {item.percent} %
                    </p>
                    <p className={cn("mt-1 font-mono text-[0.56rem] tracking-[0.1em] uppercase", levelTone(item.level).text)}>
                      {levelLabel(item.level, copy)}
                    </p>
                  </div>
                  <Link
                    href={item.href}
                    aria-label={`${item.title} · ${formatDate(item.at, locale)}`}
                    className="grid size-9 shrink-0 place-items-center border border-line font-mono text-sm text-mute transition-colors hover:border-violet hover:text-violet"
                  >
                    →
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}

function AnswerBox({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-line/60 bg-ink-soft/50 px-3 py-2">
      <p className="font-mono text-[0.55rem] tracking-[0.14em] text-mute uppercase">{label}</p>
      <p className={cn("mt-1 font-display text-[0.85rem] leading-relaxed whitespace-pre-wrap", tone)}>
        {value}
      </p>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string;
  accent?: string;
  small?: boolean;
}) {
  return (
    <div className="panel p-4 sm:p-5">
      <dt className="font-mono text-[0.55rem] tracking-[0.14em] text-mute uppercase">{label}</dt>
      <dd className={cn("mt-3 font-mono leading-none tabular-nums", accent ?? "text-chalk", small ? "text-[1.2rem]" : "text-[1.8rem]")}>
        {value}
      </dd>
    </div>
  );
}

function TrendChart({ values, copy }: { values: number[]; copy: DshCopy }) {
  const width = 640;
  const height = 190;
  const left = 36;
  const right = 12;
  const top = 14;
  const bottom = 26;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const x = (index: number) =>
    values.length === 1 ? left + plotWidth / 2 : left + (index / (values.length - 1)) * plotWidth;
  const y = (value: number) => top + plotHeight - (safePercent(value) / 100) * plotHeight;
  const points = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const area = values.length
    ? `M ${x(0)} ${top + plotHeight} L ${points.replaceAll(" ", " L ")} L ${x(values.length - 1)} ${top + plotHeight} Z`
    : "";

  return (
    <svg
      role="img"
      aria-label={`${copy.dashboard.trend}: ${values.join(", ")}`}
      viewBox={`0 0 ${width} ${height}`}
      className="mt-5 h-auto w-full"
    >
      {[0, 50, 100].map((tick) => (
        <g key={tick}>
          <line
            x1={left}
            x2={width - right}
            y1={y(tick)}
            y2={y(tick)}
            stroke="currentColor"
            className="text-line"
            strokeWidth="1"
          />
          <text x={left - 8} y={y(tick) + 3} textAnchor="end" className="fill-current font-mono text-[9px] text-mute">
            {tick}
          </text>
        </g>
      ))}
      {values.length > 1 ? (
        <>
          <path d={area} className="fill-current text-violet/10" />
          <polyline points={points} fill="none" stroke="currentColor" className="text-violet" strokeWidth="2" />
        </>
      ) : null}
      {values.map((value, index) => (
        <circle
          key={`${index}-${value}`}
          cx={x(index)}
          cy={y(value)}
          r={index === values.length - 1 ? 5 : 3}
          className={index === values.length - 1 ? "fill-current text-violet" : "fill-current text-cyan"}
        />
      ))}
    </svg>
  );
}
