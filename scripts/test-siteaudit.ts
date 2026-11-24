// Checks for the website audit. Run: node scripts/test-siteaudit.ts
import assert from "node:assert/strict";

import { parsePageSpeed } from "../src/lib/discovery/pagespeed.ts";
import { PENALTY, auditPage, badPhoneLinks, bucket, internalLinks, redirectTarget, scoreFrom, socialOnly } from "../src/lib/discovery/siteaudit.ts";

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
<script type="application/ld+json">{"@type":"Dentist"}</script>
<body><h1>عيادات الابتسامة</h1><p>${filler}</p><a href="tel:+966112345678">اتصل</a><a href="/booking">احجز موعدًا</a>
<footer>© 2026 عيادات الابتسامة</footer></body></html>`;

it("a good modern page scores 100 with no issues", () => {
    const r = auditPage({ html: GOOD, url: "https://smile.example/", ms: 600, bytes: 20_000 }, {}, NOW);
    assert.deepEqual(r.issues, []);
    assert.equal(r.score, 100);
    assert.equal(bucket(r.score), "good");
});

it("each problem costs its own points, worked out by hand", () => {
    // no viewport (25) + http (15) = 40 -> 60
    const noMobile = GOOD.replace(/<meta name="viewport"[^>]*>/, "");
    const r = auditPage({ html: noMobile, url: "http://smile.example/", ms: 600, bytes: 20_000 }, {}, NOW);
    assert.deepEqual(r.issues.sort(), ["no_https", "no_viewport"]);
    assert.equal(r.score, 60);
    assert.equal(bucket(r.score), "medium");
    // slow only: 90
    assert.equal(auditPage({ html: GOOD, url: "https://smile.example/", ms: 5200, bytes: 20_000 }, {}, NOW).score, 90);
    // heavy only (800 KB): 92
    assert.equal(auditPage({ html: GOOD, url: "https://smile.example/", ms: 600, bytes: 800_000 }, {}, NOW).score, 92);
});

it("an old, mobile-less, http site is weak", () => {
    const old = `<html><head><title>My Clinic</title></head><body><font size=3>Welcome</font><p>${filler}</p><p>Copyright 2014 My Clinic</p></body></html>`;
    const r = auditPage({ html: old, url: "http://myclinic.example/", ms: 900, bytes: 9000 }, {}, NOW);
    // no_https 15, no_viewport 25, no_title 8 ("My Clinic" is 9 chars), no_description 8, no_h1 5, outdated 15, no_booking 10,
    // no_contact_action 8, no_lang 2, no_structured_data 2
    assert.deepEqual(r.issues.sort(), ["no_booking", "no_contact_action", "no_description", "no_h1", "no_https", "no_lang", "no_structured_data", "no_title", "no_viewport", "outdated"].sort());
    assert.equal(r.score, 100 - 15 - 25 - 8 - 8 - 5 - 15 - 10 - 8 - 2 - 2);
    assert.equal(r.score, 2);
    assert.equal(bucket(r.score), "weak");
});

it("copyright year: recent is fine, 3+ years old is outdated, a range uses its end", () => {
    const withYear = (y: string) => GOOD.replace("© 2026", y);
    const run = (y: string) => auditPage({ html: withYear(y), url: "https://s.example/", ms: 500, bytes: 20_000 }, {}, NOW).issues;
    assert.deepEqual(run("© 2024"), []);
    assert.deepEqual(run("© 2023"), ["outdated"]);
    assert.deepEqual(run("© 2015 - 2026"), []);
    assert.deepEqual(run("حقوق النشر 2019"), ["outdated"]);
    // old jQuery
    const jq = GOOD.replace("</body>", '<script src="/js/jquery-1.11.3.min.js"></script></body>');
    assert.deepEqual(auditPage({ html: jq, url: "https://s.example/", ms: 500, bytes: 20_000 }, {}, NOW).issues, ["outdated"]);
});

it("free builders and social pages are recognised", () => {
    assert.ok(auditPage({ html: GOOD, url: "https://myclinic.business.site/", ms: 500, bytes: 20_000 }, {}, NOW).issues.includes("free_builder"));
    assert.ok(auditPage({ html: GOOD, url: "https://smile.wixsite.com/clinic", ms: 500, bytes: 20_000 }, {}, NOW).issues.includes("free_builder"));
    assert.ok(!auditPage({ html: GOOD, url: "https://smile.example/", ms: 500, bytes: 20_000 }, {}, NOW).issues.includes("free_builder"));
    assert.equal(socialOnly("https://www.instagram.com/smile_clinic/"), true);
    assert.equal(socialOnly("instagram.com"), true);
    assert.equal(socialOnly("https://smile.example/instagram.com"), false);
    assert.equal(socialOnly("https://linktr.ee/smile"), true);
});

it("a page drawn by JavaScript is not scored", () => {
    const spa = `<html><head><title>App</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>`;
    const r = auditPage({ html: spa, url: "https://spa.example/", ms: 500, bytes: 3000 }, {}, NOW);
    assert.deepEqual(r, { score: null, issues: ["unreadable"] });
    assert.equal(bucket(null), "unreadable");
    // a short page without an app shell is just thin, and is scored
    const short = `<html><head><title>Short page title</title></head><body><h1>Hi</h1><p>hello</p></body></html>`;
    assert.ok(auditPage({ html: short, url: "https://s.example/", ms: 500, bytes: 3000 }, {}, NOW).issues.includes("thin_content"));
});

it("booking and contact actions", () => {
    const noForm = GOOD.replace("احجز موعدًا", "اقرأ المزيد").replace('<a href="tel:+966112345678">اتصل</a>', "");
    const r = auditPage({ html: noForm, url: "https://s.example/", ms: 500, bytes: 20_000 }, {}, NOW);
    assert.deepEqual(r.issues.sort(), ["no_booking", "no_contact_action"]);
    assert.equal(r.score, 100 - 10 - 8);
    // a contact form counts for both
    const form = noForm.replace("</body>", "<form><input name=n></form></body>");
    assert.deepEqual(auditPage({ html: form, url: "https://s.example/", ms: 500, bytes: 20_000 }, {}, NOW).issues, []);
    // a WhatsApp link counts as a contact action
    const wa = noForm.replace("</body>", '<a href="https://wa.me/966500000000">chat</a></body>');
    assert.deepEqual(auditPage({ html: wa, url: "https://s.example/", ms: 500, bytes: 20_000 }, {}, NOW).issues, ["no_booking"]);
});

it("measured PageSpeed numbers replace the rough speed guesses", () => {
    const base = { html: GOOD, url: "https://smile.example/", ms: 5200, bytes: 800_000 };
    // without measurement: slow 10 + heavy 8
    assert.equal(auditPage(base, {}, NOW).score, 82);
    // measured and fine: neither guess applies
    assert.equal(auditPage(base, { measured: { perf: 90, seo: 95, a11y: 90, lcpMs: 1800 } }, NOW).score, 100);
    // measured slow phone (perf 38 -> 15) with a late main content (5200 ms -> 5)
    const slow = auditPage(base, { measured: { perf: 38, seo: 95, a11y: 90, lcpMs: 5200 } }, NOW);
    assert.deepEqual(slow.issues.sort(), ["poor_lcp", "slow_mobile"]);
    assert.equal(slow.score, 80);
    // perf exactly 50 is not "very slow"; seo 79 is low (8)
    assert.deepEqual(auditPage(base, { measured: { perf: 50, seo: 79, a11y: 90, lcpMs: 4000 } }, NOW).issues, ["seo_low"]);
});

it("search basics and links", () => {
    const run = (html: string, extra = {}) => auditPage({ html, url: "https://s.example/", ms: 500, bytes: 20_000 }, extra, NOW).issues;
    assert.deepEqual(run(GOOD.replace("<head>", '<head><meta name="robots" content="noindex, nofollow">')), ["noindex"]);
    assert.deepEqual(run(GOOD.replace("<head>", '<head><meta content="index,noindex" name="robots">')), ["noindex"]);
    assert.deepEqual(run(GOOD.replace('<html lang="ar">', "<html>")), ["no_lang"]);
    assert.deepEqual(run(GOOD, { links: { broken: 2, checked: 6, sitemap: false } }).sort(), ["broken_links", "no_sitemap"]);
    assert.deepEqual(run(GOOD, { links: { broken: 0, checked: 6, sitemap: true } }), []);
    assert.deepEqual(run(GOOD, { links: { broken: 0, checked: 0, sitemap: null } }), []);
});

it("phone and WhatsApp links that cannot work", () => {
    assert.equal(badPhoneLinks('<a href="tel:+966 11 234 5678">a</a><a href="tel:0501234567">b</a>'), 0);
    assert.equal(badPhoneLinks('<a href="tel:12345">a</a>'), 1);
    assert.equal(badPhoneLinks('<a href="tel:call-us">a</a>'), 1);
    assert.equal(badPhoneLinks('<a href="https://wa.me/">a</a><a href="https://wa.me/966501234567">b</a>'), 1);
    assert.ok(auditPage({ html: GOOD.replace("+966112345678", "123"), url: "https://s.example/", ms: 500, bytes: 20_000 }, {}, NOW).issues.includes("bad_phone_link"));
});

it("which same-site links are opened to test", () => {
    const html = `<a href="/">home</a><a href="/about">a</a><a href="/about#team">a again</a><a href="https://other.example/x">o</a>
      <a href="/menu.pdf">pdf</a><a href="mailto:a@b.co">m</a><a href="tel:123">t</a><a href="https://www.s.example/contact?x=1">c</a><a href="#top">top</a>`;
    assert.deepEqual(internalLinks(html, "https://s.example/"), ["https://s.example/about", "https://www.s.example/contact"]);
    assert.deepEqual(internalLinks(`${"<a href='/p1'>1</a><a href='/p2'>2</a><a href='/p3'>3</a>"}`, "https://s.example/", 2), ["https://s.example/p1", "https://s.example/p2"]);
});

it("PageSpeed response is read (shape from Google's documentation, not a live capture)", () => {
    const ok = {
        lighthouseResult: {
            categories: { performance: { score: 0.38 }, seo: { score: 0.92 }, accessibility: { score: 0.855 }, "best-practices": { score: 1 } },
            audits: { "largest-contentful-paint": { numericValue: 5234.6 } },
        },
    };
    assert.deepEqual(parsePageSpeed(ok), { perf: 38, seo: 92, a11y: 86, lcpMs: 5235 });
    // missing pieces become null, a missing performance score means no usable run
    assert.deepEqual(parsePageSpeed({ lighthouseResult: { categories: { performance: { score: 1 } } } }), { perf: 100, seo: null, a11y: null, lcpMs: null });
    assert.equal(parsePageSpeed({ lighthouseResult: { categories: { performance: { score: null } } } }), null);
    assert.equal(parsePageSpeed({ error: { code: 429 } }), null);
    assert.equal(parsePageSpeed(null), null);
});

it("score is clamped and buckets split at 60 and 80", () => {
    assert.equal(scoreFrom(Object.keys(PENALTY) as never), 0);
    assert.equal(scoreFrom([]), 100);
    assert.equal(bucket(59), "weak");
    assert.equal(bucket(60), "medium");
    assert.equal(bucket(79), "medium");
    assert.equal(bucket(80), "good");
});

it("a tiny redirect stub points to the real site, a real page does not", () => {
    // the real stubs seen on two clinic domains
    const maya = '<html><head><title>https://mayaklinik.com.tr/</title><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-9"><meta http-equiv="refresh" content="0;URL=https://mayaklinik.com.tr/"></head> <body></body></html>';
    assert.equal(redirectTarget(maya, "http://www.mayadentalklinik.com/"), "https://mayaklinik.com.tr/");
    const dentaland = '<html><head><meta http-equiv="refresh" content="0; url=https://dentaland.com.tr/v1/"> </head></html>';
    assert.equal(redirectTarget(dentaland, "http://www.dentaland.com.tr/"), "https://dentaland.com.tr/v1/");
    // attribute order, relative target and a script redirect
    assert.equal(redirectTarget('<meta content="1;url=/tr/" http-equiv="Refresh">', "https://a.com/"), "https://a.com/tr/");
    assert.equal(redirectTarget('<script>window.location.href = "https://b.com/home"</script>', "https://a.com/"), "https://b.com/home");
    assert.equal(redirectTarget("<script>location.replace('https://b.com/x')</script>", "https://a.com/"), "https://b.com/x");
    // not a stub: a refresh to itself, no redirect at all, a big real page, a non-http target
    assert.equal(redirectTarget('<meta http-equiv="refresh" content="0;url=https://a.com/">', "https://a.com/"), null);
    assert.equal(redirectTarget("<html><body>Merhaba</body></html>", "https://a.com/"), null);
    assert.equal(redirectTarget('<meta http-equiv="refresh" content="0;url=https://b.com/">' + "x".repeat(4000), "https://a.com/"), null);
    assert.equal(redirectTarget('<meta http-equiv="refresh" content="0;url=javascript:alert(1)">', "https://a.com/"), null);
});

console.log(`\n${passed} checks passed`);
