"use client";

import dynamic from "next/dynamic";

import type { DshCopy } from "@/lib/dsh/copy";
import type { ProgressIndex } from "@/lib/dsh/progress";
import type { Locale } from "@/lib/i18n/config";

/**
 * Le tableau de bord lit `localStorage` dès son premier rendu. Il est donc
 * chargé uniquement côté client : pas de divergence d'hydratation.
 */
const Dashboard = dynamic(
  () => import("@/components/dsh/dashboard").then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="shell py-24">
        <div className="h-2 w-40 bg-line" />
        <div className="mt-6 h-10 w-2/3 bg-line-soft" />
        <div className="mt-4 h-2 w-1/2 bg-line-soft" />
      </div>
    ),
  },
);

export function DashboardClient(props: {
  locale: Locale;
  copy: DshCopy;
  index: ProgressIndex;
}) {
  return <Dashboard {...props} />;
}
