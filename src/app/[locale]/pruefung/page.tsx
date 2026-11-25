import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FullExamClient } from "@/components/dsh/full-exam-client";
import { simulations } from "@/lib/dsh";
import { dshCopy } from "@/lib/dsh/copy";
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
    title: { absolute: `${copy.exam.nav} · DSH-Trainer` },
    description: copy.exam.lead,
    alternates: dshAlternates(locale, "/pruefung"),
  };
}

export default async function ExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slug?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { slug } = await searchParams;
  const simulation = simulations.find((entry) => entry.slug === slug) ?? simulations[0];

  return (
    <FullExamClient
      locale={locale}
      copy={dshCopy[locale]}
      simulation={simulation}
      simulations={simulations.map((entry) => ({ slug: entry.slug, title: entry.title }))}
      hrefHub={`/${locale}`}
    />
  );
}
