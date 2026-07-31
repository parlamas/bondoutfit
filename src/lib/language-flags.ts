// src/lib/language-flags.ts
// Maps each of the 40 language codes to an ISO 3166-1 alpha-2 country
// code, used to fetch a real flag image from flagcdn.com (a free,
// widely-used flag image CDN — no API key, no hosting our own assets).
// A native <select><option> can't render images at all, so this is
// only usable via a custom-built dropdown, not a plain <select>.

export const LANGUAGE_FLAG_CODE: Record<string, string> = {
  en: "gb",
  el: "gr",
  es: "es",
  pt: "pt",
  it: "it",
  fr: "fr",
  de: "de",
  nl: "nl",
  da: "dk",
  no: "no",
  sv: "se",
  fi: "fi",
  is: "is",
  et: "ee",
  lv: "lv",
  lt: "lt",
  pl: "pl",
  cs: "cz",
  sk: "sk",
  hu: "hu",
  sl: "si",
  ro: "ro",
  sr: "rs",
  hr: "hr",
  bg: "bg",
  sq: "al",
  uk: "ua",
  ru: "ru",
  ka: "ge",
  tr: "tr",
  ja: "jp",
  ko: "kr",
  zh: "cn",
  hi: "in",
  ms: "my",
  id: "id",
  tl: "ph",
  he: "il",
  ar: "sa",
  fa: "ir",
};

/** flagcdn.com serves flag PNGs at fixed widths (20/40/80/160px etc.). */
export function flagUrl(languageCode: string, width: 20 | 40 | 80 | 160 = 40): string {
  const cc = LANGUAGE_FLAG_CODE[languageCode] ?? "un"; // "un" = UN flag fallback icon on flagcdn
  return `https://flagcdn.com/w${width}/${cc}.png`;
}
