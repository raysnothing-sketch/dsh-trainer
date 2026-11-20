import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MathTrainer } from "@/components/dsh/math-trainer";
import { dshCopy } from "@/lib/dsh/copy";
import { mathChapters, mathLessonCount, mathTerms, mathTermCount } from "@/lib/dsh/math";
import { dshAlternates } from "@/lib/dsh/seo";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = dshCopy[locale];
  return {
    title: { absolute: `${copy.math.nav} · DSH-Trainer` },
    description: copy.math.lead,
    alternates: dshAlternates(locale, "/mathematik"),
  };
}

export default async function MathematicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = dshCopy[locale];

  return (
    <div className="pb-20">
      <header className="shell border-b border-line pt-12 pb-10 sm:pt-16">
        <p className="dsh-margin-note">{copy.math.kicker}</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.2rem,5vw,3.7rem)] leading-[1.03]">
          {copy.math.title}
        </h1>
        <p className="mt-5 max-w-2xl font-display text-[1.05rem] leading-relaxed text-mute">
          {copy.math.lead}
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-4 font-mono text-[0.6rem] tracking-[0.12em] text-mute uppercase">
          <div className="flex items-baseline gap-2">
            <dt>{copy.math.chapters}</dt>
            <dd className="text-violet tabular-nums">{String(mathChapters.length).padStart(2, "0")}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt>{copy.math.lessons}</dt>
            <dd className="text-violet tabular-nums">{String(mathLessonCount).padStart(2, "0")}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt>{copy.math.terms}</dt>
            <dd className="text-violet tabular-nums">{String(mathTermCount).padStart(2, "0")}</dd>
          </div>
        </dl>
      </header>

      <nav aria-label={copy.math.chapters} className="shell mt-8">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {mathChapters.map((chapter) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className="group flex items-baseline gap-3 border border-line bg-ink-card px-4 py-3 transition-colors hover:border-violet"
              >
                <span className="font-mono text-[0.62rem] text-violet">{chapter.number}</span>
                <span className="min-w-0 flex-1 font-display text-[0.98rem] leading-tight text-chalk">
                  {chapter.title}
                </span>
                <span className="font-mono text-[0.55rem] text-mute tabular-nums">
                  {chapter.lessons.length} / {chapter.terms.length}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="shell mt-14 space-y-16">
        {mathChapters.map((chapter) => (
          <section key={chapter.id} id={chapter.id} className="scroll-mt-28">
            <header className="border-b border-line pb-4">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-[2.6rem] leading-none text-violet/80">
                  {chapter.number}
                </span>
                <div className="min-w-0">
                  <p className="dsh-margin-note">{copy.math.chapters}</p>
                  <h2 className="mt-1 text-[clamp(1.6rem,3.2vw,2.3rem)] leading-tight">
                    {chapter.title}
                  </h2>
                </div>
              </div>
              <p className="mt-3 max-w-2xl font-display text-[1rem] leading-relaxed text-mute">
                {chapter.lead}
              </p>
            </header>

            <div className="mt-5 space-y-3">
              {chapter.lessons.map((lesson) => (
                <details
                  key={lesson.id}
                  className="dsh-details panel group overflow-hidden"
                  open={lesson === chapter.lessons[0]}
                >
                  <summary className="flex w-full cursor-pointer list-none items-start gap-4 p-5 text-left sm:p-6">
                    <span className="font-display text-[1.7rem] leading-none text-violet/80">
                      {lesson.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[1.22rem] leading-tight text-chalk">
                        {lesson.title}
                      </span>
                      <span className="mt-1 block font-display text-[0.9rem] leading-relaxed text-mute">
                        {lesson.lead}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="dsh-details-mark font-mono text-lg leading-none text-mute transition-transform"
                    >
                      +
                    </span>
                  </summary>

                  <div className="border-t border-line px-5 py-6 sm:px-6">
                    <div className="space-y-7">
                      {lesson.sections.map((section, sectionIndex) => (
                        <section key={section.heading} className="border-l-2 border-line pl-5">
                          <p className="dsh-margin-note">
                            {copy.learn.lessonLabel} {lesson.number} ·{" "}
                            {String(sectionIndex + 1).padStart(2, "0")}
                          </p>
                          <h3 className="mt-2 font-display text-[1.12rem] text-chalk">
                            {section.heading}
                          </h3>
                          <p className="mt-2 font-display text-[0.95rem] leading-[1.85] text-chalk/85">
                            {section.body}
                          </p>
                          {section.example ? (
                            <div className="mt-3 border-l-2 border-cyan/60 bg-ink-soft/50 px-4 py-3">
                              <p className="font-mono text-[0.52rem] tracking-[0.14em] text-cyan uppercase">
                                {copy.learn.example}
                              </p>
                              <p className="mt-1 font-display text-[0.9rem] leading-relaxed text-chalk">
                                {section.example}
                              </p>
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>

                    <div className="mt-7 border-t-2 border-violet/50 pt-4">
                      <p className="dsh-margin-note">{copy.learn.takeaway}</p>
                      <p className="mt-2 font-display text-[1.08rem] leading-relaxed text-chalk">
                        {lesson.takeaway}
                      </p>
                    </div>
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-8">
              <p className="dsh-margin-note">
                {copy.math.terms} · {chapter.terms.length}
              </p>
              <div className="mt-3 overflow-x-auto border border-line bg-ink-card">
                <table className="w-full min-w-[38rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line bg-ink-soft/60 font-mono text-[0.54rem] tracking-[0.14em] text-mute uppercase">
                      <th scope="col" className="px-4 py-2.5 font-normal">
                        {copy.vocab.term}
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-normal">
                        {copy.math.reading}
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-normal">
                        {copy.math.meaning}
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-normal">
                        {copy.vocab.en} · {copy.vocab.fr}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {chapter.terms.map((term) => (
                      <tr key={term.term} className="align-top text-[0.84rem]">
                        <td className="px-4 py-3">
                          <span className="font-display text-[0.95rem] text-chalk">{term.term}</span>
                          {term.symbol ? (
                            <span className="mt-1 block font-mono text-[0.78rem] text-cyan">
                              {term.symbol}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 font-mono text-[0.72rem] leading-relaxed text-mute">
                          {term.spoken ?? "–"}
                        </td>
                        <td className="px-4 py-3 leading-relaxed text-chalk/85">{term.meaning}</td>
                        <td className="px-4 py-3 leading-relaxed text-mute">
                          {term.en}
                          <span className="mt-0.5 block text-mute/75">{term.fr}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}
      </div>

      <MathTrainer terms={mathTerms} copy={copy} />
    </div>
  );
}
