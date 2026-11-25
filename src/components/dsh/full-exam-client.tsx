"use client";

import dynamic from "next/dynamic";

import type { DshCopy } from "@/lib/dsh/copy";
import type { DshSimulation } from "@/lib/dsh/types";
import type { Locale } from "@/lib/i18n/config";

/** Der Entwurf wird beim ersten Rendern aus localStorage gelesen. */
const FullExam = dynamic(
  () => import("@/components/dsh/full-exam").then((mod) => mod.FullExam),
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

export function FullExamClient(props: {
  locale: Locale;
  copy: DshCopy;
  simulation: DshSimulation;
  simulations: { slug: string; title: string }[];
  hrefHub: string;
}) {
  return <FullExam {...props} />;
}
