/**
 * Arabic is the default and lives at the root (/, /blog, ...).
 * English and Turkish get a prefix (/en, /en/blog, /tr/start-project, ...).
 * Pure functions only: shared by the browser, the prerender and the sitemap.
 */
export const LOCALES = ["ar", "en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";

export const LOCALE_META: Record<
    Locale,
    { dir: "rtl" | "ltr"; name: string; short: string; og: string; dateLocale: string }
> = {
    ar: { dir: "rtl", name: "العربية", short: "AR", og: "ar_AR", dateLocale: "ar-u-nu-latn" },
    en: { dir: "ltr", name: "English", short: "EN", og: "en_US", dateLocale: "en-GB" },
    tr: { dir: "ltr", name: "Türkçe", short: "TR", og: "tr_TR", dateLocale: "tr-TR" },
};

const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s);

/** "/en/blog/x" -> { locale: "en", path: "/blog/x" }; "/blog" -> { locale: "ar", path: "/blog" } */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
    const clean = pathname.replace(/\/+$/, "") || "/";
    const first = clean.split("/")[1] ?? "";
    if (isLocale(first) && first !== DEFAULT_LOCALE) {
        return { locale: first, path: clean.slice(first.length + 1) || "/" };
    }
    return { locale: DEFAULT_LOCALE, path: clean };
}

/** ("en", "/blog") -> "/en/blog"; ("en", "/") -> "/en"; ("ar", "/blog") -> "/blog"; keeps "#hash" */
export function localizePath(locale: Locale, path: string): string {
    const [pathname, hash] = path.split("#");
    const base = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
    let out = pathname === "/" || pathname === "" ? base || "/" : base + pathname;
    if (hash !== undefined) out = (out === "/" ? "/" : out) + "#" + hash;
    return out;
}
