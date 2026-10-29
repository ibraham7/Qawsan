import { marked } from "marked";

import { LOCALES, LOCALE_META } from "../i18n/locales";
import type { Locale } from "../i18n/locales";

/**
 * Blog posts are Markdown files:
 *   content/blog/<slug>.md      Arabic (the default language)
 *   content/blog/en/<slug>.md   English
 *   content/blog/tr/<slug>.md   Turkish
 * A translation keeps the same slug, so /blog/x, /en/blog/x and /tr/blog/x are one article.
 *
 * ---
 * title: ...
 * description: ...        (meta description and card summary)
 * date: 2026-10-29
 * category: ...
 * tags: a, b, c
 * ---
 * Markdown body (start at ## headings; the title is the page's h1)
 */
export interface BlogPost {
    slug: string;
    locale: Locale;
    title: string;
    description: string;
    date: string;
    category: string;
    tags: string[];
    readingMinutes: number;
    html: string;
}

const files = import.meta.glob("/content/blog/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
}) as Record<string, string>;

function parse(file: string, raw: string): BlogPost {
    const parts = file.replace("/content/blog/", "").split("/");
    const slug = parts.pop()!.replace(/\.md$/, "");
    const locale = (parts[0] ?? "ar") as Locale;
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw new Error(`blog: ${file} has no front matter`);

    const meta: Record<string, string> = {};
    for (const line of match[1].split(/\r?\n/)) {
        const i = line.indexOf(":");
        if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    for (const key of ["title", "description", "date", "category"]) {
        if (!meta[key]) throw new Error(`blog: ${file} is missing "${key}"`);
    }

    const body = match[2];
    const words = body.split(/\s+/).filter(Boolean).length;

    return {
        slug,
        locale,
        title: meta.title,
        description: meta.description,
        date: meta.date,
        category: meta.category,
        tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
        // Latin text reads faster per word than Arabic
        readingMinutes: Math.max(1, Math.round(words / (locale === "ar" ? 180 : 220))),
        // code reads left-to-right; set as attributes because the RTL style
        // plugin mirrors any `direction` written in CSS
        html: marked
            .parse(body, { async: false })
            .replace(/<pre>/g, '<pre dir="ltr">')
            .replace(/<code(?=[ >])/g, '<code dir="ltr"'),
    };
}

const all = Object.entries(files).map(([file, raw]) => parse(file, raw));

export const postsByLocale = Object.fromEntries(
    LOCALES.map((l) => [
        l,
        all
            .filter((p) => p.locale === l)
            .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)),
    ])
) as Record<Locale, BlogPost[]>;

export const findPost = (locale: Locale, slug: string) =>
    postsByLocale[locale].find((p) => p.slug === slug);

/** languages an article exists in (for hreflang and the language switcher) */
export const translationsOf = (slug: string) =>
    LOCALES.filter((l) => postsByLocale[l].some((p) => p.slug === slug));

const formats = Object.fromEntries(
    LOCALES.map((l) => [l, new Intl.DateTimeFormat(LOCALE_META[l].dateLocale, { dateStyle: "long" })])
) as Record<Locale, Intl.DateTimeFormat>;

export const formatDate = (iso: string, locale: Locale) => formats[locale].format(new Date(iso));
