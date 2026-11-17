// Checks for processing many companies in batches. Run: node scripts/test-batches.ts
import assert from "node:assert/strict";

import { BATCH, MAX_PER_RUN, batches, runInBatches } from "../src/lib/prospects/batches.ts";

let passed = 0;
const it = async (name: string, fn: () => void | Promise<void>) => {
    await fn();
    passed++;
    console.log("ok -", name);
};

const ids = (n: number) => Array.from({ length: n }, (_, i) => `id${i}`);
// a server that handles everything it is given
const all = async (list: string[]) => ({ results: list.map((id) => `done:${id}`), pending: [] as string[] });

await it("the limits", () => {
    assert.equal(BATCH, 25);
    assert.equal(MAX_PER_RUN, 200);
});

await it("batches of 25, the last one smaller, none empty", () => {
    assert.deepEqual(batches(ids(0)), []);
    assert.deepEqual(batches(ids(25)).map((b) => b.length), [25]);
    assert.deepEqual(batches(ids(26)).map((b) => b.length), [25, 1]);
    assert.deepEqual(batches(ids(44)).map((b) => b.length), [25, 19]);
    assert.deepEqual(batches(ids(200)).map((b) => b.length), Array(8).fill(25));
    assert.deepEqual(batches(["a", "b", "c"], 2), [["a", "b"], ["c"]]);
});

await it("44 selected: two calls (25 and 19), everything processed, progress reaches 44", async () => {
    const sizes: number[] = [];
    const progress: [number, number][] = [];
    const r = await runInBatches(ids(44), async (l) => {
        sizes.push(l.length);
        return all(l);
    }, { onProgress: (d, t) => progress.push([d, t]) });
    assert.deepEqual(sizes, [25, 19]);
    assert.equal(r.results.length, 44);
    assert.deepEqual(r.notReached, []);
    assert.equal(r.stopped, false);
    assert.deepEqual(progress.at(-1), [44, 44]);
    assert.deepEqual(progress.map((p) => p[0]), [25, 44]);
});

await it("ids the server did not reach are asked for again, and what is still left is reported", async () => {
    // the server only reaches 10 of what it gets per call
    const calls: string[][] = [];
    const slow = async (l: string[]) => {
        calls.push(l);
        return { results: l.slice(0, 10), pending: l.slice(10) };
    };
    const r = await runInBatches(ids(25), slow);
    assert.deepEqual(calls.map((c) => c.length), [25, 15, 5]);
    assert.equal(r.results.length, 25);
    assert.deepEqual(r.notReached, []);
    // a server that never reaches anything: the retries stop and the ids are reported
    const never = await runInBatches(ids(3), async (l) => ({ results: [] as string[], pending: l }));
    assert.deepEqual(never.notReached, ["id0", "id1", "id2"]);
    assert.equal(never.results.length, 0);
});

await it("a stop keeps what was done and reports the rest", async () => {
    let calls = 0;
    const r = await runInBatches(ids(60), async (l) => {
        calls++;
        return all(l);
    }, { shouldStop: () => calls >= 1 });
    assert.equal(calls, 1);
    assert.equal(r.results.length, 25);
    assert.equal(r.stopped, true);
    assert.equal(r.notReached.length, 35);
});

await it("a failure keeps what was done, says why, and reports the rest", async () => {
    let n = 0;
    const r = await runInBatches(ids(60), async (l) => {
        n++;
        if (n === 2) throw new Error("انتهت الجلسة");
        return all(l);
    });
    assert.equal(r.results.length, 25);
    assert.equal(r.error, "انتهت الجلسة");
    assert.equal(r.notReached.length, 35);
    assert.equal(r.stopped, false);
});

await it("repeated ids are processed once, and the last server answer is kept", async () => {
    const seen: string[] = [];
    const r = await runInBatches(["a", "b", "a", "b", "c"], async (l) => {
        seen.push(...l);
        return { results: l, pending: [] as string[], speedConfigured: true };
    });
    assert.deepEqual(seen, ["a", "b", "c"]);
    assert.equal(r.last?.speedConfigured, true);
    assert.equal((await runInBatches([], all)).last, null);
});

console.log(`\n${passed} checks passed`);
