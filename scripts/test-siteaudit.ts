// Checks for the website audit. Run: node scripts/test-siteaudit.ts
import assert from "node:assert/strict";

import { PENALTY, auditPage, bucket, scoreFrom, socialOnly } from "../src/lib/discovery/siteaudit.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

const NOW = new Date("2026-11-14T00:00:00Z");
const filler = "نقدم خدمات طب الأسنان بأحدث الأجهزة وأمهر الأطباء في مدينة الرياض. ".repeat(12);

// a modern, complete page
const GOOD = `<!doctype html><html lang="ar"><head><title>عيادات الابتسامة لطب الأسنان في الرياض</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="عيادة أسنان في الرياض: تبييض وزراعة وتقويم، احجز موعدك اليوم مع نخبة من الأطباء."></head>
<body><h1>عيادات الابتسامة</h1><p>${filler}</p><a href="tel:+966112345678">اتصل</a><a href="/booking">احجز موعدًا</a>
<footer>© 2026 عيادات الابتسامة</footer></body></html>`;

it("a good modern page scores 100 with no issues", () => {
    const r = auditPage({ html: GOOD, url: "https://smile.example/", ms: 600, bytes: 20_000 }, NOW);
    assert.deepEqual(r.issues, []);
    assert.equal(r.score, 100);
    assert.equal(bucket(r.score), "good");
});

it("each problem costs its own points, worked out by hand", () => {
    // no viewport (25) + http (15) = 40 -> 60
    const noMobile = GOOD.replace(/<meta name="viewport"[^>]*>/, "");
    const r = auditPage({ html: noMobile, url: "http://smile.example/", ms: 600, bytes: 20_000 }, NOW);
    assert.deepEqual(r.issues.sort(), ["no_https", "no_viewport"]);
    assert.equal(r.score, 60);
    assert.equal(bucket(r.score), "medium");
    // slow only: 90
    assert.equal(auditPage({ html: GOOD, url: "https://smile.example/", ms: 5200, bytes: 20_000 }, NOW).score, 90);
    // heavy only (800 KB): 92
    assert.equal(auditPage({ html: GOOD, url: "https://smile.example/", ms: 600, bytes: 800_000 }, NOW).score, 92);
});

it("an old, mobile-less, http site is weak", () => {
    const old = `<html><head><title>My Clinic</title></head><body><font size=3>Welcome</font><p>${filler}</p><p>Copyright 2014 My Clinic</p></body></html>`;
    const r = auditPage({ html: old, url: "http://myclinic.example/", ms: 900, bytes: 9000 }, NOW);
    // no_https 15, no_viewport 25, no_title 8 ("My Clinic" is 9 chars), no_description 8, no_h1 5, outdated 15, no_booking 10, no_contact_action 8
    assert.deepEqual(r.issues.sort(), ["no_booking", "no_contact_action", "no_description", "no_h1", "no_https", "no_title", "no_viewport", "outdated"].sort());
    assert.equal(r.score, 100 - 15 - 25 - 8 - 8 - 5 - 15 - 10 - 8);
    assert.equal(r.score, 6);
    assert.equal(bucket(r.score), "weak");
});

it("copyright year: recent is fine, 3+ years old is outdated, a range uses its end", () => {
    const withYear = (y: string) => GOOD.replace("© 2026", y);
    const run = (y: string) => auditPage({ html: withYear(y), url: "https://s.example/", ms: 500, bytes: 20_000 }, NOW).issues;
    assert.deepEqual(run("© 2024"), []);
    assert.deepEqual(run("© 2023"), ["outdated"]);
    assert.deepEqual(run("© 2015 - 2026"), []);
    assert.deepEqual(run("حقوق النشر 2019"), ["outdated"]);
    // old jQuery
    const jq = GOOD.replace("</body>", '<script src="/js/jquery-1.11.3.min.js"></script></body>');
    assert.deepEqual(auditPage({ html: jq, url: "https://s.example/", ms: 500, bytes: 20_000 }, NOW).issues, ["outdated"]);
});

it("free builders and social pages are recognised", () => {
    assert.ok(auditPage({ html: GOOD, url: "https://myclinic.business.site/", ms: 500, bytes: 20_000 }, NOW).issues.includes("free_builder"));
    assert.ok(auditPage({ html: GOOD, url: "https://smile.wixsite.com/clinic", ms: 500, bytes: 20_000 }, NOW).issues.includes("free_builder"));
    assert.ok(!auditPage({ html: GOOD, url: "https://smile.example/", ms: 500, bytes: 20_000 }, NOW).issues.includes("free_builder"));
    assert.equal(socialOnly("https://www.instagram.com/smile_clinic/"), true);
    assert.equal(socialOnly("instagram.com"), true);
    assert.equal(socialOnly("https://smile.example/instagram.com"), false);
    assert.equal(socialOnly("https://linktr.ee/smile"), true);
});

it("a page drawn by JavaScript is not scored", () => {
    const spa = `<html><head><title>App</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>`;
    const r = auditPage({ html: spa, url: "https://spa.example/", ms: 500, bytes: 3000 }, NOW);
    assert.deepEqual(r, { score: null, issues: ["unreadable"] });
    assert.equal(bucket(null), "unreadable");
    // a short page without an app shell is just thin, and is scored
    const short = `<html><head><title>Short page title</title></head><body><h1>Hi</h1><p>hello</p></body></html>`;
    assert.ok(auditPage({ html: short, url: "https://s.example/", ms: 500, bytes: 3000 }, NOW).issues.includes("thin_content"));
});

it("booking and contact actions", () => {
    const noForm = GOOD.replace("احجز موعدًا", "اقرأ المزيد").replace('<a href="tel:+966112345678">اتصل</a>', "");
    const r = auditPage({ html: noForm, url: "https://s.example/", ms: 500, bytes: 20_000 }, NOW);
    assert.deepEqual(r.issues.sort(), ["no_booking", "no_contact_action"]);
    assert.equal(r.score, 100 - 10 - 8);
    // a contact form counts for both
    const form = noForm.replace("</body>", "<form><input name=n></form></body>");
    assert.deepEqual(auditPage({ html: form, url: "https://s.example/", ms: 500, bytes: 20_000 }, NOW).issues, []);
    // a WhatsApp link counts as a contact action
    const wa = noForm.replace("</body>", '<a href="https://wa.me/966500000000">chat</a></body>');
    assert.deepEqual(auditPage({ html: wa, url: "https://s.example/", ms: 500, bytes: 20_000 }, NOW).issues, ["no_booking"]);
});

it("score is clamped and buckets split at 60 and 80", () => {
    assert.equal(scoreFrom(Object.keys(PENALTY) as never), 0);
    assert.equal(scoreFrom([]), 100);
    assert.equal(bucket(59), "weak");
    assert.equal(bucket(60), "medium");
    assert.equal(bucket(79), "medium");
    assert.equal(bucket(80), "good");
});

console.log(`\n${passed} checks passed`);
