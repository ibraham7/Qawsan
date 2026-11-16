// Checks for the copyable list of companies and websites. Run: node scripts/test-export.ts
import assert from "node:assert/strict";

import { siteList } from "../src/lib/prospects/export.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

const base = { name: "عيادة الأمل", website: "https://amal.example", domain: "amal.example", hq_city: "Riyadh", site_score: 34, site_checked_at: "2026-11-12T09:00:00Z" };

it("one numbered line per company: name, website, city, and the tool's score with its level", () => {
    const out = siteList([base, { ...base, name: "عيادة النور", website: "https://noor.example", hq_city: "Jeddah", site_score: 71 }, { ...base, name: "عيادة الشفاء", website: "https://shifa.example", hq_city: "Dammam", site_score: 92 }]);
    assert.equal(
        out,
        [
            "1. عيادة الأمل — https://amal.example — Riyadh — فحص الأداة: 34/100 ضعيف",
            "2. عيادة النور — https://noor.example — Jeddah — فحص الأداة: 71/100 متوسط",
            "3. عيادة الشفاء — https://shifa.example — Dammam — فحص الأداة: 92/100 جيد",
        ].join("\n")
    );
});

it("no website, no city, and not audited are all handled without blanks or 'null'", () => {
    assert.equal(siteList([{ ...base, website: "", domain: "" , site_score: null, site_checked_at: null, hq_city: "" }]), "1. عيادة الأمل — (بلا موقع)");
    // a domain without a full address is turned into one
    assert.equal(siteList([{ ...base, website: "", domain: "amal.example", site_score: null, site_checked_at: null, hq_city: "" }]), "1. عيادة الأمل — https://amal.example");
    // a score only counts when the site was checked, and an unreadable site has none
    assert.equal(siteList([{ ...base, site_score: 50, site_checked_at: null }]), "1. عيادة الأمل — https://amal.example — Riyadh");
    assert.equal(siteList([{ ...base, site_score: null }]), "1. عيادة الأمل — https://amal.example — Riyadh");
    assert.equal(siteList([]), "");
});

it("names are trimmed", () => {
    assert.ok(siteList([{ ...base, name: "  عيادة الأمل  " }]).startsWith("1. عيادة الأمل — "));
});

console.log(`\n${passed} checks passed`);
