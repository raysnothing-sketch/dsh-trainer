import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardClient } from "@/components/dsh/dashboard-client";
import { simulations } from "@/lib/dsh";
import { dshCopy } from "@/lib/dsh/copy";
import { dshAlternates } from "@/lib/dsh/seo";
import { isLocale } from "@/lib/i18n/config";

/** Nur die leichten Metadaten werden zum Client geschickt, nicht die Texte. */
const simulationIndex = simulations.map((simulation) => ({
  id: simulation.id,
  slug: simulation.slug,
  title: simulation.title,
}));

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

  return (
    <DashboardClient
      locale={locale}
      copy={dshCopy[locale]}
      simulations={simulationIndex}
    />
  );
}
