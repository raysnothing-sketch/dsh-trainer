import { openQuestionIds } from "@/lib/dsh/scoring";
import type { DshAnswers } from "@/lib/dsh/scoring";
import type { DshSimulation } from "@/lib/dsh/types";

/**
 * Correcteur IA côté serveur.
 *
 * Le client n'envoie que le slug de la simulation et ses réponses : le contenu
 * des questions, les critères et les points restent sur le serveur. Le modèle
 * ne fait donc que noter, il ne peut pas réécrire le barème.
 */

export type AiCriterion = { id: string; achieved: boolean; comment?: string };

export type AiTaskResult = {
  id: string;
  points: number;
  criteria: AiCriterion[];
  feedback: string;
  rewrite?: string;
};

export type AiEvaluation = {
  results: AiTaskResult[];
  summary?: string;
  model: string;
};

const SYSTEM_PROMPT = `Du bist erfahrene DSH-Prüferin an einer deutschen Universität und bewertest den Prüfungsteil "Leseverstehen und Wissenschaftssprachliche Strukturen".

Regeln:
- Bewerte ausschließlich anhand des vorgegebenen Kriterienkatalogs und der Musterlösung.
- Vergib nur Punkte für Inhalte, die im Lesetext belegt sind. Erfundene oder ungenaue Inhalte erhalten keinen Punkt.
- Wörtliches Abschreiben aus dem Text wird nicht belohnt: Wenn eine Antwort überwiegend kopiert ist, vergib für den betroffenen Inhalt keine Punkte und weise darauf hin.
- Sei streng, aber fair. Teillösungen erhalten Teilpunkte in 0,5-Schritten.
- Schreibe Rückmeldungen auf Deutsch, max. 3 Sätze pro Aufgabe, konkret und lernförderlich.
- "rewrite" enthält eine verbesserte Version der Antwort des Kandidaten, die die volle Punktzahl erreichen würde.

Antworte ausschließlich mit gültigem JSON in diesem Format:
{"results":[{"id":"...","points":2.5,"criteria":[{"id":"c1","achieved":true,"comment":"..."}],"feedback":"...","rewrite":"..."}],"summary":"..."}`;

type ProviderMessage = { role: "system" | "user"; content: string };

type Provider = { key: string; base: string; model: string };

function providers(): Provider[] {
  const list: Provider[] = [];
  const add = (key: string | undefined, base: string, model: string) => {
    if (key) list.push({ key, base: base.replace(/\/$/, ""), model });
  };

  add(
    process.env.DSH_AI_API_KEY,
    process.env.DSH_AI_BASE_URL ?? "https://api.openai.com/v1",
    process.env.DSH_AI_MODEL ?? "gpt-4o-mini",
  );
  add(
    process.env.KIMI_API_KEY,
    process.env.KIMI_BASE_URL ?? "https://api.moonshot.ai/v1",
    process.env.KIMI_MODEL ?? "kimi-k3.1-pro",
  );
  add(
    process.env.OMNIROUTE_API_KEY,
    process.env.OMNIROUTE_BASE_URL ?? "http://localhost:20128/v1",
    process.env.OMNIROUTE_MODEL ?? process.env.KIMI_MODEL ?? "kimi-k3.1-pro",
  );
  return list;
}

export function aiConfigured(): boolean {
  return providers().length > 0;
}

export function aiModelName(): string {
  return providers()[0]?.model ?? "";
}

type TaskPayload = {
  id: string;
  number: string;
  kind: "textverstehen" | "struktur";
  prompt: string;
  maxPoints: number;
  criteria: { id: string; label: string }[];
  modelAnswer: string;
  studentAnswer: string;
};

