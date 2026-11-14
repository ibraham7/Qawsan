// Checks for the company priority and the {issue} placeholder. Run: node scripts/test-priority.ts
import assert from "node:assert/strict";

import { mainIssue, renderMessage, validateTemplate } from "../src/lib/prospects/campaigns.ts";
import { priority, priorityParts } from "../src/lib/prospects/priority.ts";
import type { PriorityInput } from "../src/lib/prospects/priority.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

const base: PriorityInput = { rating: null, rating_count: null, phone_kind: "", whatsapp: "", emails: [], website: "https://x.example", site_score: null, status: "new" };

it("priority parts, worked out by hand", () => {
    // busy, well-rated, reachable clinic with a weak site
    // need 45 x (100-20)/100 = 36; rating 4.8 -> (1.3/1.5) x 15 = 13; 400 reviews -> 20; mobile 12 + email 8 = 20
    const best = { ...base, rating: 4.8, rating_count: 400, phone_kind: "mobile", emails: ["a@b.co"], site_score: 20 };
    assert.deepEqual(priorityParts(best), { need: 36, strength: 33, reach: 20, total: 89 });
    // the same clinic with a good site (95): need 2 (45 x 5/100 = 2.25)
    assert.equal(priorityParts({ ...best, site_score: 95 }).need, 2);
    // no website at all: need 40
    assert.equal(priorityParts({ ...base, website: "" }).need, 40);
    // a site that was never audited (or could not be read): need 15
    assert.equal(priorityParts(base).need, 15);
    // rating 3.5 or below gives nothing, 5.0 gives 15, 4.0 gives 5
    assert.equal(priorityParts({ ...base, rating: 3.2 }).strength, 0);
    assert.equal(priorityParts({ ...base, rating: 5 }).strength, 15);
    assert.equal(priorityParts({ ...base, rating: 4 }).strength, 5);
    // reviews: 300 or more is the full 20; 0 is 0; 17 reviews -> 20 x ln(18)/ln(301) = 10.1 -> 10
    assert.equal(priorityParts({ ...base, rating_count: 5000 }).strength, 20);
    assert.equal(priorityParts({ ...base, rating_count: 0 }).strength, 0);
    assert.equal(priorityParts({ ...base, rating_count: 17 }).strength, 10);
});

it("reach: mobile or WhatsApp 12, landline only 4, email +8", () => {
    assert.equal(priorityParts({ ...base, phone_kind: "mobile" }).reach, 12);
    assert.equal(priorityParts({ ...base, whatsapp: "+966501234567" }).reach, 12);
    assert.equal(priorityParts({ ...base, phone_kind: "landline" }).reach, 4);
    assert.equal(priorityParts({ ...base, phone_kind: "landline", emails: ["a@b.co"] }).reach, 12);
    assert.equal(priorityParts({ ...base, phone_kind: "mobile", emails: ["a@b.co"] }).reach, 20);
});

it("rejected and invalid companies are zero; the total never leaves 0-100", () => {
    const strong = { ...base, rating: 5, rating_count: 900, phone_kind: "mobile", emails: ["a@b.co"], site_score: 0 };
    assert.equal(priority({ ...strong, status: "not_fit" }), 0);
    assert.equal(priority({ ...strong, status: "invalid" }), 0);
    assert.equal(priority(strong), 45 + 35 + 20);
    assert.equal(priority({ ...strong, website: "" }), 40 + 35 + 20);
    assert.ok(priority({ ...base, site_score: 100 }) >= 0);
});

it("a weak site on a busy clinic ranks above the same clinic with a good site and above a quiet weak one", () => {
    const busy = { ...base, rating: 4.7, rating_count: 600, phone_kind: "mobile", emails: ["a@b.co"] };
    const weakBusy = priority({ ...busy, site_score: 30 });
    const goodBusy = priority({ ...busy, site_score: 92 });
    const weakQuiet = priority({ ...base, rating: 3.6, rating_count: 3, phone_kind: "landline", site_score: 30 });
    assert.ok(weakBusy > goodBusy);
    assert.ok(weakBusy > weakQuiet);
});

it("{issue}: the first confirmed problem, in order of weight; unconfirmed ones are ignored", () => {
    assert.equal(mainIssue(["no_booking", "outdated"]), "");
    assert.equal(mainIssue([]), "");
    assert.equal(mainIssue(["no_booking", "no_viewport"]), "لا يظهر بشكل مريح على الجوال");
    // noindex outweighs a missing viewport
    assert.equal(mainIssue(["no_viewport", "noindex"]), "محجوب عن محركات البحث فلن يجده من يبحث في Google");
    assert.equal(mainIssue(["slow_mobile"]), "بطيء في الفتح على الجوال");
    assert.equal(mainIssue(["no_https"]), "يظهر للزائر بتحذير «غير آمن» في المتصفح");
    // problems we only guess at are never named to a clinic
    for (const guess of ["no_booking", "outdated", "no_contact_action", "thin_content", "seo_low", "no_alt", "no_sitemap", "slow", "heavy", "unreachable", "unreadable", "social_only"]) {
        assert.equal(mainIssue([guess]), "", guess);
    }
});

it("{issue} in a message", () => {
    const t = "{مرحبًا|أهلًا} {name}، لاحظت أن موقعكم {issue}.";
    const out = renderMessage(t, "عيادة الأمل", "", "seed", "لا يظهر بشكل مريح على الجوال");
    assert.ok(out.includes("عيادة الأمل، لاحظت أن موقعكم لا يظهر بشكل مريح على الجوال."));
    assert.ok(!out.includes("{"));
    // no issue given: the placeholder is not left behind
    assert.ok(!renderMessage(t, "عيادة الأمل", "", "seed").includes("{issue}"));
    // the {a|b} groups still work next to it, and stop lines still follow
    assert.ok(renderMessage("{a|b} {issue}", "x", "stop", "s", "problem").endsWith("problem\n\nstop"));
    assert.equal(validateTemplate(t), null);
});

console.log(`\n${passed} checks passed`);
