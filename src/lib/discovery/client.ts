// Browser calls to /api/prospects/* with the signed-in admin's session token.

import { supabase } from "../supabase";
import type { SearchInput } from "./places";

export interface DiscoveryStatus {
    configured: boolean;
    used: number;
    limit: number;
}

export interface SearchOutcome {
    searchId: string;
    query: string;
    requests: number;
    found: number;
    inserted: number;
    updated: number;
    warning: string;
    used: number;
    limit: number;
}

export interface EnrichOutcome {
    results: { id: string; status: "done" | "nothing_found" | "no_website" | "failed"; emails: number; socials: number; whatsapp: boolean }[];
    pending: string[];
}

async function call<T>(path: string, payload?: unknown): Promise<T> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("سجّل الدخول أولًا.");
    const r = await fetch(path, {
        method: payload === undefined ? "GET" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    const json = (await r.json().catch(() => null)) as ({ ok?: boolean; error?: string } & T) | null;
    if (!json) throw new Error("هذه الميزة تعمل على الموقع المنشور فقط (خادم /api غير متاح هنا).");
    if (!r.ok || !json.ok) throw new Error(json.error || `خطأ ${r.status}`);
    return json;
}

export interface MailStatus {
    configured: boolean;
    from: string;
    host: string;
}

export interface SendBatch {
    sent: number;
    failed: number;
    skipped: number;
    sentToday: number;
    limit: number;
    pending: number;
    /** "limit" = daily limit reached, "done" = nothing left, "auth" = wrong mailbox credentials */
    stopped: "" | "limit" | "done" | "auth";
}

export const discoveryStatus = () => call<DiscoveryStatus>("/api/prospects/search");
export const runDiscovery = (input: SearchInput) => call<SearchOutcome>("/api/prospects/search", input);
export const mailStatus = () => call<MailStatus>("/api/prospects/email-status");
export const mailTest = () => call<{ to: string }>("/api/prospects/email-status", {});
export const sendBatch = (campaignId: string) => call<SendBatch>("/api/prospects/email-send", { campaignId });
export const runEnrich = (ids: string[]) => call<EnrichOutcome>("/api/prospects/enrich", { ids });
