import type { Metadata } from "next";
import { Newsreader, Roboto_Mono, Source_Sans_3 } from "next/font/google";
import { notFound } from "next/navigation";

import { DshNav } from "@/components/dsh/dsh-nav";
import { dshCopy } from "@/lib/dsh/copy";
import { isLocale, locales, localePath } from "@/lib/i18n/config";
import "../globals.css";
import "./dsh.css";

/**
 * Typographies du module : un serif académique calme, un sans institutionnel
 * et un mono neutre, propres au trainer.
 */
const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-dsh-display",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-dsh-sans",
  display: "swap",
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-dsh-mono",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = dshCopy[locale];

  return {
    title: {
      default: copy.nav.trainer,
      template: `%s · DSH-Trainer`,
    },
    description: copy.hub.lead,
    applicationName: "DSH-Trainer",
    alternates: {
      canonical: localePath(locale),
      languages: Object.fromEntries(locales.map((code) => [code, localePath(code)])),
    },
    openGraph: {
      type: "website",
      siteName: "DSH-Trainer",
      title: copy.nav.trainer,
      description: copy.hub.lead,
    },
  };
}

export default async function DshLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = dshCopy[locale];

  return (
    <html lang={locale} className="scroll-smooth">
      <body className="min-h-svh antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:border focus:border-line focus:bg-chalk focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          {locale === "fr"
            ? "Aller au contenu"
            : locale === "en"
              ? "Skip to content"
              : "Zum Inhalt springen"}
        </a>
        <div className={`dsh ${display.variable} ${sans.variable} ${mono.variable}`}>
          <DshNav locale={locale} copy={copy} />
          <main id="contenu">{children}</main>

          <footer className="dsh-rule-double mt-16 border-t border-line py-8">
            <div className="shell flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-display text-[1.05rem] leading-none text-chalk">
                  DSH<span className="text-violet">.</span>{" "}
                  <span className="font-sans text-[0.78rem] text-mute">Trainer</span>
                </p>
                <p className="mt-2 font-mono text-[0.55rem] tracking-[0.16em] text-mute uppercase">
                  Leseverstehen · Wissenschaftssprachliche Strukturen
                </p>
              </div>
              <p className="max-w-xl border-l-2 border-violet/40 pl-3 text-[0.72rem] leading-relaxed text-mute">
                {copy.hub.footnote}
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