function buildTasks(simulation: DshSimulation, answers: DshAnswers): TaskPayload[] {
  const ids = new Set(openQuestionIds(simulation));
  const tasks: TaskPayload[] = [];

  for (const question of simulation.leseverstehen) {
    if (question.kind !== "open" || !ids.has(question.id)) continue;
    const answer = (answers[question.id] ?? "").slice(0, 2500);
    if (!answer.trim()) continue;
    tasks.push({
      id: question.id,
      number: question.number,
      kind: "textverstehen",
      prompt: question.prompt,
      maxPoints: question.points,
      criteria: question.criteria.map((criterion) => ({
        id: criterion.id,
        label: criterion.label,
      })),
      modelAnswer: question.sampleAnswer,
      studentAnswer: answer,
    });
  }

  for (const task of simulation.strukturen) {
    if (!task.criteria || !ids.has(task.id)) continue;
    const answer = (answers[task.id] ?? "").slice(0, 2000);
    if (!answer.trim()) continue;
    tasks.push({
      id: task.id,
      number: task.label,
      kind: "struktur",
      prompt: task.prompt,
      maxPoints: task.points,
      criteria: task.criteria.map((criterion) => ({ id: criterion.id, label: criterion.label })),
      modelAnswer: task.modelAnswer,
      studentAnswer: answer,
    });
  }

  return tasks;
}

function sanitize(raw: unknown, tasks: TaskPayload[]): AiEvaluation["results"] {
  const payload = raw as { results?: unknown; summary?: unknown };
  const list = Array.isArray(payload?.results) ? payload.results : [];
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const results: AiTaskResult[] = [];

  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Record<string, unknown>;
    const id = typeof candidate.id === "string" ? candidate.id : "";
    const task = byId.get(id);
    if (!task) continue;

    const points = typeof candidate.points === "number" ? candidate.points : 0;
    const clamped = Math.max(0, Math.min(task.maxPoints, Math.round(points * 2) / 2));
    const criteria: AiCriterion[] = Array.isArray(candidate.criteria)
      ? candidate.criteria
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item) => ({
            id: typeof item.id === "string" ? item.id : "",
            achieved: item.achieved === true,
            comment: typeof item.comment === "string" ? item.comment : undefined,
          }))
          .filter((item) => item.id.length > 0)
      : [];

    results.push({
      id,
      points: clamped,
      criteria,
      feedback: typeof candidate.feedback === "string" ? candidate.feedback : "",
      rewrite: typeof candidate.rewrite === "string" ? candidate.rewrite : undefined,
    });
  }

  return results;
}

export async function callProvider(
  messages: ProviderMessage[],
  strictJson: boolean,
): Promise<Response> {
  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (const provider of providers()) {
    try {
      const response = await fetch(`${provider.base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.1,
          max_tokens: 3000,
          messages,
          ...(strictJson ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: AbortSignal.timeout(
          provider.base.includes("localhost") ? 3_000 : 50_000,
        ),
        cache: "no-store",
      });
      if (response.ok) return response;
      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError ?? new Error("No AI provider configured");
}

export async function gradeWithAi(
  simulation: DshSimulation,
  answers: DshAnswers,
): Promise<AiEvaluation> {
  const model = aiModelName();
  const tasks = buildTasks(simulation, answers);
  if (tasks.length === 0) {
    return { results: [], model, summary: undefined };
  }

  const text = simulation.text.lines.map((line) => line.t).join("\n");
  const userContent = JSON.stringify(
    {
      simulation: { titel: simulation.title, thema: simulation.topic },
      lesetext: text,
      aufgaben: tasks,
    },
    null,
    1,
  );

  const messages: ProviderMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Bewerte die folgenden Antworten. Gib für jede Aufgabe Punkte, Kriterien und Feedback zurück.\n\n${userContent}`,
    },
  ];

  let response = await callProvider(messages, true);
  if (!response.ok && response.status === 400) {
    response = await callProvider(messages, false);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`AI provider ${response.status}: ${detail.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("AI provider returned an empty message");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI response is not JSON");
    parsed = JSON.parse(content.slice(start, end + 1));
  }

  const results = sanitize(parsed, tasks);
  if (results.length === 0) throw new Error("AI response contained no usable results");

  const summary =
    typeof (parsed as { summary?: unknown }).summary === "string"
      ? ((parsed as { summary: string }).summary)
      : undefined;

  return { results, model, summary };
}
