import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VocabFilter } from "@/components/dsh/vocab-filter";
import { VocabTrainer } from "@/components/dsh/vocab-trainer";
import { dshCopy } from "@/lib/dsh/copy";
import { dshAlternates } from "@/lib/dsh/seo";
import { vocabCount, vocabDomains, vocabEntries } from "@/lib/dsh/vocab";
import { vocabTypeKeys } from "@/lib/dsh/vocab-types";
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
    title: { absolute: `${copy.vocab.nav} · DSH-Trainer` },
    description: copy.vocab.lead,
    alternates: dshAlternates(locale, "/wortschatz"),
  };
}

export default async function VocabularyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = dshCopy[locale];

  const typeCounts = Object.fromEntries(
    vocabTypeKeys.map((key) => [
      key,
      vocabEntries.filter((entry) => entry.type === key).length,
    ]),
  ) as Record<string, number>;

  return (
    <div className="pb-20">
      <header className="shell border-b border-line pt-12 pb-10 sm:pt-16">
        <p className="dsh-margin-note">{copy.vocab.kicker}</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.2rem,5vw,3.7rem)] leading-[1.03]">
          {copy.vocab.title}
        </h1>
        <p className="mt-5 max-w-2xl font-display text-[1.05rem] leading-relaxed text-mute">
          {copy.vocab.lead}
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-4 font-mono text-[0.6rem] tracking-[0.12em] text-mute uppercase">
          <div className="flex items-baseline gap-2">
            <dt>{copy.vocab.domains}</dt>
            <dd className="text-violet tabular-nums">
              {String(vocabDomains.length).padStart(2, "0")}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt>{copy.vocab.entries}</dt>
            <dd className="text-violet tabular-nums">{vocabCount}</dd>
          </div>
          {vocabTypeKeys.map((key) => (
            <div key={key} className="flex items-baseline gap-1.5">
              <dt>{copy.vocab.types[key]}</dt>
              <dd className="text-cyan tabular-nums">{typeCounts[key]}</dd>
            </div>
          ))}
        </dl>

        <nav aria-label={copy.vocab.domains} className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
          {vocabDomains.map((domain, index) => (
            <a
              key={domain.key}
              href={`#${domain.key}`}
              className="border-b border-line pb-0.5 font-mono text-[0.58rem] tracking-[0.1em] text-mute uppercase transition-colors hover:border-violet hover:text-violet"
            >
              {String(index + 1).padStart(2, "0")} {domain.title}
            </a>
          ))}
        </nav>
      </header>

      <VocabTrainer entries={vocabEntries} domains={vocabDomains} copy={copy} />

      <section className="shell mt-14">
        <header className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="dsh-margin-note">{copy.vocab.domains}</p>
            <h2 className="mt-2 text-[clamp(1.7rem,3.2vw,2.4rem)]">{copy.vocab.nav}</h2>
          </div>
          <span className="font-mono text-[0.6rem] tracking-[0.12em] text-mute uppercase">
            {vocabCount} {copy.vocab.entries}
          </span>
        </header>

        <div className="mt-5">
          <VocabFilter
            domains={vocabDomains.map((domain) => ({
              key: domain.key,
              title: domain.title,
              count: domain.entries.length,
            }))}
            total={vocabCount}
            copy={copy}
          />
        </div>

        <div id="wortschatz-liste" className="mt-10 space-y-14">
          {vocabDomains.map((domain) => (
            <section
              key={domain.key}
              id={domain.key}
              data-vocab-domain={domain.key}
              className="scroll-mt-28"
            >
              <header className="border-b border-line pb-3">
                <p className="dsh-margin-note">
                  {copy.vocab.domains} · {domain.entries.length}
                </p>
                <h3 className="mt-2 text-[clamp(1.4rem,2.6vw,1.9rem)]">{domain.title}</h3>
                <p className="mt-2 max-w-2xl font-display text-[0.95rem] leading-relaxed text-mute">
                  {domain.lead}
                </p>
              </header>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {domain.entries.map((entry) => (
                  <article
                    key={`${domain.key}-${entry.term}`}
                    data-vocab-entry="true"
                    data-domain={domain.key}
                    data-type={entry.type}
                    data-search={[
                      entry.term,
                      entry.forms ?? "",
                      entry.type,
                      copy.vocab.types[entry.type],
                      entry.definition,
                      entry.example,
                      entry.glossEn,
                      entry.glossFr,
                      entry.collocation ?? "",
                    ]
                      .join(" ")
                      .toLowerCase()}
                    className="panel flex flex-col p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-display text-[1.08rem] leading-snug text-chalk">
                        {entry.term}
                      </h4>
                      <span className="dsh-stamp shrink-0 text-cyan">
                        {copy.vocab.types[entry.type]}
                      </span>
                    </div>
                    {entry.forms ? (
                      <p className="mt-1 font-mono text-[0.68rem] text-cyan">{entry.forms}</p>
                    ) : null}
                    <p className="mt-2 font-display text-[0.9rem] leading-relaxed text-chalk/85">
                      {entry.definition}
                    </p>
                    <p className="mt-2 border-l-2 border-line pl-3 font-display text-[0.84rem] leading-relaxed text-mute italic">
                      «{entry.example}»
                    </p>
                    {entry.collocation ? (
                      <p className="mt-2 font-mono text-[0.55rem] tracking-[0.08em] text-cyan uppercase">
                        {copy.vocab.collocation}: {entry.collocation}
                      </p>
                    ) : null}
                    <p className="mt-auto border-t border-dashed border-line pt-2 font-mono text-[0.55rem] tracking-[0.08em] text-mute uppercase">
                      {copy.vocab.en}: {entry.glossEn} · {copy.vocab.fr}: {entry.glossFr}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
