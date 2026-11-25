"use client";

import Link from "next/link";
import { useState } from "react";

import type { DshCopy } from "@/lib/dsh/copy";
import {
  buildSkillStats,
  collectReviewErrors,
  type ProgressIndex,
} from "@/lib/dsh/progress";
import {
  loadDrillStats,
  loadExamAttempts,
  loadModuleAttempts,
  loadProgress,
  loadSettings,
} from "@/lib/dsh/storage";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

function formatDate(value: string, locale: Locale): string {
  const tag = locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : "en-GB";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat(tag, { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function Report({ locale, copy, index }: { locale: Locale; copy: DshCopy; index: ProgressIndex }) {
  const [report] = useState(() => {
    const simulationAttempts = loadProgress().attempts;
    const moduleAttempts = loadModuleAttempts();
    const examAttempts = loadExamAttempts().map((attempt) => ({
      id: `exam-${attempt.at}`,
      kind: "exam" as const,
      title: copy.exam.nav,
      at: attempt.at,
      percent: attempt.percent,
      level: attempt.level,
    }));
    const activities = [
      ...simulationAttempts.map((attempt) => ({
        id: attempt.simulationId,
        kind: "simulation" as const,
        title: index.simulations.find((source) => source.id === attempt.simulationId)?.title ?? attempt.simulationId,
        at: attempt.at,
        percent: attempt.percent,
        level: attempt.level,
      })),
      ...moduleAttempts.map((attempt) => ({
        id: attempt.moduleId,
        kind: "module" as const,
        title: attempt.moduleId,
        at: attempt.at,
        percent: attempt.percent,
        level: attempt.level,
      })),
      ...examAttempts,
    ].sort((a, b) => b.at.localeCompare(a.at));

    return {
      activities,
      skills: buildSkillStats(index, simulationAttempts, moduleAttempts),
      errors: collectReviewErrors(index, simulationAttempts, moduleAttempts),
      drills: loadDrillStats(),
      target: loadSettings().targetLevel,
      generated: new Date().toISOString(),
    };
  });

  const { activities, skills, errors, drills, target } = report;
  const average = activities.length
    ? Math.round(activities.reduce((sum, item) => sum + item.percent, 0) / activities.length)
    : 0;
  const best = activities.length ? Math.max(...activities.map((item) => item.percent)) : 0;
  const gradedSkills = skills.filter((skill) => skill.count > 0);

  return (
    <div className="dsh-report pb-20">
      <header className="shell border-b border-line pt-12 pb-8 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="dsh-margin-note">{copy.report.kicker}</p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-none">{copy.report.title}</h1>
            <p className="mt-3 font-display text-[0.95rem] text-mute">{copy.report.lead}</p>
          </div>
          <div className="dsh-report-actions flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-violet px-4 py-2.5 text-xs font-medium text-ink-card transition-colors hover:bg-violet/90"
            >
              {copy.report.print}
            </button>
            <Link
              href={`/${locale}/fortschritt`}
              className="border border-line px-4 py-2.5 text-xs text-chalk transition-colors hover:border-violet hover:text-violet"
            >
              {copy.report.back}
            </Link>
          </div>
        </div>
        <p className="mt-5 font-mono text-[0.58rem] tracking-[0.1em] text-mute uppercase">
          {copy.report.generated}: {formatDate(report.generated, locale)} · {copy.report.target}:{" "}
          {copy.levels[target].label}
        </p>
      </header>

      {activities.length === 0 ? (
        <section className="shell mt-10">
          <div className="panel p-8">
            <p className="font-display text-[1.05rem] text-chalk">{copy.report.empty}</p>
          </div>
        </section>
      ) : (
        <section className="shell mt-8 space-y-4">
          <div className="panel p-5 sm:p-7">
            <p className="dsh-margin-note">{copy.report.summary}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-4">
              <ReportStat label={copy.dashboard.attempts} value={String(activities.length)} />
              <ReportStat label={copy.dashboard.average} value={`${average} %`} />
              <ReportStat label={copy.dashboard.best} value={`${best} %`} />
              <ReportStat label={copy.dashboard.drills} value={`${drills.correct} / ${drills.answered}`} />
            </dl>
          </div>

          <div className="panel p-5 sm:p-7">
            <p className="dsh-margin-note">{copy.report.skills}</p>
            <table className="mt-4 w-full text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[0.55rem] tracking-[0.12em] text-mute uppercase">
                  <th className="py-2">{copy.report.skills}</th>
                  <th className="py-2 text-right">{copy.exam.tableHead.share}</th>
                  <th className="py-2 text-right">{copy.dashboard.count}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {gradedSkills.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 font-display text-[0.85rem] text-mute">
                      {copy.report.empty}
                    </td>
                  </tr>
                ) : (
                  gradedSkills.map((skill) => (
                    <tr key={skill.skill}>
                      <td className="py-2 font-display text-[0.9rem] text-chalk">
                        {copy.skills[skill.skill] ?? skill.skill}
                      </td>
                      <td className="py-2 text-right font-mono text-[0.8rem] text-chalk tabular-nums">
                        {skill.percent} %
                      </td>
                      <td className="py-2 text-right font-mono text-[0.75rem] text-mute tabular-nums">
                        {skill.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="panel p-5 sm:p-7">
            <p className="dsh-margin-note">{copy.report.history}</p>
            <table className="mt-4 w-full text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[0.55rem] tracking-[0.12em] text-mute uppercase">
                  <th className="py-2">{copy.exam.tableHead.part}</th>
                  <th className="py-2">{copy.report.generated}</th>
                  <th className="py-2 text-right">{copy.dashboard.score}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {activities.slice(0, 20).map((activity, index) => (
                  <tr key={`${activity.kind}-${activity.id}-${activity.at}-${index}`}>
                    <td className="py-2 font-display text-[0.88rem] text-chalk">{activity.title}</td>
                    <td className="py-2 font-mono text-[0.7rem] text-mute">{formatDate(activity.at, locale)}</td>
                    <td className="py-2 text-right font-mono text-[0.78rem] tabular-nums">
                      <span className="text-chalk">{activity.percent} %</span>
                      <span className={cn("ml-2 text-[0.6rem] uppercase", activity.level === "none" ? "text-mute" : "text-violet")}>
                        {copy.levels[activity.level].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel p-5 sm:p-7">
            <p className="dsh-margin-note">{copy.report.mistakes}</p>
            {errors.length === 0 ? (
              <p className="mt-4 font-display text-[0.9rem] text-mute">{copy.dashboard.errorsEmpty}</p>
            ) : (
              <ol className="mt-4 divide-y divide-line">
                {errors.slice(0, 12).map((error) => (
                  <li key={error.key} className="grid gap-1 py-2.5 sm:grid-cols-[2fr_1fr_1fr] sm:gap-4">
                    <p className="font-display text-[0.85rem] text-chalk">{error.prompt}</p>
                    <p className="font-mono text-[0.68rem] text-amber-300">{error.given}</p>
                    <p className="font-mono text-[0.68rem] text-lime">{error.expected}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <p className="font-mono text-[0.56rem] leading-relaxed text-mute">
            {copy.report.storage} · {copy.report.note}
          </p>
        </section>
      )}
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line px-3 py-3">
      <dt className="font-mono text-[0.55rem] tracking-[0.12em] text-mute uppercase">{label}</dt>
      <dd className="mt-2 font-mono text-[1.25rem] leading-none text-chalk tabular-nums">{value}</dd>
    </div>
  );
}
