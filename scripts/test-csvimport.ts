// Checks for the CSV import of companies. Run: node scripts/test-csvimport.ts
import assert from "node:assert/strict";

import { MAX_ROWS, cleanWebsite, detectColumns, normalizePhone, parseCsv, planImport } from "../src/lib/prospects/csvimport.ts";
import type { Existing, Mapping } from "../src/lib/prospects/csvimport.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

const none: Existing = { domains: new Set(), phones: new Set(), emails: new Set() };

it("reads CSV: quotes, doubled quotes, line breaks in quotes, BOM, CRLF, empty lines", () => {
    assert.deepEqual(parseCsv("a,b\n1,2\n"), [["a", "b"], ["1", "2"]]);
    assert.deepEqual(parseCsv('﻿name,note\r\n"Smile, Clinic","said ""hi"""\r\n\r\nx,"two\nlines"'), [["name", "note"], ["Smile, Clinic", 'said "hi"'], ["x", "two\nlines"]]);
    assert.deepEqual(parseCsv("a,b\n1,"), [["a", "b"], ["1", ""]]);
    assert.deepEqual(parseCsv(""), []);
    assert.deepEqual(parseCsv("\n\n  ,  \n"), []);
});

it("separator is guessed: comma, semicolon (Excel in Arabic/Turkish locales) or tab", () => {
    assert.deepEqual(parseCsv("name;phone\nA;0501\n"), [["name", "phone"], ["A", "0501"]]);
    assert.deepEqual(parseCsv("name\tphone\nA\t0501\n"), [["name", "phone"], ["A", "0501"]]);
    // a comma inside quotes does not count as the separator
    assert.deepEqual(parseCsv('"a,b,c";d\n1;2'), [["a,b,c", "d"], ["1", "2"]]);
});

it("columns are recognised from English and Arabic headers", () => {
    assert.deepEqual(detectColumns(["Name", "Phone", "Email", "Website", "City", "Country", "Notes"]), { name: 0, phone: 1, email: 2, website: 3, city: 4, country: 5, notes: 6 });
    assert.deepEqual(detectColumns(["اسم العيادة", "الجوال", "البريد الإلكتروني", "الموقع", "المدينة", "الدولة", "ملاحظات"]), { name: 0, phone: 1, email: 2, website: 3, city: 4, country: 5, notes: 6 });
    // different spellings of the same letters, and extra words around the header
    assert.deepEqual(detectColumns(["Clinic Name", "Mobile No", "E-mail", "Web Site"]), { name: 0, phone: 1, email: 2, website: 3 });
    assert.deepEqual(detectColumns(["الإيميل", "رقم الواتساب", "الاسم"]), { email: 0, phone: 1, name: 2 });
    // unknown headers are left unmapped, and one column is never used for two fields
    assert.deepEqual(detectColumns(["x", "y"]), {});
    const m = detectColumns(["Phone", "Phone number"]);
    assert.equal(Object.values(m).length, new Set(Object.values(m)).size);
});

it("phone numbers become international numbers", () => {
    assert.equal(normalizePhone("0501234567", "966"), "+966501234567");
    assert.equal(normalizePhone("501234567", "966"), "+966501234567");
    assert.equal(normalizePhone("966501234567", "966"), "+966501234567");
    assert.equal(normalizePhone("+966 50 123 4567", "966"), "+966501234567");
    assert.equal(normalizePhone("00966-50-123-4567", ""), "+966501234567");
    assert.equal(normalizePhone("0532 111 22 33", "90"), "+905321112233");
    assert.equal(normalizePhone("011 234 5678", "966"), "+966112345678");
    // an explicit + wins over the default country
    assert.equal(normalizePhone("+90 532 111 22 33", "966"), "+905321112233");
    // cannot be made international: too short, too long, or no country to go by
    assert.equal(normalizePhone("12345", "966"), "");
    assert.equal(normalizePhone("1234567890123456", "966"), "");
    assert.equal(normalizePhone("0501234567", ""), "");
    assert.equal(normalizePhone("966501234567", ""), "+966501234567");
    assert.equal(normalizePhone("n/a", "966"), "");
});

it("websites", () => {
    assert.equal(cleanWebsite("www.clinic.sa"), "https://www.clinic.sa");
    assert.equal(cleanWebsite("http://clinic.sa/ar"), "http://clinic.sa/ar");
    assert.equal(cleanWebsite("عيادة.سعودية"), "https://عيادة.سعودية");
    assert.equal(cleanWebsite("not a site"), "");
    assert.equal(cleanWebsite("لا يوجد"), "");
    assert.equal(cleanWebsite(""), "");
});

