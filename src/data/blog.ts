import { marked } from "marked";

/**
 * Blog posts live in content/blog/<slug>.md:
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
    title: string;
    description: string;
    date: string;
    category: string;
    tags: string[];
    readingMinutes: number;
    html: string;
}

const files = import.meta.glob("/content/blog/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
}) as Record<string, string>;

function parse(file: string, raw: string): BlogPost {
    const slug = file.split("/").pop()!.replace(/\.md$/, "");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw new Error(`blog: ${slug}.md has no front matter`);

    const meta: Record<string, string> = {};
    for (const line of match[1].split(/\r?\n/)) {
        const i = line.indexOf(":");
        if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    for (const key of ["title", "description", "date", "category"]) {
        if (!meta[key]) throw new Error(`blog: ${slug}.md is missing "${key}"`);
    }

    const body = match[2];
    const words = body.split(/\s+/).filter(Boolean).length;

    return {
        slug,
        title: meta.title,
        description: meta.description,
        date: meta.date,
        category: meta.category,
        tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
        readingMinutes: Math.max(1, Math.round(words / 180)),
        // code reads left-to-right; set as attributes because the RTL style
        // plugin mirrors any `direction` written in CSS
        html: marked
            .parse(body, { async: false })
            .replace(/<pre>/g, '<pre dir="ltr">')
            .replace(/<code(?=[ >])/g, '<code dir="ltr"'),
    };
}

export const posts: BlogPost[] = Object.entries(files)
    .map(([file, raw]) => parse(file, raw))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

export const findPost = (slug: string) => posts.find((p) => p.slug === slug);

// Latin digits, matching the rest of the site
const dateFormat = new Intl.DateTimeFormat("ar-u-nu-latn", { dateStyle: "long" });
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
