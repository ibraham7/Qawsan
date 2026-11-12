// Where search results come from: Supabase in production, or a generated demo set
// (development builds only, with ?demo in the URL) for trying the filters locally.

import { phoneKind } from "../discovery/places";
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
    suppressions: "qawsan_suppressions",
} as const;

export interface NewCompany {
    name: string;
    phone: string;
    email: string;
    website: string;
    country: string;
    city: string;
    notes: string;
}

export interface Suppression {
    id: string;
    value: string;
    kind: "phone" | "email";
    reason: string;
    note: string;
    created_at: string;
}

/** the form a phone number or email takes in the do-not-contact list */
export function suppressionKey(raw: string): { value: string; kind: "phone" | "email" } | null {
    const v = raw.trim();
    if (/^[^@\s]+@[^@\s]+\.[a-z]{2,24}$/i.test(v)) return { value: v.toLowerCase(), kind: "email" };
    const digits = v.replace(/\D/g, "").replace(/^00/, "");
    if (digits.length >= 8 && digits.length <= 15) return { value: digits, kind: "phone" };
    return null;
}

function companyRow(c: NewCompany) {
    const website = c.website.trim() && !/^https?:\/\//i.test(c.website.trim()) ? `https://${c.website.trim()}` : c.website.trim();
    return {
        name: c.name.trim(),
        phone: c.phone.trim(),
        phone_kind: phoneKind(c.phone),
        emails: c.email.trim() ? [c.email.trim().toLowerCase()] : [],
        website,
        domain: normDomain(website),
        hq_country: c.country.trim(),
        hq_city: c.city.trim(),
        notes: c.notes.trim(),
        status: "review",
        source: "manual",
    };
}

export type Sort = "newest" | "score" | "name";

export interface SearchResult<R> {
    rows: R[];
    count: number;
    warnings: string[];
}

export interface Meta {
    lists: (NamedItem & { kind: Tab })[];
    /** recent Google searches, newest first */
    searches: NamedItem[];
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
    setStatus(ids: string[], status: string): Promise<void>;
    addCompany(c: NewCompany): Promise<void>;
    removeCompanies(ids: string[]): Promise<void>;
    suppressions(): Promise<Suppression[]>;
    suppress(raw: string, note: string): Promise<void>;
    unsuppress(id: string): Promise<void>;
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
        const [lists, seqs, ownersP, ownersC, searches] = await Promise.all([
            supabase.from(T.lists).select("id,name,kind").order("name"),
            supabase.from(T.sequences).select("id,name").order("name"),
            supabase.from(T.people).select("owner").neq("owner", "").limit(2000),
            supabase.from(T.companies).select("owner").neq("owner", "").limit(2000),
            supabase.from("qawsan_searches").select("id,query,found,created_at").eq("status", "done").order("created_at", { ascending: false }).limit(100),
        ]);
        fail(lists.error);
        fail(seqs.error);
        const owners = [...new Set([...(ownersP.data ?? []), ...(ownersC.data ?? [])].map((r) => r.owner as string))].sort();
        const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
        return {
            lists: (lists.data ?? []) as Meta["lists"],
            sequences: (seqs.data ?? []) as NamedItem[],
            owners,
            searches: (searches.data ?? []).map((s) => ({ id: s.id as string, name: `${s.query} · ${s.found} · ${day(s.created_at as string)}` })),
        };
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
    async setStatus(ids, status) {
        const { error } = await supabase.from(T.companies).update({ status }).in("id", ids);
        fail(error);
    },
    async addCompany(c) {
        const { error } = await supabase.from(T.companies).insert(companyRow(c));
        fail(error);
    },
    async removeCompanies(ids) {
        const { error } = await supabase.from(T.companies).delete().in("id", ids);
        fail(error);
    },
    async suppressions() {
        const { data, error } = await supabase.from(T.suppressions).select("id,value,kind,reason,note,created_at").order("created_at", { ascending: false }).limit(5000);
        fail(error);
        return (data ?? []) as Suppression[];
    },
    async suppress(raw, note) {
        const key = suppressionKey(raw);
        if (!key) throw new Error("اكتب رقم هاتف دولي (مع رمز الدولة) أو إيميلًا صحيحًا.");
        const { error } = await supabase.from(T.suppressions).upsert({ ...key, note: note.trim(), reason: "manual" }, { onConflict: "value", ignoreDuplicates: true });
        fail(error);
    },
    async unsuppress(id) {
        const { error } = await supabase.from(T.suppressions).delete().eq("id", id);
        fail(error);
    },
};

/* ------------------------------------------------------------------ */
/* demo (development only)                                              */

export function demoBackend(data: { companies: CompanyRow[]; people: PersonRow[]; meta: Meta }): Backend {
    let saved: SavedSearch[] = [];
    let blocked: Suppression[] = [];
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
        async setStatus(ids, status) {
            data.companies.forEach((c) => ids.includes(c.id) && (c.status = status));
        },
        async addCompany(c) {
            const base = data.companies[0];
            data.companies.unshift({ ...base, ...companyRow(c), id: crypto.randomUUID(), created_at: new Date().toISOString(), address: "", google_maps_url: "", rating: null, rating_count: null, technologies: [], socials: {}, whatsapp: "", search_id: null, enrich_status: "", enriched_at: null });
        },
        async removeCompanies(ids) {
            data.companies.splice(0, data.companies.length, ...data.companies.filter((c) => !ids.includes(c.id)));
        },
        async suppressions() {
            return blocked;
        },
        async suppress(raw, note) {
            const key = suppressionKey(raw);
            if (!key) throw new Error("اكتب رقم هاتف دولي (مع رمز الدولة) أو إيميلًا صحيحًا.");
            if (!blocked.some((b) => b.value === key.value)) blocked = [{ id: crypto.randomUUID(), ...key, reason: "manual", note, created_at: new Date().toISOString() }, ...blocked];
        },
        async unsuppress(id) {
            blocked = blocked.filter((b) => b.id !== id);
        },
    };
}
