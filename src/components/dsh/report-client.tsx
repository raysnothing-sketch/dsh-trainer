"use client";

import dynamic from "next/dynamic";

import type { DshCopy } from "@/lib/dsh/copy";
import type { ProgressIndex } from "@/lib/dsh/progress";
import type { Locale } from "@/lib/i18n/config";

const Report = dynamic(() => import("@/components/dsh/report").then((mod) => mod.Report), {
  ssr: false,
  loading: () => (
    <div className="shell py-24">
      <div className="h-2 w-40 bg-line" />
      <div className="mt-6 h-10 w-2/3 bg-line-soft" />
    </div>
  ),
});

export function ReportClient(props: { locale: Locale; copy: DshCopy; index: ProgressIndex }) {
  return <Report {...props} />;
}
