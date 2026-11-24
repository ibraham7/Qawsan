// The quick search box above the companies table: a shortcut to the "company name or domain" filter
// (contains, case-insensitive). It owns the filter only while it holds ONE term; a list loaded from a CSV
// is left alone and shown as "a list of N names".
import type { Filters } from "./types";

/** the single term typed in the box, "" when there is none or when a list is loaded */
export function quickTerm(f: Filters): string {
    const inc = f.company?.inc ?? [];
    return inc.length === 1 ? inc[0] : "";
}

/** how many names a loaded list holds (0 or 1 means no list) */
export function quickListSize(f: Filters): number {
    const n = f.company?.inc.length ?? 0;
    return n > 1 ? n : 0;
}

/** the filters with the box's text applied; an empty text removes the name filter (excluded names are kept) */
export function withQuickTerm(f: Filters, text: string): Filters {
    const term = text.trim();
    const exc = f.company?.exc ?? [];
    const { company: _old, ...rest } = f;
    void _old;
    if (!term && !exc.length) return rest;
    return { ...rest, company: { inc: term ? [term] : [], exc } };
}
