/**
 * Auswertung der lokal gespeicherten Versuche.
 *
 * Dieses Modul ist rein und datenfrei: es kennt keine Simulationen, sondern
 * arbeitet nur mit einem Index, den die Server-Seite vorbereitet. Dadurch
 * bleibt der Client-Bundle klein und die Aggregation ist direkt testbar.
 */

import type { ModuleAttempt, StoredAttempt } from "@/lib/dsh/storage";
import type { DshSkill } from "@/lib/dsh/types";

export type ProgressSkill =
  | DshSkill
  | "strukturen"
  | "hoeren"
  | "sprechen"
  | "schreiben";

export const PROGRESS_SKILLS: ProgressSkill[] = [
  "verstehen",
  "wortschatz",
  "grafik",
  "transfer",
  "korrekt",
  "strukturen",
  "hoeren",
  "sprechen",
  "schreiben",
];

export type QuestionMeta = {
  id: string;
  number: string;
  prompt: string;
  skill: ProgressSkill;
  expected: string;
  explanation?: string;
};

export type ProgressSource = {
  id: string;
  title: string;
  /** Pfad ohne Locale-Präfix, z. B. `/simulation/wasserstoff-aus-wind-und-sonne`. */
  path: string;
  questions: QuestionMeta[];
};

export type ProgressIndex = {
  simulations: ProgressSource[];
  modules: ProgressSource[];
};

export type SkillStat = {
  skill: ProgressSkill;
  points: number;
  max: number;
  count: number;
  percent: number;
};

export type ReviewError = {
  key: string;
  at: string;
  sourceTitle: string;
  path: string;
  skill: ProgressSkill;
  number: string;
  prompt: string;
  given: string;
  expected: string;
  explanation?: string;
};

function score(total: { points: number; max: number }, add: { points: number; max: number }) {
  if (!Number.isFinite(add.points) || !Number.isFinite(add.max) || add.max <= 0) return;
  total.points += add.points;
  total.max += add.max;
}

/** Punktanteile pro Kompetenz über alle Versuche mit Detailauswertung. */
export function buildSkillStats(
  index: ProgressIndex,
  simulationAttempts: StoredAttempt[],
  moduleAttempts: ModuleAttempt[],
): SkillStat[] {
  const byId = new Map<string, QuestionMeta>();
  for (const source of [...index.simulations, ...index.modules]) {
    for (const question of source.questions) byId.set(question.id, question);
  }

  const totals = new Map<ProgressSkill, { points: number; max: number; count: number }>();
  const add = (skill: ProgressSkill, points: number, max: number) => {
    const current = totals.get(skill) ?? { points: 0, max: 0, count: 0 };
    score(current, { points, max });
    current.count += 1;
    totals.set(skill, current);
  };

  for (const attempt of simulationAttempts) {
    for (const result of Object.values(attempt.detail?.results ?? {})) {
      const meta = byId.get(result.id);
      if (!meta) continue;
      if (result.items?.length) {
        for (const item of result.items) add(meta.skill, item.points, item.max);
      } else {
        add(meta.skill, result.points, result.max);
      }
    }
  }

  for (const attempt of moduleAttempts) {
    for (const result of attempt.detail?.results ?? []) {
      const meta = byId.get(result.taskId);
      if (!meta) continue;
      add(meta.skill, result.points, result.max);
    }
  }

  return PROGRESS_SKILLS.map((skill) => {
    const current = totals.get(skill) ?? { points: 0, max: 0, count: 0 };
    return {
      skill,
      points: Math.round(current.points * 10) / 10,
      max: Math.round(current.max * 10) / 10,
      count: current.count,
      percent: current.max === 0 ? 0 : Math.round((current.points / current.max) * 100),
    };
  });
}

/**
 * Falsche Items, neueste zuerst. Wiederholungen derselben Aufgabe werden
 * zusammengefasst, damit die Wiederholungsliste nicht mit Duplikaten voll-
 * läuft. Nur Versuche mit Detailauswertung können hier erscheinen.
 */
export function collectReviewErrors(
  index: ProgressIndex,
  simulationAttempts: StoredAttempt[],
  moduleAttempts: ModuleAttempt[],
): ReviewError[] {
  const byId = new Map<string, QuestionMeta>();
  const sourceById = new Map<string, ProgressSource>();
  for (const source of [...index.simulations, ...index.modules]) {
    sourceById.set(source.id, source);
    for (const question of source.questions) byId.set(question.id, question);
  }

  const errors: ReviewError[] = [];
  const seen = new Set<string>();

  const push = (error: ReviewError) => {
    const key = `${error.sourceTitle}:${error.number}:${error.prompt}`;
    if (seen.has(key)) return;
    seen.add(key);
    errors.push(error);
  };

  for (const attempt of simulationAttempts) {
    const source = sourceById.get(attempt.simulationId);
    const detail = attempt.detail;
    if (!source || !detail) continue;

    for (const result of Object.values(detail.results)) {
      const meta = byId.get(result.id);
      if (!meta) continue;

      if (result.items?.length) {
        for (const item of result.items) {
          if (item.achieved) continue;
          const itemMeta = byId.get(item.id);
          push({
            key: `${attempt.at}:${item.id}`,
            at: attempt.at,
            sourceTitle: source.title,
            path: source.path,
            skill: meta.skill,
            number: itemMeta?.number ?? meta.number,
            prompt: itemMeta?.prompt ?? meta.prompt,
            given: item.given || "—",
            expected: item.expected,
            explanation: itemMeta?.explanation,
          });
        }
        continue;
      }

      if (result.points >= result.max) continue;
      const missed = result.met.filter((criterion) => !criterion.achieved).map((criterion) => criterion.label);
      push({
        key: `${attempt.at}:${result.id}`,
        at: attempt.at,
        sourceTitle: source.title,
        path: source.path,
        skill: meta.skill,
        number: meta.number,
        prompt: meta.prompt,
        given: detail.answers[result.id]?.trim() || "—",
        expected: meta.expected,
        explanation: result.feedback || (missed.length ? missed.join(" · ") : meta.explanation),
      });
    }
  }

  for (const attempt of moduleAttempts) {
    const source = sourceById.get(attempt.moduleId);
    const detail = attempt.detail;
    if (!source || !detail) continue;

    for (const result of detail.results) {
      if (result.points >= result.max) continue;
      const meta = byId.get(result.taskId);
      if (!meta) continue;
      const missed = result.criteria.filter((criterion) => !criterion.achieved).map((criterion) => criterion.label);
      push({
        key: `${attempt.at}:${result.taskId}`,
        at: attempt.at,
        sourceTitle: source.title,
        path: source.path,
        skill: meta.skill,
        number: meta.number,
        prompt: meta.prompt,
        given: detail.answers[result.taskId]?.trim() || "—",
        expected: meta.expected,
        explanation: result.feedback || (missed.length ? missed.join(" · ") : meta.explanation),
      });
    }
  }

  return errors.slice(0, 40);
}
