// The companies list split into "pages" by where each company is in the work: to review, qualified, approved
// for contact, already contacted, archived. A view is only a preset of the status (and archive) filters;
// every other filter stays as the person set it, so "weak sites" + "qualified" works together.

import type { Filters } from "./types.ts";

export interface View {
    id: string;
    label: string;
    /** the statuses shown; null = no status filter */
    statuses: string[] | null;
    archived?: boolean;
}

export const VIEWS: View[] = [
    { id: "all", label: "الكل", statuses: null },
    { id: "review", label: "بحاجة لمراجعة", statuses: ["new", "review"] },
    { id: "qualified", label: "مؤهلة", statuses: ["qualified"] },
    { id: "approved", label: "معتمدة للتواصل", statuses: ["approved"] },
    { id: "contacted", label: "تم التواصل", statuses: ["contacted", "replied", "interested"] },
    { id: "archived", label: "المؤرشفة", statuses: null, archived: true },
];

/** the filters with this view applied: the status and archive filters are replaced, everything else is kept */
export function applyView(f: Filters, id: string): Filters {
    const view = VIEWS.find((v) => v.id === id);
    const { status: _status, showArchived: _archive, ...rest } = f;
    void _status;
    void _archive;
    if (!view || (view.statuses === null && !view.archived)) return rest;
    if (view.archived) return { ...rest, showArchived: "only" };
    return { ...rest, status: { inc: [...(view.statuses as string[])], exc: [] } };
}

/** which view the filters are showing; "" when the status filter is something else (set by hand or saved) */
export function viewOf(f: Filters): string {
    if (f.showArchived === "all") return "";
    const inc = f.status?.inc ?? [];
    const exc = f.status?.exc ?? [];
    if (f.showArchived === "only") return inc.length || exc.length ? "" : "archived";
    if (exc.length) return "";
    if (!inc.length) return "all";
    const set = new Set(inc);
    const match = VIEWS.find((v) => v.statuses && v.statuses.length === set.size && v.statuses.every((s) => set.has(s)));
    return match?.id ?? "";
}

/** the next step for a company in this view: the status the "move on" button sets */
export const NEXT_STEP: Record<string, { status: string; label: string }> = {
    review: { status: "qualified", label: "تأهيل" },
    qualified: { status: "approved", label: "اعتماد للتواصل" },
};
