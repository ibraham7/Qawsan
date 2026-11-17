// Enrichment and the website audit open other people's websites, so one server call must finish inside the
// host's time limit and takes at most 25 companies. To process more in one click, the page sends the selection
// in batches of 25, one after the other, and asks again for anything the server did not reach in time.

export const BATCH = 25;
/** most companies one click will process */
export const MAX_PER_RUN = 200;
/** how many times a batch is retried for the companies the server did not reach */
const ROUNDS = 4;

export interface Page {
    results: unknown[];
    /** ids the server did not reach before its time limit */
    pending: string[];
}

export interface BatchRun<T extends Page> {
    results: T["results"][number][];
    /** the last server answer (it can carry extra fields, e.g. whether PageSpeed is configured) */
    last: T | null;
    /** ids that were not processed: left over after the retries, or skipped because the run was stopped or failed */
    notReached: string[];
    stopped: boolean;
    /** the message of the failure that ended the run early, if any */
    error?: string;
}

export const batches = <T>(items: T[], size = BATCH): T[][] => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

/**
 * Calls `call` for each batch of ids, retrying the unreached ones of a batch, and gathers everything.
 * A failure or a stop keeps what was already done and reports the rest as not reached.
 */
export async function runInBatches<T extends Page>(
    ids: string[],
    call: (ids: string[]) => Promise<T>,
    opts: { size?: number; shouldStop?: () => boolean; onProgress?: (done: number, total: number) => void } = {}
): Promise<BatchRun<T>> {
    const all = batches([...new Set(ids)], opts.size ?? BATCH);
    const total = all.reduce((s, b) => s + b.length, 0);
    const out: BatchRun<T> = { results: [], last: null, notReached: [], stopped: false };
    for (let b = 0; b < all.length; b++) {
        if (opts.shouldStop?.()) {
            out.stopped = true;
            out.notReached.push(...all.slice(b).flat());
            return out;
        }
        let pending = all[b];
        try {
            for (let round = 0; round < ROUNDS && pending.length; round++) {
                const r = await call(pending);
                out.results.push(...r.results);
                out.last = r;
                pending = r.pending;
                opts.onProgress?.(out.results.length, total);
            }
        } catch (e) {
            out.error = e instanceof Error ? e.message : String(e);
            out.notReached.push(...pending, ...all.slice(b + 1).flat());
            return out;
        }
        out.notReached.push(...pending);
    }
    return out;
}
