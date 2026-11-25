import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReportClient } from "@/components/dsh/report-client";
import { dshCopy } from "@/lib/dsh/copy";
import { buildProgressIndex } from "@/lib/dsh/progress-index";
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
    title: { absolute: `${copy.report.title} · DSH-Trainer` },
    description: copy.report.lead,
    alternates: dshAlternates(locale, "/fortschritt/bericht"),
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <ReportClient locale={locale} copy={dshCopy[locale]} index={buildProgressIndex()} />;
}
