/**
 * Serverseitig vorbereiteter Index für die Auswertung gespeicherter Versuche.
 * Es werden nur Titel, Aufgabenstichpunkte und Lösungen übertragen – keine
 * Lesetexte, keine Hörtexte. Der Client braucht genau diese Angaben für die
 * Fehlerwiederholung und die Kompetenzstatistik.
 */

import { simulations } from "@/lib/dsh";
import { modules } from "@/lib/dsh/modules";
import type { ProgressIndex, ProgressSource, QuestionMeta } from "@/lib/dsh/progress";

function simulationSource(): ProgressSource[] {
  return simulations.map((simulation) => {
    const questions: QuestionMeta[] = [];

    for (const question of simulation.leseverstehen) {
      if (question.kind === "open") {
        questions.push({
          id: question.id,
          number: question.number,
          prompt: question.prompt,
          skill: question.skill,
          expected: question.sampleAnswer,
        });
      } else if (question.kind === "vocab") {
        questions.push({
          id: question.id,
          number: question.number,
          prompt: question.prompt,
          skill: "wortschatz",
          expected: question.items.map((item) => item.answer).join(" · "),
        });
        for (const item of question.items) {
          questions.push({
            id: item.id,
            number: question.number,
            prompt: item.prompt,
            skill: "wortschatz",
            expected: item.answer,
          });
        }
      } else {
        questions.push({
          id: question.id,
          number: question.number,
          prompt: question.prompt,
          skill: "verstehen",
          expected: question.statements
            .map((statement) => statement.text)
            .join(" · "),
        });
        for (const statement of question.statements) {
          questions.push({
            id: statement.id,
            number: question.number,
            prompt: statement.text,
            skill: "verstehen",
            expected: statement.correct ? "richtig" : "nicht korrekt",
            explanation: statement.justification,
          });
        }
      }
    }

    for (const task of simulation.strukturen) {
      questions.push({
        id: task.id,
        number: task.label,
        prompt: task.prompt,
        skill: "strukturen",
        expected: task.modelAnswer,
        explanation: task.explanation,
      });
    }

    return {
      id: simulation.id,
      title: simulation.title,
      path: `/simulation/${simulation.slug}`,
      questions,
    };
  });
}

function moduleSource(): ProgressSource[] {
  const listening = modules.hoeren.questions.map<QuestionMeta>((question) => ({
    id: question.id,
    number: question.number,
    prompt: question.prompt,
    skill: "hoeren",
    expected:
      question.options?.find((option) => option.id === question.correct)?.text ??
      question.sampleAnswer ??
      question.correct ??
      "",
  }));

  const speaking = modules.sprechen.tasks.map<QuestionMeta>((task) => ({
    id: task.id,
    number: task.number,
    prompt: task.prompt,
    skill: "sprechen",
    expected: task.sampleAnswer,
  }));

  const writing = modules.schreiben.tasks.map<QuestionMeta>((task) => ({
    id: task.id,
    number: task.number,
    prompt: task.title,
    skill: "schreiben",
    expected: task.sampleOutline,
  }));

  return [
    { id: modules.hoeren.id, title: modules.hoeren.title, path: "/hoeren", questions: listening },
    { id: modules.sprechen.id, title: modules.sprechen.title, path: "/sprechen", questions: speaking },
    { id: modules.schreiben.id, title: modules.schreiben.title, path: "/schreiben", questions: writing },
  ];
}

export function buildProgressIndex(): ProgressIndex {
  return { simulations: simulationSource(), modules: moduleSource() };
}
