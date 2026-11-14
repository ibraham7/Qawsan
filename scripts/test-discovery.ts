// Checks for Google Places mapping, contact extraction and the internal-address guard.
// Run: node scripts/test-discovery.ts
import assert from "node:assert/strict";

import { dialFor, extractContacts, isPrivateAddress, merge, toIntlMobile } from "../src/lib/discovery/extract.ts";
import { FIELD_MASK, phoneKind, requestBody, textQuery, toCompany, validateInput } from "../src/lib/discovery/places.ts";
import type { GooglePlace, SearchInput } from "../src/lib/discovery/places.ts";
import { CITIES } from "../src/lib/prospects/options.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

it("input validation", () => {
    assert.equal(typeof validateInput({ type: "x" }), "string");
    const v = validateInput({ type: " عيادات أسنان ", city: "Riyadh", country: "Saudi Arabia", max: 40, minRating: 4.3, language: "xx" }) as SearchInput;
    assert.equal(v.type, "عيادات أسنان");
    assert.equal(v.max, 40);
    assert.equal(v.minRating, 4.5);
    assert.equal(v.language, "ar");
    assert.equal(textQuery(v), "عيادات أسنان in Riyadh, Saudi Arabia");
    const b = requestBody(v, { lat: 1, lng: 2 }, "tok");
    assert.equal(b.pageSize, 20);
    assert.equal(b.pageToken, "tok");
    assert.ok(FIELD_MASK.includes("nextPageToken"));
});

it("place -> company: English country/city from gazetteer, industry, domain", () => {
    const p: GooglePlace = {
        id: "ChIJ123",
        displayName: { text: "عيادة الابتسامة" },
        formattedAddress: "طريق الملك فهد، الرياض",
        addressComponents: [
            { longText: "الرياض", shortText: "الرياض", types: ["locality"] },
            { longText: "منطقة الرياض", types: ["administrative_area_level_1"] },
            { longText: "السعودية", shortText: "SA", types: ["country"] },
        ],
        location: { latitude: 24.75, longitude: 46.7 },
        rating: 4.6,
        userRatingCount: 210,
        internationalPhoneNumber: "+966 11 000 0000",
        websiteUri: "https://www.smile-demo.example/ar/",
        types: ["dentist", "health"],
        primaryType: "dentist",
    };
    const c = toCompany(p, { cities: CITIES, searchId: "s1", query: "Dentists" });
    assert.equal(c.hq_country, "Saudi Arabia");
    assert.equal(c.hq_city, "Riyadh");
    assert.equal(c.hq_region, "Riyadh Province");
    assert.equal(c.industry, "Dental");
    assert.equal(c.domain, "smile-demo.example");
    assert.equal(c.rating, 4.6);
    assert.equal(c.source, "google_places");
    assert.deepEqual(c.keywords, ["dentists"]);
});

it("place far from known cities keeps Google's names and ISO country", () => {
    const c = toCompany(
        { id: "x", displayName: { text: "A" }, addressComponents: [{ longText: "Konya", types: ["locality"] }, { shortText: "TR", types: ["country"] }], location: { latitude: 37.87, longitude: 32.48 } },
        { cities: CITIES, searchId: "s", query: "q" }
    );
    assert.equal(c.hq_city, "Konya");
    assert.ok(["Türkiye", "Turkey"].includes(c.hq_country), c.hq_country);
});

it("contact extraction from html", () => {
    const html = `
      <a href="mailto:Info@Clinic-Demo.example?subject=hi">mail</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=x">share</a>
      <a href="https://m.facebook.com/clinicdemo/">fb</a>
      <a href="https://instagram.com/clinic.demo">ig</a>
      <a href="https://wa.me/966500000000">wa</a>
      <a href="/ar/contact-us">تواصل معنا</a>
      <img src="logo@2x.png"> sales&#64;clinic-demo.example
      <script>var x="bot@sentry.io"</script>`;
    const r = extractContacts(html, "https://clinic-demo.example/ar/");
    assert.deepEqual(r.emails.sort(), ["info@clinic-demo.example", "sales@clinic-demo.example"]);
    assert.equal(r.socials.facebook, "https://www.facebook.com/clinicdemo");
    assert.equal(r.socials.instagram, "https://instagram.com/clinic.demo");
    assert.equal(r.whatsapp, "+966500000000");
    assert.deepEqual(r.contactLinks, ["https://clinic-demo.example/ar/contact-us"]);
    const m = merge(r, { emails: ["x@clinic-demo.example"], socials: { linkedin: "l" }, whatsapp: "", contactLinks: [], followLinks: [] });
    assert.equal(m.emails.length, 3);
    assert.equal(m.socials.linkedin, "l");
});

it("template placeholder emails are ignored, real ones kept", () => {
    const html = `<a href="mailto:youremail@gmail.com">x</a> <a href="mailto:name@domain.com">y</a> user@site.com <a href="mailto:info@real-clinic.sa">z</a> test@x.com`;
    assert.deepEqual(extractContacts(html, "https://real-clinic.sa/").emails, ["info@real-clinic.sa"]);
});

