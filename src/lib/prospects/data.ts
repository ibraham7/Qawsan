// Where search results come from: Supabase in production, or a generated demo set
// (development builds only, with ?demo in the URL) for trying the filters locally.

import { supabase } from "../supabase";
import { applyTo, compile, matches, normDomain } from "./query.ts";
import type { Compiled, Context, Filterable } from "./query.ts";
import type { CompanyRow, Filters, NamedItem, PersonRow, SavedSearch, Tab } from "./types.ts";

export const T = {
    companies: "qawsan_companies",
    people: "qawsan_people",
    lists: "qawsan_lists",
    listItems: "qawsan_list_items",
    sequences: "qawsan_sequences",
    saved: "qawsan_saved_searches",
} as const;

export type Sort = "newest" | "score" | "name";

export interface SearchResult<R> {
    rows: R[];
    count: number;
    warnings: string[];
}

export interface Meta {
    lists: (NamedItem & { kind: Tab })[];
    sequences: NamedItem[];
    owners: string[];
}

export interface Backend {
    demo: boolean;
    search(tab: Tab, f: Filters, page: number, size: number, sort: Sort): Promise<SearchResult<PersonRow | CompanyRow>>;
    meta(): Promise<Meta>;
    savedList(): Promise<SavedSearch[]>;
    savedCreate(name: string, kind: SavedSearch["kind"], filters: Filters): Promise<void>;
    savedRemove(id: string): Promise<void>;
}

/* ------------------------------------------------------------------ */

function fail(error: { message: string; code?: string } | null): never | void {
    if (!error) return;
    // 42P01: the migration has not been applied yet
    if (error.code === "42P01" || /does not exist|schema cache/i.test(error.message)) {
        throw new Error("جداول العملاء المحتملين غير موجودة بعد في قاعدة البيانات. طبّق ملف الترحيل qawsan_prospects أولًا.");
    }
    throw new Error(error.message);
}

async function context(f: Filters): Promise<Context> {
    const ctx: Context = { now: new Date() };
    if (f.lists && (f.lists.inc.length || f.lists.exc.length)) {
        const ids = async (lists: string[]) => {
            if (!lists.length) return [];
            const { data, error } = await supabase.from(T.listItems).select("item_id").in("list_id", lists).limit(10000);
            fail(error);
            return (data ?? []).map((r) => r.item_id as string);
        };
        ctx.listIds = { inc: f.lists.inc.length ? await ids(f.lists.inc) : null, exc: await ids(f.lists.exc) };
    }
    if (f.lookalike?.trim()) {
        const { data, error } = await supabase.from(T.companies).select("*").ilike("domain", normDomain(f.lookalike)).limit(1).maybeSingle();
        fail(error);
        ctx.lookalike = (data as CompanyRow | null) ?? null;
    }
    return ctx;
}

export const supabaseBackend: Backend = {
    demo: false,
    async search(tab, f, page, size, sort) {
        const c: Compiled = compile(tab, f, await context(f));
        if (c.empty) return { rows: [], count: 0, warnings: c.warnings };
        const select = tab === "people" ? `*, company:${T.companies}${c.needsCompany ? "!inner" : ""}(*)` : "*";
        let q = supabase.from(tab === "people" ? T.people : T.companies).select(select, { count: "exact" });
        q = applyTo(q as unknown as Filterable<typeof q>, c.conds) as typeof q;
        if (sort === "score") q = q.order("lead_score", { ascending: false, nullsFirst: false });
        else if (sort === "name") q = q.order(tab === "people" ? "full_name" : "name", { ascending: true });
        else q = q.order("created_at", { ascending: false });
        const { data, error, count } = await q.range(page * size, page * size + size - 1);
        fail(error);
        return { rows: (data ?? []) as unknown as (PersonRow | CompanyRow)[], count: count ?? 0, warnings: c.warnings };
    },
    async meta() {
        const [lists, seqs, ownersP, ownersC] = await Promise.all([
            supabase.from(T.lists).select("id,name,kind").order("name"),
            supabase.from(T.sequences).select("id,name").order("name"),
            supabase.from(T.people).select("owner").neq("owner", "").limit(2000),
            supabase.from(T.companies).select("owner").neq("owner", "").limit(2000),
        ]);
        fail(lists.error);
        fail(seqs.error);
        const owners = [...new Set([...(ownersP.data ?? []), ...(ownersC.data ?? [])].map((r) => r.owner as string))].sort();
        return { lists: (lists.data ?? []) as Meta["lists"], sequences: (seqs.data ?? []) as NamedItem[], owners };
    },
    async savedList() {
        const { data, error } = await supabase.from(T.saved).select("id,name,kind,filters,created_at").order("created_at", { ascending: false });
        fail(error);
        return (data ?? []) as SavedSearch[];
    },
    async savedCreate(name, kind, filters) {
        const { error } = await supabase.from(T.saved).insert({ name, kind, filters });
        fail(error);
    },
    async savedRemove(id) {
        const { error } = await supabase.from(T.saved).delete().eq("id", id);
        fail(error);
    },
};

/* ------------------------------------------------------------------ */
/* demo (development only)                                              */

export function demoBackend(data: { companies: CompanyRow[]; people: PersonRow[]; meta: Meta }): Backend {
    let saved: SavedSearch[] = [];
    try {
        saved = JSON.parse(localStorage.getItem("qawsan-demo-saved") ?? "[]");
    } catch {
        /* storage unavailable */
    }
    const persist = () => {
        try {
            localStorage.setItem("qawsan-demo-saved", JSON.stringify(saved));
        } catch {
            /* storage unavailable */
        }
    };
    return {
        demo: true,
        async search(tab, f, page, size, sort) {
            const ctx: Context = { now: new Date() };
            if (f.lookalike?.trim()) ctx.lookalike = data.companies.find((c) => c.domain === normDomain(f.lookalike!)) ?? null;
            if (f.lists) ctx.listIds = { inc: f.lists.inc.length ? [] : null, exc: [] }; // demo lists are empty
            const c = compile(tab, f, ctx);
            const src: (PersonRow | CompanyRow)[] = tab === "people" ? data.people : data.companies;
            let rows = src.filter((r) => matches(c, r as unknown as Record<string, unknown>));
            const name = (r: PersonRow | CompanyRow) => ("full_name" in r ? r.full_name : r.name);
            rows = [...rows].sort((a, b) =>
                sort === "score" ? (b.lead_score ?? -1) - (a.lead_score ?? -1) : sort === "name" ? name(a).localeCompare(name(b)) : b.created_at.localeCompare(a.created_at)
            );
            await new Promise((r) => setTimeout(r, 120));
            return { rows: rows.slice(page * size, page * size + size), count: rows.length, warnings: c.warnings };
        },
        async meta() {
            return data.meta;
        },
        async savedList() {
            return saved;
        },
        async savedCreate(name, kind, filters) {
            saved = [{ id: crypto.randomUUID(), name, kind, filters, created_at: new Date().toISOString() }, ...saved];
            persist();
        },
        async savedRemove(id) {
            saved = saved.filter((s) => s.id !== id);
            persist();
        },
    };
}
