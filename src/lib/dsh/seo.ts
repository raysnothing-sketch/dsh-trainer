import { defaultLocale, localePath, locales, type Locale } from "@/lib/i18n/config";

/** Hreflang du trainer pour toutes les locales. */
export function dshAlternates(locale: Locale, path: string) {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((code) => [code, localePath(code, path)]),
  );
  languages["x-default"] = localePath(defaultLocale, path);
  return { canonical: localePath(locale, path), languages };
}
