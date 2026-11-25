import type { MetadataRoute } from "next";

import { simulations } from "@/lib/dsh";
import { lessonKeys } from "@/lib/dsh/lessons";
import { env } from "@/lib/env";
import { defaultLocale, localePath, locales } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl().replace(/\/$/, "");
  const paths = [
    "/",
    "/fortschritt",
    "/strukturen",
    "/lernen",
    ...lessonKeys.map((key) => `/lernen/${key}`),
    "/hoeren",
    "/sprechen",
    "/schreiben",
    "/mathematik",
    "/wortschatz",
    ...simulations.map((simulation) => `/simulation/${simulation.slug}`),
  ];

  return paths.flatMap((path) =>
    locales.map((locale) => {
      const languages: Record<string, string> = Object.fromEntries(
        locales.map((code) => [code, `${base}${localePath(code, path)}`]),
      );
      languages["x-default"] = `${base}${localePath(defaultLocale, path)}`;
      return {
        url: `${base}${localePath(locale, path)}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: path === "/" ? 1 : 0.7,
        alternates: { languages },
      };
    }),
  );
}
