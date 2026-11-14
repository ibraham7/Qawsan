// Searching Google Maps in several cities at once = one ordinary single-city search per city, run one
// after the other from the page. The server still checks the monthly cap on every call, so this adds no
// new way to overspend; this file only prepares the list, runs the sequence (stopping at the first
// failure and keeping what was already found) and adds the results up.

import { pagesFor } from "./places.ts";

/** most cities in one run: each costs up to 3 Google requests */
export const MAX_CITIES = 8;

export interface Outcome {
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

export interface MultiOutcome extends Outcome {
    /** one search per city, so the results page can show them together */
    searchIds: string[];
    cities: number;
}

/** the cities to search: trimmed, without empties or repeats (any case), at most MAX_CITIES */
export function cleanCities(list: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of list) {
        const c = raw.trim();
        if (!c || seen.has(c.toLowerCase())) continue;
        seen.add(c.toLowerCase());
        out.push(c);
        if (out.length >= MAX_CITIES) break;
    }
    return out;
}

/** Google requests a run will use at most: no city picked still means one search */
export const estimateRequests = (cities: number, max: number) => Math.max(1, cities) * pagesFor(max);

export function mergeOutcomes(list: Outcome[]): MultiOutcome {
    const last = list[list.length - 1];
    return {
        searchId: list[0].searchId,
        searchIds: list.map((o) => o.searchId),
        cities: list.length,
        query: list.map((o) => o.query).join(" | "),
        requests: list.reduce((s, o) => s + o.requests, 0),
        found: list.reduce((s, o) => s + o.found, 0),
        inserted: list.reduce((s, o) => s + o.inserted, 0),
        updated: list.reduce((s, o) => s + o.updated, 0),
        warning: list.map((o) => o.warning).filter(Boolean).join(" · "),
        used: last.used,
        limit: last.limit,
    };
}

export interface RunResult {
    outcomes: Outcome[];
    /** set when a city failed: the later cities were not searched */
    failed?: { city: string; message: string };
}

/** Searches the cities in order. Stops at the first failure (a quota or key problem would repeat for the rest). */
export async function runCities(cities: string[], run: (city: string) => Promise<Outcome>, onProgress?: (done: number, current: string) => void): Promise<RunResult> {
    const outcomes: Outcome[] = [];
    for (let i = 0; i < cities.length; i++) {
        onProgress?.(i, cities[i]);
        try {
            outcomes.push(await run(cities[i]));
        } catch (e) {
            return { outcomes, failed: { city: cities[i], message: e instanceof Error ? e.message : String(e) } };
        }
    }
    return { outcomes };
}