const header = ["name", "phone", "email", "website", "city", "country"];
const map: Mapping = { name: 0, phone: 1, email: 2, website: 3, city: 4, country: 5 };

it("a good row is added with cleaned fields", () => {
    const p = planImport([["  عيادة   الأمل ", "0501234567", "Info@Amal.example", "amal.example", "الرياض", ""]], map, "Saudi Arabia", none);
    assert.deepEqual(p.add, [{ name: "عيادة الأمل", phone: "+966501234567", email: "info@amal.example", website: "https://amal.example", country: "Saudi Arabia", city: "الرياض", notes: "" }]);
    assert.deepEqual(p.skipped, []);
    assert.deepEqual(p.warnings, []);
    // a country in the row beats the default, and decides the dialling code
    const t = planImport([["Klinik", "0532 111 22 33", "", "", "Istanbul", "Türkiye"]], map, "Saudi Arabia", none);
    assert.equal(t.add[0].phone, "+905321112233");
    assert.equal(t.add[0].country, "Türkiye");
});

it("rows that cannot be used are skipped with a reason and the file's line number", () => {
    const rows = [
        ["", "0501234567", "", "", "", ""], // line 2: no name
        ["Clinic A", "", "", "", "", ""], // line 3: no contact
        ["Clinic B", "123", "bad", "not a site", "", ""], // line 4: everything invalid
        ["Clinic C", "0501234567", "", "", "", ""], // line 5: fine
    ];
    const p = planImport(rows, map, "Saudi Arabia", none);
    assert.deepEqual(p.skipped.map((s) => [s.line, s.reason]), [[2, "بلا اسم"], [3, "لا رقم ولا إيميل ولا موقع صالح"], [4, "لا رقم ولا إيميل ولا موقع صالح"]]);
    assert.deepEqual(p.add.map((c) => c.name), ["Clinic C"]);
    // row B produced three warnings before being skipped; a kept row with one bad cell warns but stays
    const k = planImport([["Clinic D", "0501234567", "bad-email", "", "", ""]], map, "Saudi Arabia", none);
    assert.equal(k.add.length, 1);
    assert.equal(k.add[0].email, "");
    assert.deepEqual(k.warnings.map((w) => w.line), [2]);
});

it("duplicates: inside the file and against what is already saved", () => {
    const rows = [
        ["Clinic A", "0501234567", "", "a.example", "", ""],
        ["A again, same phone other format", "+966 50 123 4567", "", "", "", ""],
        ["A again, same site", "", "", "https://www.a.example/ar", "", ""],
        ["Clinic B", "", "b@b.example", "", "", ""],
        ["B again, same email", "", "B@b.example", "", "", ""],
        ["C already saved by domain", "", "", "c.example", "", ""],
        ["D already saved by phone", "0509998888", "", "", "", ""],
        ["E already saved by email", "", "e@e.example", "", "", ""],
        ["Clinic F", "0500000001", "", "", "", ""],
    ];
    const existing: Existing = { domains: new Set(["c.example"]), phones: new Set(["966509998888"]), emails: new Set(["e@e.example"]) };
    const p = planImport(rows, map, "Saudi Arabia", existing);
    assert.deepEqual(p.add.map((c) => c.name), ["Clinic A", "Clinic B", "Clinic F"]);
    assert.deepEqual(p.skipped.map((s) => [s.line, s.reason]), [
        [3, "مكررة في الملف"], [4, "مكررة في الملف"], [6, "مكررة في الملف"], [7, "موجودة في قاعدتك"], [8, "موجودة في قاعدتك"], [9, "موجودة في قاعدتك"],
    ]);
});

it("an email cell with several addresses takes the first valid one; the row limit is enforced", () => {
    const p = planImport([["Clinic A", "", "bad; first@x.example, second@x.example", "", "", ""]], map, "", none);
    assert.equal(p.add[0].email, "first@x.example");
    const many = Array.from({ length: MAX_ROWS + 20 }, (_, i) => [`Clinic ${i}`, `05012${String(i).padStart(5, "0")}`, "", "", "", ""]);
    const big = planImport(many, map, "Saudi Arabia", none);
    assert.equal(big.add.length, MAX_ROWS);
    assert.equal(big.tooMany, true);
    assert.equal(planImport(many.slice(0, 10), map, "Saudi Arabia", none).tooMany, false);
});

it("a file with only some columns works; unmapped columns are ignored", () => {
    const p = planImport([["Clinic X", "ignored", "0501234567"]], { name: 0, phone: 2 }, "Saudi Arabia", none);
    assert.deepEqual(p.add, [{ name: "Clinic X", phone: "+966501234567", email: "", website: "", country: "Saudi Arabia", city: "", notes: "" }]);
    void header;
});

console.log(`\n${passed} checks passed`);
