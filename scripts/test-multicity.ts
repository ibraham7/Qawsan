// Checks for searching several cities. Run: node scripts/test-multicity.ts
import assert from "node:assert/strict";

import { MAX_CITIES, cleanCities, estimateRequests, mergeOutcomes, runCities } from "../src/lib/discovery/multicity.ts";
import type { Outcome } from "../src/lib/discovery/multicity.ts";

let passed = 0;
const it = async (name: string, fn: () => void | Promise<void>) => {
    await fn();
    passed++;
    console.log("ok -", name);
};

const out = (city: string, over: Partial<Outcome> = {}): Outcome => ({ searchId: `id-${city}`, query: `Dentists in ${city}`, requests: 2, found: 40, inserted: 30, updated: 10, warning: "", used: 10, limit: 300, ...over });

await it("city list: trimmed, no empties, no repeats in any case, capped", () => {
    assert.deepEqual(cleanCities([" Riyadh ", "", "riyadh", "Jeddah", "  ", "JEDDAH", "Dammam"]), ["Riyadh", "Jeddah", "Dammam"]);
    assert.deepEqual(cleanCities([]), []);
    const many = Array.from({ length: 20 }, (_, i) => `City ${i}`);
    assert.equal(cleanCities(many).length, MAX_CITIES);
    assert.deepEqual(cleanCities(many), many.slice(0, MAX_CITIES));
});

await it("estimate: cities x pages, and no city still costs one search", () => {
    assert.equal(estimateRequests(3, 40), 6); // 40 results = 2 requests per city
    assert.equal(estimateRequests(1, 20), 1);
    assert.equal(estimateRequests(5, 60), 15);
    assert.equal(estimateRequests(0, 40), 2);
    assert.equal(estimateRequests(MAX_CITIES, 60), MAX_CITIES * 3);
});

await it("results are added up, with every search id and the last quota reading", () => {
    const m = mergeOutcomes([out("Riyadh", { used: 12 }), out("Jeddah", { requests: 3, found: 55, inserted: 50, updated: 5, used: 15, warning: "w1" }), out("Dammam", { used: 17, limit: 300, warning: "w2" })]);
    assert.deepEqual(m.searchIds, ["id-Riyadh", "id-Jeddah", "id-Dammam"]);
    assert.equal(m.searchId, "id-Riyadh");
    assert.equal(m.cities, 3);
    assert.equal(m.requests, 7);
    assert.equal(m.found, 135);
    assert.equal(m.inserted, 110);
    assert.equal(m.updated, 25);
    assert.equal(m.warning, "w1 · w2");
    assert.equal(m.used, 17);
    assert.equal(m.query, "Dentists in Riyadh | Dentists in Jeddah | Dentists in Dammam");
});

await it("cities run in order, one at a time, with progress", async () => {
    const calls: string[] = [];
    const progress: [number, string][] = [];
    let running = 0;
    let maxRunning = 0;
    const r = await runCities(
        ["Riyadh", "Jeddah", "Dammam"],
        async (c) => {
            running++;
            maxRunning = Math.max(maxRunning, running);
            await new Promise((ok) => setTimeout(ok, 5));
            calls.push(c);
            running--;
            return out(c);
        },
        (i, c) => progress.push([i, c])
    );
    assert.deepEqual(calls, ["Riyadh", "Jeddah", "Dammam"]);
    assert.equal(maxRunning, 1);
    assert.deepEqual(progress, [[0, "Riyadh"], [1, "Jeddah"], [2, "Dammam"]]);
    assert.equal(r.outcomes.length, 3);
    assert.equal(r.failed, undefined);
});

await it("a failure stops the run, keeps what was found, and says which city", async () => {
    const calls: string[] = [];
    const r = await runCities(["Riyadh", "Jeddah", "Dammam"], async (c) => {
        calls.push(c);
        if (c === "Jeddah") throw new Error("وصلت للحد الشهري");
        return out(c);
    });
    assert.deepEqual(calls, ["Riyadh", "Jeddah"], "Dammam is never searched");
    assert.deepEqual(r.outcomes.map((o) => o.searchId), ["id-Riyadh"]);
    assert.deepEqual(r.failed, { city: "Jeddah", message: "وصلت للحد الشهري" });
    // the very first city failing leaves nothing to merge
    const none = await runCities(["Riyadh"], async () => {
        throw new Error("x");
    });
    assert.equal(none.outcomes.length, 0);
    assert.equal(none.failed?.city, "Riyadh");
});

console.log(`\n${passed} checks passed`);
