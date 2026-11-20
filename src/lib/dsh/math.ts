/**
 * Mathematik auf Deutsch — Einstieg in die Sprache der Mathematik.
 *
 * Der Inhalt ist auf Deutsch, weil er selbst Lernmaterial ist: Wer an einer
 * deutschen Hochschule Mathematik, Informatik, Ingenieurwesen oder
 * Wirtschaftswissenschaften studiert, hört Vorlesungen, liest Übungsblätter und
 * schreibt Klausuren auf Deutsch. Die Oberfläche bleibt lokalisiert.
 */

import type { Lesson } from "@/lib/dsh/lessons";

export type MathTerm = {
  term: string;
  symbol?: string;
  spoken?: string;
  meaning: string;
  en: string;
  fr: string;
};

export type MathChapter = {
  id: string;
  number: string;
  title: string;
  lead: string;
  lessons: Lesson[];
  terms: MathTerm[];
};

export const mathChapters: MathChapter[] = [
  {
    id: "grundlagen",
    number: "01",
    title: "Zahlen, Mengen, Zeichen",
    lead: "Bevor eine Vorlesung beginnt, muss die Notation sitzen. Diese Zeichen kehren in jedem Skript wieder.",
    lessons: [
      {
        id: "ma-1-1",
        number: "01",
        title: "Mengen und Zahlenbereiche",
        lead: "Die ersten zehn Minuten jeder Vorlesung definieren, wovon überhaupt die Rede ist.",
        sections: [
          {
            heading: "Mengen und Elemente",
            body: "Eine Menge fasst Objekte zusammen. «x ∈ A» heißt: x ist ein Element von A. «A ⊆ B» heißt: A ist eine Teilmenge von B, jedes Element von A liegt also auch in B. Die leere Menge ∅ enthält kein Element.",
            example: "A = {1, 2, 3}, B = {1, 2, 3, 4, 5} → A ⊆ B, aber 4 ∉ A.",
          },
          {
            heading: "Vereinigung und Schnitt",
            body: "A ∪ B enthält alles, was in A oder in B liegt. A ∩ B enthält nur, was in beiden Mengen liegt. Das Komplement A\\B enthält die Elemente von A, die nicht in B liegen.",
            example: "A = {1, 2, 3}, B = {3, 4} → A ∪ B = {1, 2, 3, 4}, A ∩ B = {3}.",
          },
          {
            heading: "Die Zahlenbereiche",
            body: "ℕ sind die natürlichen Zahlen, ℤ die ganzen, ℚ die rationalen und ℝ die reellen Zahlen. ℂ bezeichnet die komplexen Zahlen. In Skripten steht oft «sei x ∈ ℝ» – man liest: «x sei eine reelle Zahl».",
            example: "ℝ\\ℚ sind die irrationalen Zahlen, zum Beispiel √2 oder π.",
          },
        ],
        takeaway: "Jede Aufgabe beginnt mit einer Mengenangabe – wer sie liest, versteht die halbe Aufgabe.",
      },
      {
        id: "ma-1-2",
        number: "02",
        title: "Formeln laut lesen",
        lead: "Im Hörsaal wird jede Formel vorgelesen. Wer die Sprechweise kennt, kann folgen, ohne mitzuschreiben.",
        sections: [
          {
            heading: "Grundrechenarten und Potenzen",
            body: "a + b liest man «a plus b», a − b «a minus b», a · b «a mal b» oder «a multipliziert mit b», a : b «a durch b» oder «a geteilt durch b». a² heißt «a hoch zwei», aⁿ «a hoch n», √a «die Wurzel aus a».",
            example: "«x hoch zwei plus drei x minus vier gleich null» → x² + 3x − 4 = 0.",
          },
          {
            heading: "Gleichungen und Ungleichungen",
            body: "Das Gleichheitszeichen «=» liest man «gleich». «≈» heißt «ungefähr gleich», «≠» «ungleich», «<» «kleiner als», «≤» «kleiner oder gleich», «≥» «größer oder gleich». Bei Ungleichungen dreht sich das Zeichen, wenn man mit einer negativen Zahl multipliziert.",
            example: "−2x ≥ 6 → x ≤ −3.",
          },
          {
            heading: "Quantoren und Abkürzungen",
            body: "∀ bedeutet «für alle», ∃ «es existiert ein», ∃! «es existiert genau ein». «o. B. d. A.» heißt «ohne Beschränkung der Allgemeinheit»: Der Beweis gilt für einen Sonderfall, der alle anderen mit abdeckt. «z. z.» bedeutet «zu zeigen».",
            example: "∀ x ∈ ℝ: x² ≥ 0 – «für alle reellen x gilt: x Quadrat ist größer oder gleich null».",
          },
        ],
        takeaway: "Formeln sind Sätze. Wer sie laut lesen kann, kann sie auch verstehen.",
      },
    ],
    terms: [
      {
        term: "die Menge, -n",
        symbol: "M = { … }",
        spoken: "M gleich Menge der …",
        meaning: "Zusammenfassung von unterscheidbaren Objekten zu einer Einheit.",
        en: "set",
        fr: "ensemble",
      },
      {
        term: "die Teilmenge, -n",
        symbol: "A ⊆ B",
        spoken: "A ist Teilmenge von B",
        meaning: "Jedes Element von A ist auch Element von B.",
        en: "subset",
        fr: "sous-ensemble",
      },
      {
        term: "das Element, -e",
        symbol: "x ∈ A",
        spoken: "x ist Element von A",
        meaning: "Ein einzelnes Objekt, das zu einer Menge gehört.",
        en: "element",
        fr: "élément",
      },
      {
        term: "die leere Menge",
        symbol: "∅",
        spoken: "die leere Menge",
        meaning: "Die Menge ohne jedes Element.",
        en: "empty set",
        fr: "ensemble vide",
      },
      {
        term: "die Schnittmenge, -n",
        symbol: "A ∩ B",
        spoken: "A geschnitten B",
        meaning: "Alle Elemente, die gleichzeitig in A und in B liegen.",
        en: "intersection",
        fr: "intersection",
      },
      {
        term: "die Vereinigungsmenge, -n",
        symbol: "A ∪ B",
        spoken: "A vereinigt B",
        meaning: "Alle Elemente, die in A oder in B oder in beiden liegen.",
        en: "union",
        fr: "réunion",
      },
      {
        term: "die natürlichen Zahlen",
        symbol: "ℕ",
        spoken: "N",
        meaning: "Die Zahlen 0, 1, 2, 3 … (je nach Definition ohne oder mit null).",
        en: "natural numbers",
        fr: "nombres naturels",
      },
      {
        term: "die reellen Zahlen",
        symbol: "ℝ",
        spoken: "R",
        meaning: "Alle Zahlen auf der Zahlengeraden, also rationale und irrationale Zahlen.",
        en: "real numbers",
        fr: "nombres réels",
      },
      {
        term: "der Betrag, Beträge",
        symbol: "|x|",
        spoken: "Betrag von x",
        meaning: "Der Abstand einer Zahl von null, immer nicht negativ.",
        en: "absolute value",
        fr: "valeur absolue",
      },
      {
        term: "das Intervall, -e",
        symbol: "[a, b]",
        spoken: "das abgeschlossene Intervall von a bis b",
        meaning: "Alle Zahlen zwischen zwei Grenzen; eckige Klammern schließen die Grenzen ein.",
        en: "interval",
        fr: "intervalle",
      },
      {
        term: "die Ungleichung, -en",
        symbol: "a ≤ b",
        spoken: "a kleiner oder gleich b",
        meaning: "Ein Vergleich zweier Ausdrücke mit <, >, ≤ oder ≥.",
        en: "inequality",
        fr: "inéquation",
      },
      {
        term: "der Quotient, -en",
        symbol: "a : b",
        spoken: "a durch b",
        meaning: "Das Ergebnis einer Division.",
        en: "quotient",
        fr: "quotient",
      },
    ],
  },
  {
    id: "analysis",
    number: "02",
    title: "Funktionen und Analysis",
    lead: "Von der Funktionsgleichung bis zum Integral: die Sprache der Veränderung.",
    lessons: [
      {
        id: "ma-2-1",
        number: "01",
        title: "Funktionen beschreiben",
        lead: "Eine Funktion ordnet jedem Element der Definitionsmenge genau ein Element der Wertemenge zu.",
        sections: [
          {
            heading: "Definitions- und Wertemenge",
            body: "f: A → B heißt: Die Funktion f ordnet jedem x aus A genau ein f(x) aus B zu. A ist die Definitionsmenge, B die Zielmenge; die tatsächlich erreichten Werte bilden die Wertemenge. Bei f(x) = 1/x ist die Definitionsmenge ℝ ohne die null.",
            example: "f(x) = √x hat die Definitionsmenge [0, ∞) – negative Zahlen haben keine reelle Wurzel.",
          },
          {
            heading: "Steigung und Monotonie",
            body: "Die Steigung beschreibt, wie stark sich f(x) ändert, wenn x wächst. Eine Funktion ist monoton steigend, wenn größere x auch größere Funktionswerte liefern; streng monoton, wenn die Werte echt größer werden.",
            example: "«Die Funktion ist auf dem Intervall [0, 5] streng monoton steigend.»",
          },
          {
            heading: "Grenzwerte und Stetigkeit",
            body: "Der Grenzwert lim f(x) für x → a beschreibt, welchem Wert sich die Funktion nähert. Eine Funktion ist stetig, wenn ihr Graph keine Sprünge hat: Der Grenzwert stimmt mit dem Funktionswert überein.",
            example: "lim (1/x) für x → ∞ ist 0 – die x-Achse ist eine Asymptote.",
          },
        ],
        takeaway: "Erst Definitionsmenge prüfen, dann rechnen – die häufigste Fehlerquelle in Klausuren.",
      },
      {
        id: "ma-2-2",
        number: "02",
        title: "Ableitung und Integral",
        lead: "Zwei Operationen, zwei Bedeutungen: die Änderungsrate und die Fläche.",
        sections: [
          {
            heading: "Die Ableitung",
            body: "Die Ableitung f′(x) gibt die Steigung der Tangente an der Stelle x an, also die momentane Änderungsrate. Man liest f′(x) als «f Strich von x». Die zweite Ableitung f″(x) beschreibt die Krümmung.",
            example: "Bei f(x) = x² ist f′(x) = 2x; an der Stelle x = 3 beträgt die Steigung 6.",
          },
          {
            heading: "Extremstellen",
            body: "Eine notwendige Bedingung für ein lokales Extremum ist f′(x) = 0. Ob ein Hoch- oder Tiefpunkt vorliegt, entscheidet die zweite Ableitung: f″(x) < 0 bedeutet ein Maximum, f″(x) > 0 ein Minimum.",
            example: "f(x) = x² hat bei x = 0 ein Minimum, weil f″(0) = 2 > 0.",
          },
          {
            heading: "Das Integral",
            body: "Das bestimmte Integral ∫ von a bis b über f(x) dx berechnet die Fläche zwischen Graph und x-Achse. Die Stammfunktion F ist eine Funktion, deren Ableitung wieder f ergibt. Der Hauptsatz der Differential- und Integralrechnung verbindet beide.",
            example: "∫ von 0 bis 2 über x dx = 2 – die Fläche des Dreiecks unter der Geraden y = x.",
          },
        ],
        takeaway: "Ableitung = Steigung, Integral = Fläche. Alles andere ist Handwerk.",
      },
    ],
    terms: [
      {
        term: "die Funktion, -en",
        symbol: "f: A → B",
        spoken: "f von A nach B",
        meaning: "Eine eindeutige Zuordnung von jedem x der Definitionsmenge zu genau einem Funktionswert.",
        en: "function",
        fr: "fonction",
      },
      {
        term: "die Definitionsmenge, -n",
        symbol: "D",
        spoken: "Definitionsmenge",
        meaning: "Alle Werte, die man in die Funktion einsetzen darf.",
        en: "domain",
        fr: "ensemble de définition",
      },
      {
        term: "die Wertemenge, -n",
        symbol: "W",
        spoken: "Wertemenge",
        meaning: "Alle Werte, die die Funktion tatsächlich annimmt.",
        en: "range",
        fr: "ensemble image",
      },
      {
        term: "die Steigung, -en",
        symbol: "m",
        spoken: "m",
        meaning: "Maß dafür, wie stark eine Gerade oder Kurve ansteigt oder fällt.",
        en: "slope",
        fr: "pente",
      },
      {
        term: "die Ableitung, -en",
        symbol: "f′(x)",
        spoken: "f Strich von x",
        meaning: "Die momentane Änderungsrate einer Funktion, also die Tangentensteigung.",
        en: "derivative",
        fr: "dérivée",
      },
      {
        term: "die Stammfunktion, -en",
        symbol: "F(x)",
        spoken: "groß F von x",
        meaning: "Eine Funktion, deren Ableitung die gegebene Funktion ergibt.",
        en: "antiderivative",
        fr: "primitive",
      },
      {
        term: "das Integral, -e",
        symbol: "∫ f(x) dx",
        spoken: "Integral über f von x dx",
        meaning: "Die Fläche unter dem Graphen, berechnet über die Stammfunktion.",
        en: "integral",
        fr: "intégrale",
      },
      {
        term: "der Grenzwert, -e",
        symbol: "lim",
        spoken: "Limes",
        meaning: "Der Wert, dem sich eine Folge oder Funktion annähert.",
        en: "limit",
        fr: "limite",
      },
      {
        term: "die Stetigkeit",
        spoken: "Stetigkeit",
        meaning: "Eigenschaft einer Funktion ohne Sprungstellen: Grenzwert und Funktionswert stimmen überein.",
        en: "continuity",
        fr: "continuité",
      },
      {
        term: "der Hochpunkt, -e",
        symbol: "f′(x) = 0",
        spoken: "Hochpunkt",
        meaning: "Eine Stelle, an der die Funktion vom Steigen ins Fallen übergeht (lokales Maximum).",
        en: "local maximum",
        fr: "maximum local",
      },
      {
        term: "die Asymptote, -n",
        spoken: "Asymptote",
        meaning: "Eine Gerade, der sich der Graph beliebig weit nähert, ohne sie zu erreichen.",
        en: "asymptote",
        fr: "asymptote",
      },
      {
        term: "das Monotonieverhalten",
        spoken: "Monotonieverhalten",
        meaning: "Ob eine Funktion durchgehend steigt, fällt oder beides wechselt.",
        en: "monotonic behaviour",
        fr: "monotonie",
      },
    ],
  },
  {
    id: "lineare-algebra",
    number: "03",
    title: "Vektoren und Matrizen",
    lead: "Die Werkzeuge der linearen Algebra tauchen in Informatik, Physik und Statistik gleichermaßen auf.",
    lessons: [
      {
        id: "ma-3-1",
        number: "01",
        title: "Vektoren und Matrizen",
        lead: "Ein Vektor ist eine geordnete Liste von Zahlen, eine Matrix ein rechteckiges Schema.",
        sections: [
          {
            heading: "Vektoren",
            body: "Ein Vektor hat eine Richtung und einen Betrag. Man schreibt ihn als Spalte oder als Tupel: v = (2, 3). Die Addition erfolgt komponentenweise, die Multiplikation mit einem Skalar ebenfalls. Das Skalarprodukt zweier Vektoren ergibt eine Zahl.",
            example: "(1, 2) + (3, 4) = (4, 6); das Skalarprodukt (1, 2)·(3, 4) = 11.",
          },
          {
            heading: "Matrizen",
            body: "Eine Matrix A ist ein Schema mit m Zeilen und n Spalten, also eine m×n-Matrix. Die Multiplikation A·B ist nur definiert, wenn die Spaltenzahl von A der Zeilenzahl von B entspricht. Die Einheitsmatrix E lässt jede Matrix unverändert.",
            example: "Eine 2×3-Matrix kann man mit einer 3×2-Matrix multiplizieren – das Ergebnis ist 2×2.",
          },
          {
            heading: "Determinante und Inverse",
            body: "Die Determinante ist eine Zahl, die einer quadratischen Matrix zugeordnet wird. Ist sie ungleich null, besitzt die Matrix eine Inverse A⁻¹ und das zugehörige Gleichungssystem hat genau eine Lösung.",
            example: "det(A) = 0 bedeutet: Die Zeilen sind linear abhängig, A ist nicht invertierbar.",
          },
        ],
        takeaway: "Zeilen mal Spalten – diese Regel entscheidet über jede Matrixmultiplikation.",
      },
      {
        id: "ma-3-2",
        number: "02",
        title: "Gleichungssysteme lösen",
        lead: "Das gaußsche Eliminationsverfahren ist Standardstoff der ersten Semesterwoche.",
        sections: [
          {
            heading: "Lineare Gleichungssysteme",
            body: "Ein lineares Gleichungssystem besteht aus mehreren Gleichungen mit denselben Unbekannten. Man löst es, indem man die erweiterte Koeffizientenmatrix in Stufenform bringt und dann von unten nach oben einsetzt.",
            example: "x + y = 5 und x − y = 1 → 2x = 6, also x = 3 und y = 2.",
          },
          {
            heading: "Lösbarkeit",
            body: "Ein Gleichungssystem kann genau eine Lösung, keine Lösung oder unendlich viele Lösungen haben. Entscheidend ist der Rang der Koeffizientenmatrix im Vergleich zur erweiterten Matrix.",
            example: "0 = 1 als letzte Zeile bedeutet: Das System ist unlösbar.",
          },
          {
            heading: "Eigenwerte",
            body: "Ein Eigenvektor v einer Matrix A ist ein Vektor, der durch die Multiplikation nur gestreckt wird: A·v = λ·v. Der Faktor λ heißt Eigenwert. Man berechnet ihn über die Gleichung det(A − λE) = 0.",
            example: "Bei einer Diagonalmatrix sind die Eigenwerte genau die Diagonaleinträge.",
          },
        ],
        takeaway: "Stufenform, dann einsetzen – systematisch statt raten.",
      },
    ],
    terms: [
      {
        term: "der Vektor, -en",
        symbol: "v⃗",
        spoken: "Vektor v",
        meaning: "Eine geordnete Liste von Zahlen mit Richtung und Betrag.",
        en: "vector",
        fr: "vecteur",
      },
      {
        term: "die Matrix, Matrizen",
        symbol: "A ∈ ℝᵐˣⁿ",
        spoken: "A ist eine m-mal-n-Matrix",
        meaning: "Ein rechteckiges Zahlenschema mit m Zeilen und n Spalten.",
        en: "matrix",
        fr: "matrice",
      },
      {
        term: "die Determinante, -n",
        symbol: "det(A)",
        spoken: "Determinante von A",
        meaning: "Eine Kennzahl einer quadratischen Matrix; ist sie null, ist die Matrix nicht invertierbar.",
        en: "determinant",
        fr: "déterminant",
      },
      {
        term: "die inverse Matrix",
        symbol: "A⁻¹",
        spoken: "A hoch minus eins",
        meaning: "Die Matrix, die mit A multipliziert die Einheitsmatrix ergibt.",
        en: "inverse matrix",
        fr: "matrice inverse",
      },
      {
        term: "das lineare Gleichungssystem",
        symbol: "A·x = b",
        spoken: "A mal x gleich b",
        meaning: "Mehrere lineare Gleichungen mit denselben Unbekannten.",
        en: "system of linear equations",
        fr: "système d'équations linéaires",
      },
      {
        term: "der Koeffizient, -en",
        spoken: "Koeffizient",
        meaning: "Die Zahl, mit der eine Unbekannte in einer Gleichung multipliziert wird.",
        en: "coefficient",
        fr: "coefficient",
      },
      {
        term: "der Eigenwert, -e",
        symbol: "λ",
        spoken: "Lambda",
        meaning: "Der Streckungsfaktor, mit dem eine Matrix einen Eigenvektor multipliziert.",
        en: "eigenvalue",
        fr: "valeur propre",
      },
      {
        term: "die Dimension, -en",
        symbol: "dim",
        spoken: "Dimension",
        meaning: "Die Anzahl der unabhängigen Richtungen eines Vektorraums.",
        en: "dimension",
        fr: "dimension",
      },
      {
        term: "die Basis, Basen",
        spoken: "Basis",
        meaning: "Ein minimales System von Vektoren, das den ganzen Vektorraum aufspannt.",
        en: "basis",
        fr: "base",
      },
      {
        term: "linear unabhängig",
        spoken: "linear unabhängig",
        meaning: "Keiner der Vektoren lässt sich als Kombination der anderen schreiben.",
        en: "linearly independent",
        fr: "linéairement indépendant",
      },
      {
        term: "die Abbildung, -en",
        symbol: "f: V → W",
        spoken: "Abbildung von V nach W",
        meaning: "Eine Zuordnung zwischen zwei Vektorräumen, die die Struktur erhält.",
        en: "mapping",
        fr: "application",
      },
      {
        term: "der Rang, Ränge",
        symbol: "rang(A)",
        spoken: "Rang von A",
        meaning: "Die Anzahl der linear unabhängigen Zeilen oder Spalten einer Matrix.",
        en: "rank",
        fr: "rang",
      },
    ],
  },
  {
    id: "geometrie",
    number: "04",
    title: "Geometrie",
    lead: "Figuren, Größen und Sätze – die Mathematik, die man zeichnen kann.",
    lessons: [
      {
        id: "ma-4-1",
        number: "01",
        title: "Figuren und Größen",
        lead: "Fläche, Umfang, Volumen: drei Begriffe, die in jeder Aufgabe präzise unterschieden werden müssen.",
        sections: [
          {
            heading: "Ebene Figuren",
            body: "Ein Dreieck hat drei Seiten und drei Innenwinkel, die zusammen 180° ergeben. Ein Rechteck hat vier rechte Winkel. Der Umfang ist die Länge der Randlinie, der Flächeninhalt die Größe der eingeschlossenen Fläche.",
            example: "Rechteck mit a = 4 cm und b = 3 cm: Umfang 14 cm, Flächeninhalt 12 cm².",
          },
          {
            heading: "Körper",
            body: "Bei Körpern unterscheidet man Oberfläche und Volumen. Das Volumen wird in Kubikzentimetern (cm³) angegeben, die Oberfläche in Quadratzentimetern (cm²). Ein Würfel mit Kantenlänge a hat das Volumen a³.",
            example: "Würfel mit a = 2 cm: Volumen 8 cm³, Oberfläche 6 · 4 = 24 cm².",
          },
          {
            heading: "Winkel und Längen",
            body: "Winkel werden in Grad gemessen. Ein rechter Winkel hat 90°, ein gestreckter 180°, ein Vollwinkel 360°. Der Satz des Pythagoras gilt nur in rechtwinkligen Dreiecken: a² + b² = c², wobei c die Hypotenuse ist.",
            example: "a = 3, b = 4 → c = √(9 + 16) = 5.",
          },
        ],
        takeaway: "Einheit, Formel, Ergebnis – in dieser Reihenfolge, sonst gibt es Punktabzug.",
      },
      {
        id: "ma-4-2",
        number: "02",
        title: "Sätze anwenden",
        lead: "Ein Satz besteht aus Voraussetzung und Behauptung. Wer beides trennt, findet den Ansatz.",
        sections: [
          {
            heading: "Voraussetzung und Behauptung",
            body: "Im Satz «Ist ein Dreieck rechtwinklig, so gilt a² + b² = c²» ist «rechtwinklig» die Voraussetzung und die Gleichung die Behauptung. In der Klausur musst du zuerst prüfen, ob die Voraussetzung erfüllt ist.",
            example: "Ohne rechten Winkel darf Pythagoras nicht angewendet werden.",
          },
          {
            heading: "Ähnlichkeit und Kongruenz",
            body: "Zwei Figuren sind kongruent, wenn sie deckungsgleich sind – gleiche Form und gleiche Größe. Sie sind ähnlich, wenn sie dieselbe Form, aber unterschiedliche Größe haben. Bei ähnlichen Figuren sind die Verhältnisse der Seiten gleich.",
            example: "Ein Plan im Maßstab 1:100 ist ähnlich zum Gebäude, aber nicht kongruent.",
          },
          {
            heading: "Koordinaten und Abstände",
            body: "Im kartesischen Koordinatensystem hat jeder Punkt zwei Koordinaten (x, y). Der Abstand zweier Punkte ergibt sich aus dem Satz des Pythagoras: d = √((x₂−x₁)² + (y₂−y₁)²).",
            example: "Abstand von (1, 2) zu (4, 6): √(9 + 16) = 5.",
          },
        ],
        takeaway: "Prüfe immer erst die Voraussetzung eines Satzes – sonst ist die Rechnung wertlos.",
      },
    ],
    terms: [
      {
        term: "der Winkel, -",
        symbol: "α, β, γ",
        spoken: "Alpha, Beta, Gamma",
        meaning: "Die Öffnung zwischen zwei Strahlen, gemessen in Grad.",
        en: "angle",
        fr: "angle",
      },
      {
        term: "die Strecke, -n",
        symbol: "AB",
        spoken: "Strecke A B",
        meaning: "Die geradlinige Verbindung zwischen zwei Punkten.",
        en: "line segment",
        fr: "segment",
      },
      {
        term: "die Gerade, -n",
        symbol: "g",
        spoken: "Gerade g",
        meaning: "Eine unendlich lange, gerade Linie ohne Anfang und Ende.",
        en: "line",
        fr: "droite",
      },
      {
        term: "der Flächeninhalt, -e",
        symbol: "A",
        spoken: "A",
        meaning: "Die Größe der von einer Figur eingeschlossenen Fläche.",
        en: "area",
        fr: "aire",
      },
      {
        term: "der Umfang, Umfänge",
        symbol: "U",
        spoken: "U",
        meaning: "Die Länge der Randlinie einer Figur.",
        en: "perimeter",
        fr: "périmètre",
      },
      {
        term: "das Volumen, Volumina",
        symbol: "V",
        spoken: "V",
        meaning: "Der räumliche Inhalt eines Körpers.",
        en: "volume",
        fr: "volume",
      },
      {
        term: "die Oberfläche, -n",
        symbol: "O",
        spoken: "O",
        meaning: "Die gesamte äußere Fläche eines Körpers.",
        en: "surface area",
        fr: "surface",
      },
      {
        term: "die Hypotenuse, -n",
        symbol: "c",
        spoken: "Hypotenuse",
        meaning: "Die längste Seite im rechtwinkligen Dreieck, gegenüber dem rechten Winkel.",
        en: "hypotenuse",
        fr: "hypoténuse",
      },
      {
        term: "die Kongruenz",
        spoken: "Kongruenz",
        meaning: "Deckungsgleichheit: gleiche Form und gleiche Größe.",
        en: "congruence",
        fr: "congruence",
      },
      {
        term: "die Ähnlichkeit",
        spoken: "Ähnlichkeit",
        meaning: "Gleiche Form bei unterschiedlicher Größe.",
        en: "similarity",
        fr: "similitude",
      },
      {
        term: "der Schwerpunkt, -e",
        symbol: "S",
        spoken: "S",
        meaning: "Der Punkt, in dem man sich die Masse einer Figur vereinigt denken kann.",
        en: "centroid",
        fr: "centre de gravité",
      },
      {
        term: "das Koordinatensystem, -e",
        spoken: "Koordinatensystem",
        meaning: "Ein Bezugssystem aus Achsen, mit dem man Punkte durch Zahlen beschreibt.",
        en: "coordinate system",
        fr: "système de coordonnées",
      },
    ],
  },
  {
    id: "statistik",
    number: "05",
    title: "Statistik und Wahrscheinlichkeit",
    lead: "Daten beschreiben, Unsicherheit berechnen – Pflichtstoff in Sozial-, Natur- und Wirtschaftswissenschaften.",
    lessons: [
      {
        id: "ma-5-1",
        number: "01",
        title: "Daten beschreiben",
        lead: "Mittelwert, Median und Standardabweichung erzählen drei verschiedene Geschichten über dieselben Daten.",
        sections: [
          {
            heading: "Lageparameter",
            body: "Der Mittelwert (arithmetisches Mittel) ist die Summe aller Werte geteilt durch ihre Anzahl. Der Median ist der mittlere Wert einer sortierten Reihe. Bei Ausreißern ist der Median robuster als der Mittelwert.",
            example: "1, 2, 3, 4, 100: Mittelwert 22, Median 3.",
          },
          {
            heading: "Streuung",
            body: "Die Varianz misst die mittlere quadratische Abweichung vom Mittelwert. Die Standardabweichung ist ihre Wurzel und hat dieselbe Einheit wie die Daten. Eine kleine Standardabweichung bedeutet: Die Werte liegen nah am Mittelwert.",
            example: "«Die Standardabweichung beträgt 2,3 Punkte.»",
          },
          {
            heading: "Häufigkeiten",
            body: "Die absolute Häufigkeit gibt an, wie oft ein Wert vorkommt. Die relative Häufigkeit ist der Anteil an der Gesamtzahl, oft in Prozent. Ein Histogramm stellt die Verteilung grafisch dar.",
            example: "20 von 200 Befragten → relative Häufigkeit 0,1 oder 10 %.",
          },
        ],
        takeaway: "Ohne Streuungsmaß ist ein Mittelwert nur die halbe Wahrheit.",
      },
      {
        id: "ma-5-2",
        number: "02",
        title: "Wahrscheinlichkeit ausdrücken",
        lead: "Von «unmöglich» bis «sicher»: Wahrscheinlichkeiten bewegen sich immer zwischen 0 und 1.",
        sections: [
          {
            heading: "Grundbegriffe",
            body: "Ein Zufallsexperiment hat mehrere mögliche Ergebnisse; die Menge aller Ergebnisse heißt Ergebnismenge. Ein Ereignis ist eine Teilmenge davon. Die Wahrscheinlichkeit P(A) liegt zwischen 0 und 1.",
            example: "Beim Würfel ist P(gerade Zahl) = 3/6 = 0,5.",
          },
          {
            heading: "Bedingte Wahrscheinlichkeit",
            body: "P(A|B) ist die Wahrscheinlichkeit von A unter der Bedingung, dass B eingetreten ist. Sie ist nicht dasselbe wie P(B|A) – dieser Unterschied steckt hinter vielen Fehlinterpretationen von Tests.",
            example: "P(krank | positiv) ist nicht automatisch gleich P(positiv | krank).",
          },
          {
            heading: "Verteilungen",
            body: "Eine Zufallsvariable ordnet jedem Ergebnis eine Zahl zu. Die Normalverteilung ist glockenförmig und symmetrisch um den Mittelwert; viele natürliche Größen folgen ihr näherungsweise.",
            example: "Rund 68 % der Werte liegen innerhalb einer Standardabweichung um den Mittelwert.",
          },
        ],
        takeaway: "Wahrscheinlichkeit ist kein Gefühl, sondern ein Verhältnis zwischen 0 und 1.",
      },
    ],
    terms: [
      {
        term: "die Stichprobe, -n",
        spoken: "Stichprobe",
        meaning: "Eine Teilmenge aus einer größeren Grundgesamtheit, die untersucht wird.",
        en: "sample",
        fr: "échantillon",
      },
      {
        term: "die Grundgesamtheit, -en",
        spoken: "Grundgesamtheit",
        meaning: "Alle Personen oder Objekte, über die eine Aussage gemacht werden soll.",
        en: "population",
        fr: "population",
      },
      {
        term: "der Mittelwert, -e",
        symbol: "x̄",
        spoken: "x quer",
        meaning: "Die Summe aller Werte geteilt durch ihre Anzahl.",
        en: "mean",
        fr: "moyenne",
      },
      {
        term: "der Median, -e",
        symbol: "x̃",
        spoken: "Median",
        meaning: "Der mittlere Wert einer der Größe nach sortierten Datenreihe.",
        en: "median",
        fr: "médiane",
      },
      {
        term: "die Standardabweichung, -en",
        symbol: "σ",
        spoken: "Sigma",
        meaning: "Die mittlere Abweichung der Werte vom Mittelwert.",
        en: "standard deviation",
        fr: "écart type",
      },
      {
        term: "die Varianz, -en",
        symbol: "σ²",
        spoken: "Sigma hoch zwei",
        meaning: "Das Quadrat der Standardabweichung.",
        en: "variance",
        fr: "variance",
      },
      {
        term: "die Häufigkeit, -en",
        symbol: "h",
        spoken: "Häufigkeit",
        meaning: "Wie oft ein Wert in den Daten vorkommt (absolut oder relativ).",
        en: "frequency",
        fr: "fréquence",
      },
      {
        term: "die Wahrscheinlichkeit, -en",
        symbol: "P(A)",
        spoken: "P von A",
        meaning: "Eine Zahl zwischen 0 und 1, die angibt, wie wahrscheinlich ein Ereignis ist.",
        en: "probability",
        fr: "probabilité",
      },
      {
        term: "das Ereignis, -se",
        symbol: "A ⊆ Ω",
        spoken: "Ereignis A",
        meaning: "Eine Teilmenge aller möglichen Ergebnisse eines Zufallsexperiments.",
        en: "event",
        fr: "événement",
      },
      {
        term: "die Zufallsvariable, -n",
        symbol: "X",
        spoken: "X",
        meaning: "Eine Variable, deren Wert vom Ausgang eines Zufallsexperiments abhängt.",
        en: "random variable",
        fr: "variable aléatoire",
      },
      {
        term: "die Normalverteilung, -en",
        symbol: "N(μ, σ²)",
        spoken: "Normalverteilung",
        meaning: "Die glockenförmige, symmetrische Wahrscheinlichkeitsverteilung.",
        en: "normal distribution",
        fr: "loi normale",
      },
      {
        term: "die Korrelation, -en",
        symbol: "r",
        spoken: "Korrelation",
        meaning: "Ein statistischer Zusammenhang zwischen zwei Merkmalen – ohne Beweis der Ursache.",
        en: "correlation",
        fr: "corrélation",
      },
    ],
  },
  {
    id: "beweise",
    number: "06",
    title: "Aufgaben und Beweise",
    lead: "Die Formulierungen, mit denen Übungsblätter und Klausuren arbeiten – und wie man darauf antwortet.",
    lessons: [
      {
        id: "ma-6-1",
        number: "01",
        title: "Aufgaben verstehen",
        lead: "«Zeigen Sie», «berechnen Sie», «begründen Sie»: Jedes Verb verlangt eine andere Antwortform.",
        sections: [
          {
            heading: "Operatoren",
            body: "«Berechnen Sie» verlangt einen Rechenweg mit Ergebnis. «Bestimmen Sie» erlaubt auch ein systematisches Probieren. «Zeigen Sie» verlangt einen Beweis. «Begründen Sie» verlangt eine Erklärung in Worten, nicht nur eine Zahl.",
            example: "«Bestimmen Sie alle x mit f(x) = 0» → Rechenweg und Lösungsmenge angeben.",
          },
          {
            heading: "Textaufgaben übersetzen",
            body: "Übersetze die Aufgabe zuerst in Gleichungen: Unbekannte benennen, Beziehungen als Gleichungen schreiben, Einheiten prüfen. Erst danach rechnen. Ein Satz wie «verringert sich um 20 %» bedeutet «mal 0,8».",
            example: "«Ein Preis sinkt um 20 % auf 64 €» → 0,8 · p = 64 → p = 80 €.",
          },
          {
            heading: "Antworten formulieren",
            body: "Eine vollständige Antwort nennt Ansatz, Rechenweg, Ergebnis und Einheit. Bei «begründen Sie» gehört ein Satz dazu, der das Ergebnis inhaltlich erklärt. Ergebnisse ohne Begründung verlieren Punkte.",
            example: "«Der Graph ist streng monoton steigend, weil f′(x) = 2x + 1 für alle x > 0 positiv ist.»",
          },
        ],
        takeaway: "Das Verb in der Aufgabe sagt dir, was in der Lösung stehen muss.",
      },
      {
        id: "ma-6-2",
        number: "02",
        title: "Beweise formulieren",
        lead: "Ein Beweis ist ein lückenloser Weg von der Voraussetzung zur Behauptung.",
        sections: [
          {
            heading: "Direkter Beweis und Widerspruch",
            body: "Im direkten Beweis folgert man Schritt für Schritt aus den Voraussetzungen. Im Widerspruchsbeweis nimmt man das Gegenteil der Behauptung an und zeigt, dass daraus ein Widerspruch folgt.",
            example: "«Angenommen, √2 sei rational …» → Widerspruch zur Eindeutigkeit der Primfaktorzerlegung.",
          },
          {
            heading: "Vollständige Induktion",
            body: "Die Induktion beweist Aussagen für alle natürlichen Zahlen. Man zeigt den Induktionsanfang für n = 1 und den Induktionsschritt: Gilt die Aussage für n, dann auch für n + 1.",
            example: "Summe 1 + 2 + … + n = n(n+1)/2 – Anfang n = 1, Schritt von n auf n + 1.",
          },
          {
            heading: "Gegenbeispiel und Äquivalenz",
            body: "Eine Allaussage widerlegt man mit einem einzigen Gegenbeispiel. Eine Äquivalenz «A ⇔ B» verlangt zwei Richtungen: A ⇒ B und B ⇒ A. Beide müssen bewiesen werden.",
            example: "Behauptung «Alle Primzahlen sind ungerade» wird durch 2 widerlegt.",
          },
        ],
        takeaway: "Ein Beweis ist fertig, wenn jeder Schritt begründet ist – nicht wenn das Ergebnis stimmt.",
      },
    ],
    terms: [
      {
        term: "die Voraussetzung, -en",
        spoken: "Voraussetzung",
        meaning: "Was in einem Satz als gegeben angenommen wird.",
        en: "assumption",
        fr: "hypothèse",
      },
      {
        term: "die Behauptung, -en",
        spoken: "Behauptung",
        meaning: "Was bewiesen werden soll.",
        en: "claim",
        fr: "affirmation",
      },
      {
        term: "der Beweis, -e",
        spoken: "Beweis",
        meaning: "Eine lückenlose logische Herleitung der Behauptung aus den Voraussetzungen.",
        en: "proof",
        fr: "preuve",
      },
      {
        term: "der Widerspruch, Widersprüche",
        spoken: "Widerspruch",
        meaning: "Eine Aussage, die zugleich wahr und falsch wäre.",
        en: "contradiction",
        fr: "contradiction",
      },
      {
        term: "die vollständige Induktion",
        spoken: "vollständige Induktion",
        meaning: "Beweisverfahren für Aussagen über alle natürlichen Zahlen.",
        en: "mathematical induction",
        fr: "récurrence",
      },
      {
        term: "das Gegenbeispiel, -e",
        spoken: "Gegenbeispiel",
        meaning: "Ein einzelner Fall, der eine Allaussage widerlegt.",
        en: "counterexample",
        fr: "contre-exemple",
      },
      {
        term: "die Folgerung, -en",
        symbol: "⇒",
        spoken: "daraus folgt",
        meaning: "Eine Aussage, die sich logisch aus einer anderen ergibt.",
        en: "implication",
        fr: "implication",
      },
      {
        term: "die Äquivalenz, -en",
        symbol: "⇔",
        spoken: "genau dann, wenn",
        meaning: "Zwei Aussagen bedingen sich gegenseitig.",
        en: "equivalence",
        fr: "équivalence",
      },
      {
        term: "die Schranke, -n",
        spoken: "Schranke",
        meaning: "Ein Wert, den eine Folge oder Menge nicht überschreitet.",
        en: "bound",
        fr: "borne",
      },
      {
        term: "der Grenzfall, -fälle",
        spoken: "Grenzfall",
        meaning: "Ein Sonderfall am Rand der Definitionsmenge, der oft gesondert geprüft wird.",
        en: "edge case",
        fr: "cas limite",
      },
      {
        term: "ohne Beschränkung der Allgemeinheit",
        symbol: "o. B. d. A.",
        spoken: "o. B. d. A.",
        meaning: "Der Beweis gilt für einen Spezialfall, der alle anderen Fälle mit abdeckt.",
        en: "without loss of generality",
        fr: "sans perte de généralité",
      },
      {
        term: "zu zeigen",
        symbol: "z. z.",
        spoken: "zu zeigen",
        meaning: "Markiert in einer Rechnung die noch offene Behauptung.",
        en: "to be shown",
        fr: "à démontrer",
      },
    ],
  },
];

export const mathTermCount = mathChapters.reduce(
  (total, chapter) => total + chapter.terms.length,
  0,
);

export const mathLessonCount = mathChapters.reduce(
  (total, chapter) => total + chapter.lessons.length,
  0,
);

/** Alle Begriffe flach – Grundlage für den Trainer. */
export const mathTerms = mathChapters.flatMap((chapter) =>
  chapter.terms.map((term, index) => ({
    ...term,
    id: `${chapter.id}-${index}`,
    chapter: chapter.title,
  })),
);