it("WhatsApp: whatsapp:// links and a number in a script next to a WhatsApp mention", () => {
    const base = "https://clinic-demo.example/";
    assert.equal(extractContacts('<a href="whatsapp://send?phone=966501112222&text=hi">x</a>', base).whatsapp, "+966501112222");
    assert.equal(extractContacts('<a href="whatsapp://send?text=hi">no number</a>', base).whatsapp, "");
    // the case seen on a real clinic site: the link is built in the browser from a variable
    const script = `<script>var WA='966543469969',L='ar'; function wa(m){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(m)}</script>`;
    assert.equal(extractContacts(script, base).whatsapp, "+966543469969");
    assert.equal(extractContacts(`<script>const WA = "+971500000007"; // open WhatsApp chat</script>`, base).whatsapp, "+971500000007");
    // a regular link still wins over the script heuristic
    assert.equal(extractContacts(`<a href="https://wa.me/966501110000">w</a>${script}`, base).whatsapp, "+966501110000");
});

it("WhatsApp: no number is invented", () => {
    const base = "https://clinic-demo.example/";
    // a number with no WhatsApp mention anywhere
    assert.equal(extractContacts(`<script>var phone='966543469969';</script>`, base).whatsapp, "");
    // the mention is far away from the number
    const far = `<p>Chat with us on WhatsApp</p>${"<div>x</div>".repeat(200)}<script>var tel='966543469969';</script>`;
    assert.equal(extractContacts(far, base).whatsapp, "");
    // plain digits in text right after the word are now read (see the "next to the word" check)
    assert.equal(extractContacts(`<p>WhatsApp: 966543469969</p>`, base).whatsapp, "+966543469969");
    // a quoted number that is too short or not from a country we work with
    assert.equal(extractContacts(`<script>var a='9661234'; var b='15551234567'; // whatsapp</script>`, base).whatsapp, "");
});

it("WhatsApp: a number written in the page text next to the word", () => {
    const base = "https://clinic-demo.example/";
    assert.equal(extractContacts("<p>للتواصل عبر واتساب: 0501234567</p>", base, "966").whatsapp, "+966501234567");
    assert.equal(extractContacts("<div>WhatsApp <b>+966 50 123 4567</b></div>", base).whatsapp, "+966501234567");
    assert.equal(extractContacts("<p>واتساب 00966501234567</p>", base).whatsapp, "+966501234567");
    assert.equal(extractContacts("<p>Tel 011 123 4567 | WhatsApp 0551112233</p>", base, "966").whatsapp, "+966551112233");
    assert.equal(extractContacts("<p>WhatsApp: 0532 111 22 33</p>", base, "90").whatsapp, "+905321112233");
    // a landline next to the word is not a WhatsApp number; no country means no guessing at local numbers
    assert.equal(extractContacts("<p>واتساب 0111234567</p>", base, "966").whatsapp, "");
    assert.equal(extractContacts("<p>واتساب 0501234567</p>", base).whatsapp, "");
    // a mobile number with no WhatsApp word near it is not claimed
    assert.equal(extractContacts("<p>اتصل بنا 0501234567</p>", base, "966").whatsapp, "");
});

it("short WhatsApp links and link-in-bio pages are queued; mobile number normalising", () => {
    const r = extractContacts('<a href="https://wa.link/abc123">chat</a> <a href="https://linktr.ee/clinic">links</a> <a href="https://x.example/y">z</a>', "https://clinic-demo.example/");
    assert.deepEqual(r.followLinks, ["https://wa.link/abc123", "https://linktr.ee/clinic"]);
    assert.equal(toIntlMobile("05 0123 4567", "966"), "+966501234567");
    assert.equal(toIntlMobile("0501234567", "971"), "+971501234567");
    assert.equal(toIntlMobile("966501234567"), "+966501234567");
    assert.equal(toIntlMobile("0123456789", "966"), "");
    assert.equal(dialFor("Saudi Arabia"), "966");
    assert.equal(dialFor("Türkiye"), "90");
    assert.equal(dialFor("Nowhere"), "");
});

it("internal addresses are refused", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.20.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "224.0.0.1"]) {
        assert.equal(isPrivateAddress(ip), true, ip);
    }
    for (const ip of ["8.8.8.8", "104.18.2.3", "172.32.0.1", "2606:4700::1111"]) assert.equal(isPrivateAddress(ip), false, ip);
});

it("mobile vs landline", () => {
    const cases: [string, string][] = [
        ["+90 545 164 51 77", "mobile"], ["+90 212 555 00 00", "landline"], ["+966 50 123 4567", "mobile"], ["+966 11 123 4567", "landline"],
        ["00971 50 000 0000", "mobile"], ["+974 3300 0000", "mobile"], ["+974 4400 0000", "landline"], ["+20 10 0000 0000", "mobile"],
        ["+961 71 000 000", "mobile"], ["+961 1 000 000", "landline"], ["0532 000 00 00", ""], ["+1 415 000 0000", ""],
    ];
    for (const [n, want] of cases) assert.equal(phoneKind(n), want, n);
});

console.log(`\n${passed} checks passed`);
