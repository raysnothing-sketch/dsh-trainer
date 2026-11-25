import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardClient } from "@/components/dsh/dashboard-client";
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
    title: { absolute: `${copy.nav.dashboard} · DSH-Trainer` },
    description: copy.dashboard.lead,
    alternates: dshAlternates(locale, "/fortschritt"),
  };
}

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <DashboardClient locale={locale} copy={dshCopy[locale]} index={buildProgressIndex()} />;
}
