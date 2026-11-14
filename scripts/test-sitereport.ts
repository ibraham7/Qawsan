// Checks for the clinic website report content. Run: node scripts/test-sitereport.ts
import assert from "node:assert/strict";

import { isConfirmedIssue } from "../src/lib/prospects/campaigns.ts";
import { buildReport, reportAvailable } from "../src/lib/prospects/sitereport.ts";
import type { ReportInput } from "../src/lib/prospects/sitereport.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

const base: ReportInput = {
    name: "عيادة الأمل", website: "https://amal.example", site_score: 52, site_issues: ["no_viewport", "no_https", "no_booking", "outdated"],
    site_checked_at: "2026-11-12T09:30:00.000Z", site_perf: 41, site_seo: 74, site_a11y: 80, site_lcp_ms: 4850,
};

it("a report exists only for a checked site with a score", () => {
    assert.equal(reportAvailable(base), true);
    assert.equal(reportAvailable({ ...base, site_checked_at: null }), false);
    assert.equal(reportAvailable({ ...base, site_score: null }), false);
    assert.equal(buildReport({ ...base, site_score: null }), null);
    assert.equal(buildReport({ ...base, site_checked_at: null }), null);
});

it("confirmed problems are stated as facts, guesses are kept apart as observations", () => {
    const r = buildReport(base)!;
    assert.deepEqual(r.confirmed.map((f) => f.code), ["no_viewport", "no_https"]);
    assert.deepEqual(r.observations.map((f) => f.code), ["no_booking", "outdated"]);
    // nothing we only suspect is ever listed as confirmed
    for (const code of ["no_booking", "outdated", "no_contact_action", "thin_content", "seo_low", "no_alt", "slow", "heavy"]) {
        assert.equal(isConfirmedIssue(code), false, code);
        const out = buildReport({ ...base, site_issues: [code] })!;
        assert.equal(out.confirmed.length, 0, code);
        assert.equal(out.observations.length, 1, code);
    }
    // every finding explains what it costs the clinic
    for (const f of [...r.confirmed, ...r.observations]) assert.ok(f.title.length > 5 && f.why.length > 20, f.code);
});

it("level, verdict, score and the speed numbers", () => {
    const r = buildReport(base)!;
    assert.equal(r.score, 52);
    assert.equal(r.level, "weak");
    assert.equal(r.verdict, "الموقع يحتاج إلى تحسينات مهمة");
    assert.deepEqual(r.speed, { perf: 41, seo: 74, a11y: 80, lcpSeconds: 4.9 });
    assert.equal(r.date, "2026-11-12");
    assert.equal(buildReport({ ...base, site_score: 70 })!.level, "medium");
    assert.equal(buildReport({ ...base, site_score: 92, site_issues: [] })!.level, "good");
    assert.deepEqual(buildReport({ ...base, site_perf: null, site_lcp_ms: null })!.speed, { perf: null, seo: 74, a11y: 80, lcpSeconds: null });
});

it("passed checks are the ones whose problem is absent", () => {
    const r = buildReport(base)!;
    assert.ok(!r.passed.includes("الموقع يتكيّف مع شاشة الجوال"));
    assert.ok(!r.passed.includes("الموقع آمن (HTTPS)"));
    assert.ok(r.passed.includes("الموقع ظاهر لمحركات البحث"));
    assert.ok(r.passed.includes("الروابط الداخلية تعمل"));
    // a flawless site passes all nine
    assert.equal(buildReport({ ...base, site_score: 100, site_issues: [] })!.passed.length, 9);
});

it("a social page or a dead site gets a report with its own finding and no 'passed' list", () => {
    const social = buildReport({ ...base, site_score: 10, site_issues: ["social_only"] })!;
    assert.deepEqual(social.confirmed.map((f) => f.code), ["social_only"]);
    assert.deepEqual(social.passed, []);
    const dead = buildReport({ ...base, site_score: 0, site_issues: ["unreachable"] })!;
    assert.deepEqual(dead.confirmed.map((f) => f.code), ["unreachable"]);
    assert.deepEqual(dead.passed, []);
});

it("'unreadable' never appears as a finding", () => {
    const r = buildReport({ ...base, site_score: 60, site_issues: ["unreadable", "no_viewport"] })!;
    assert.deepEqual(r.confirmed.map((f) => f.code), ["no_viewport"]);
    assert.equal(r.observations.length, 0);
});

console.log(`\n${passed} checks passed`);
