"use client";

import Link from "next/link";
import { useState } from "react";

import { levelTone } from "@/lib/dsh";
import type { DshCopy } from "@/lib/dsh/copy";
import {
  loadDrillStats,
  loadModuleAttempts,
  loadProgress,
  type DrillStats,
} from "@/lib/dsh/storage";
import type { DshLevelKey } from "@/lib/dsh/types";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Activity = {
  id: string;
  kind: "simulation" | "module";
  title: string;
  href: string;
  at: string;
  points: number;
  max: number;
  percent: number;
  level: DshLevelKey;
};

const LEVEL_ORDER: DshLevelKey[] = ["dsh3", "dsh2", "dsh1", "none"];
const LEVEL_BAR: Record<DshLevelKey, string> = {
  dsh3: "bg-lime",
  dsh2: "bg-cyan",
  dsh1: "bg-violet",
  none: "bg-mute",
};

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

function moduleHref(moduleId: string, locale: Locale): string {
  if (moduleId.startsWith("hoeren")) return `/${locale}/hoeren`;
  if (moduleId.startsWith("sprechen")) return `/${locale}/sprechen`;
  if (moduleId.startsWith("schreiben")) return `/${locale}/schreiben`;
  return `/${locale}`;
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

function buildActivities(
  locale: Locale,
  copy: DshCopy,
  simulations: { id: string; slug: string; title: string }[],
): Activity[] {
  const byId = new Map(simulations.map((simulation) => [simulation.id, simulation]));

  const simActivities: Activity[] = loadProgress().attempts.map((attempt) => {
    const simulation = byId.get(attempt.simulationId);
    return {
      id: attempt.simulationId,
      kind: "simulation",
      title: simulation?.title ?? attempt.simulationId,
      href: simulation ? `/${locale}/simulation/${simulation.slug}` : `/${locale}`,
      at: attempt.at,
      points: attempt.points,
      max: attempt.max,
      percent: safePercent(attempt.percent),
      level: attempt.level,
    };
  });

  const moduleActivities: Activity[] = loadModuleAttempts().map((attempt) => ({
    id: attempt.moduleId,
    kind: "module",
    title: moduleLabel(attempt.moduleId, copy),
    href: moduleHref(attempt.moduleId, locale),
    at: attempt.at,
    points: attempt.points,
    max: attempt.max,
    percent: safePercent(attempt.percent),
    level: attempt.level,
  }));

  return [...simActivities, ...moduleActivities].sort((a, b) => b.at.localeCompare(a.at));
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
  simulations,
}: {
  locale: Locale;
  copy: DshCopy;
  simulations: { id: string; slug: string; title: string }[];
}) {
  const [activities] = useState<Activity[]>(() => buildActivities(locale, copy, simulations));
  const [drills] = useState<DrillStats>(() => loadDrillStats());

  const latest = activities[0];
  const average = activities.length
    ? Math.round(activities.reduce((sum, item) => sum + item.percent, 0) / activities.length)
    : 0;
  const best = activities.length ? Math.max(...activities.map((item) => item.percent)) : 0;

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
        <p className="mt-4 font-mono text-[0.58rem] tracking-[0.1em] text-mute uppercase">
          {copy.dashboard.localNote}
        </p>
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
                    <p className="dsh-stamp text-cyan">
                      {item.kind === "simulation" ? copy.dashboard.simulation : moduleLabel(item.id, copy)}
                    </p>
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
