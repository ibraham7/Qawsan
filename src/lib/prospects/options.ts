// Option lists for the prospect filters. Values stay in English (they are what is stored);
// labels are Arabic where the value is ours (stages, statuses), English where it is a
// technical or industry term.

import type { Filters, IncExc } from "./types.ts";

export const EMPTY_IE: IncExc = { inc: [], exc: [] };

export interface Opt {
    value: string;
    label: string;
}

const same = (values: string[]): Opt[] => values.map((v) => ({ value: v, label: v }));

export const SENIORITY = same([
    "Owner", "Founder", "C-Suite", "Partner", "VP", "Head", "Director", "Manager", "Senior", "Entry", "Intern",
]);

export const DEPARTMENTS = same([
    "Marketing", "Sales", "Engineering", "IT", "HR", "Finance", "Operations", "Legal", "Customer Service",
    "Design", "Product", "Management", "Education", "Healthcare", "Other",
]);

export const EMAIL_STATUS: Opt[] = [
    { value: "verified", label: "Verified · مؤكد" },
    { value: "unverified", label: "Unverified · غير مؤكد" },
    { value: "likely", label: "Likely to Engage · مرجّح التفاعل" },
    { value: "unavailable", label: "Unavailable · غير متوفر" },
];

export const PHONE_STATUS: Opt[] = [
    { value: "mobile", label: "يوجد رقم جوال" },
    { value: "direct", label: "يوجد رقم مباشر" },
    { value: "none", label: "غير متوفر" },
];

export const LANGUAGES = same([
    "Arabic", "English", "Turkish", "French", "German", "Spanish", "Urdu", "Hindi", "Persian", "Russian", "Chinese",
]);

export const JOB_CHANGE: Opt[] = [
    { value: "30d", label: "خلال 30 يومًا" },
    { value: "60d", label: "خلال 60 يومًا" },
    { value: "90d", label: "خلال 90 يومًا" },
    { value: "6m", label: "خلال 6 أشهر" },
    { value: "1y", label: "خلال سنة" },
];

export const SINCE: Opt[] = [
    { value: "30d", label: "آخر 30 يومًا" },
    { value: "90d", label: "آخر 90 يومًا" },
    { value: "6m", label: "آخر 6 أشهر" },
    { value: "1y", label: "آخر سنة" },
    { value: "2y", label: "آخر سنتين" },
];

export const VISIT_PERIODS: Opt[] = [
    { value: "7d", label: "آخر 7 أيام" },
    { value: "30d", label: "آخر 30 يومًا" },
    { value: "90d", label: "آخر 90 يومًا" },
];

/** employee bands: value -> [min, max] (max null = no upper bound) */
export const EMPLOYEE_BANDS: Record<string, [number, number | null]> = {
    "1-10": [1, 10],
    "11-20": [11, 20],
    "21-50": [21, 50],
    "51-100": [51, 100],
    "101-200": [101, 200],
    "201-500": [201, 500],
    "501-1000": [501, 1000],
    "1001-2000": [1001, 2000],
    "2001-5000": [2001, 5000],
    "5001-10000": [5001, 10000],
    "10000+": [10001, null],
};

const M = 1_000_000;
/** annual revenue bands in USD */
export const REVENUE_BANDS: Record<string, [number, number | null]> = {
    "<$1M": [0, M - 1],
    "$1M-$10M": [M, 10 * M - 1],
    "$10M-$50M": [10 * M, 50 * M - 1],
    "$50M-$100M": [50 * M, 100 * M - 1],
    "$100M-$500M": [100 * M, 500 * M - 1],
    "$500M-$1B": [500 * M, 1000 * M - 1],
    "$1B+": [1000 * M, null],
};

export const FUNDING_TYPES = same([
    "Seed", "Angel", "Series A", "Series B", "Series C", "Series D+", "Private Equity", "Debt", "IPO",
]);

export const INDUSTRIES = same([
    "Software", "IT Services", "Marketing & Advertising", "E-commerce", "Retail", "Wholesale & Distribution",
    "Manufacturing", "Construction", "Real Estate", "Healthcare", "Hospitals & Clinics", "Dental", "Pharmaceuticals",
    "Education", "Financial Services", "Banking", "Insurance", "Legal Services", "Consulting", "Logistics",
    "Food & Beverages", "Restaurants", "Hospitality", "Travel & Tourism", "Automotive", "Beauty & Cosmetics",
    "Fashion & Apparel", "Media", "Telecommunications", "Energy", "Oil & Gas", "Government", "Non-profit",
]);

export const TECHNOLOGIES = same([
    "Shopify", "Salla", "Zid", "WordPress", "WooCommerce", "Magento", "Wix", "Squarespace", "Webflow",
    "Google Ads", "Meta Pixel", "TikTok Pixel", "Google Analytics", "Google Tag Manager", "HubSpot", "Salesforce",
    "Zoho", "Odoo", "Mailchimp", "Intercom", "Zendesk", "Stripe", "Tap Payments", "HyperPay", "Cloudflare",
    "React", "Next.js", "Vue.js", "Laravel",
]);

export const INTENT_TOPICS = same([
    "Website Development", "E-commerce", "CRM", "ERP", "Mobile Apps", "Digital Marketing", "SEO", "Branding",
    "UI/UX Design", "Cloud Hosting", "Marketing Automation",
]);

export const INTENT_LEVELS: Opt[] = [
    { value: "high", label: "High · عالية" },
    { value: "medium", label: "Medium · متوسطة" },
    { value: "low", label: "Low · منخفضة" },
];

export const SIGNALS: Opt[] = [
    { value: "funding", label: "تمويل جديد" },
    { value: "hiring", label: "توظيف مكثّف" },
    { value: "new_exec", label: "تعيين إداري جديد" },
    { value: "new_branch", label: "افتتاح فرع" },
    { value: "news", label: "أخبار" },
];

/** lead score grades -> [min, max] */
export const SCORE_GRADES: Record<string, [number, number]> = {
    excellent: [80, 100],
    good: [60, 79],
    fair: [40, 59],
    poor: [0, 39],
};
export const SCORE_GRADE_OPTS: Opt[] = [
    { value: "excellent", label: "Excellent · ممتاز (80+)" },
    { value: "good", label: "Good · جيد (60-79)" },
    { value: "fair", label: "Fair · مقبول (40-59)" },
    { value: "poor", label: "Poor · ضعيف (<40)" },
];

export const CONTACT_STAGES: Opt[] = [
    { value: "cold", label: "Cold · بارد" },
    { value: "new", label: "New · جديد" },
    { value: "approaching", label: "Approaching · قيد التواصل" },
    { value: "replied", label: "Replied · ردّ" },
    { value: "interested", label: "Interested · مهتم" },
    { value: "not_interested", label: "Not Interested · غير مهتم" },
    { value: "unresponsive", label: "Unresponsive · لا يستجيب" },
    { value: "do_not_contact", label: "Do Not Contact · لا تتواصل" },
    { value: "bad_data", label: "Bad Data · بيانات خاطئة" },
    { value: "changed_job", label: "Changed Job · غيّر وظيفته" },
];

export const ACCOUNT_STAGES: Opt[] = [
    { value: "cold", label: "Cold · بارد" },
    { value: "prospect", label: "Prospect · محتمل" },
    { value: "current_client", label: "Current Client · عميل حالي" },
    { value: "churned", label: "Churned · عميل سابق" },
    { value: "competitor", label: "Competitor · منافس" },
    { value: "other", label: "Other · أخرى" },
];

export const EXCLUSIONS: Opt[] = [
    { value: "contacted", label: "استثنِ من تم التواصل معهم" },
    { value: "in_crm", label: "استثنِ الموجودين في CRM" },
    { value: "saved", label: "استثنِ المحفوظين مسبقًا" },
];

export const SEQUENCE_MODES: Opt[] = [
    { value: "in_any", label: "موجود في أي حملة" },
    { value: "in_none", label: "غير موجود في أي حملة" },
    { value: "in", label: "موجود في الحملات المحددة" },
    { value: "not_in", label: "غير موجود في الحملات المحددة" },
];

export const CONTACT_DATA: Opt[] = [
    { value: "phone", label: "لديه رقم هاتف" },
    { value: "mobile", label: "رقم جوال (واتساب محتمل)" },
    { value: "website", label: "لديها موقع" },
    { value: "email", label: "لديها إيميل" },
    { value: "whatsapp", label: "لديها واتساب" },
];

/** review status of a discovered company; `manual` = the admin may set it by hand */
export const STATUSES: (Opt & { color: "default" | "primary" | "success" | "warning" | "error" | "info" | "secondary"; manual: boolean })[] = [
    { value: "new", label: "مكتشف حديثًا", color: "info", manual: true },
    { value: "review", label: "يحتاج مراجعة", color: "warning", manual: true },
    { value: "qualified", label: "مؤهل", color: "primary", manual: true },
    { value: "not_fit", label: "غير مناسب", color: "default", manual: true },
    { value: "approved", label: "معتمد للتواصل", color: "success", manual: true },
    { value: "contacted", label: "تم التواصل", color: "secondary", manual: false },
    { value: "replied", label: "ردّ على الرسالة", color: "primary", manual: false },
    { value: "interested", label: "مهتم", color: "success", manual: false },
    { value: "not_interested", label: "غير مهتم", color: "default", manual: false },
    { value: "converted", label: "نُقل إلى العملاء المحتملين", color: "success", manual: false },
    { value: "unsubscribed", label: "ألغى الاشتراك", color: "error", manual: false },
    { value: "invalid", label: "غير صالح", color: "error", manual: true },
];
export const statusOf = (v: string) => STATUSES.find((s) => s.value === v) ?? STATUSES[0];

export const GROWTH_PERIODS: Opt[] = [
    { value: "6m", label: "6 أشهر" },
    { value: "12m", label: "سنة" },
    { value: "24m", label: "سنتان" },
];

/** cities known to the radius filter, with their region and country */
export interface City {
    name: string;
    region: string;
    country: string;
    lat: number;
    lng: number;
}

export const CITIES: City[] = [
    { name: "Riyadh", region: "Riyadh Province", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753 },
    { name: "Jeddah", region: "Makkah Province", country: "Saudi Arabia", lat: 21.4858, lng: 39.1925 },
    { name: "Mecca", region: "Makkah Province", country: "Saudi Arabia", lat: 21.3891, lng: 39.8579 },
    { name: "Medina", region: "Madinah Province", country: "Saudi Arabia", lat: 24.5247, lng: 39.5692 },
    { name: "Dammam", region: "Eastern Province", country: "Saudi Arabia", lat: 26.4207, lng: 50.0888 },
    { name: "Khobar", region: "Eastern Province", country: "Saudi Arabia", lat: 26.2172, lng: 50.1971 },
    { name: "Dubai", region: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
    { name: "Abu Dhabi", region: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lng: 54.3773 },
    { name: "Sharjah", region: "Sharjah", country: "United Arab Emirates", lat: 25.3463, lng: 55.4209 },
    { name: "Doha", region: "Doha", country: "Qatar", lat: 25.2854, lng: 51.531 },
    { name: "Kuwait City", region: "Capital", country: "Kuwait", lat: 29.3759, lng: 47.9774 },
    { name: "Manama", region: "Capital", country: "Bahrain", lat: 26.2285, lng: 50.586 },
    { name: "Muscat", region: "Muscat", country: "Oman", lat: 23.588, lng: 58.3829 },
    { name: "Cairo", region: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
    { name: "Alexandria", region: "Alexandria", country: "Egypt", lat: 31.2001, lng: 29.9187 },
    { name: "Amman", region: "Amman", country: "Jordan", lat: 31.9454, lng: 35.9284 },
    { name: "Istanbul", region: "Istanbul", country: "Türkiye", lat: 41.0082, lng: 28.9784 },
    { name: "Ankara", region: "Ankara", country: "Türkiye", lat: 39.9334, lng: 32.8597 },
    { name: "Izmir", region: "Izmir", country: "Türkiye", lat: 38.4237, lng: 27.1428 },
    { name: "Gaziantep", region: "Gaziantep", country: "Türkiye", lat: 37.0662, lng: 37.3833 },
    { name: "Damascus", region: "Damascus", country: "Syria", lat: 33.5138, lng: 36.2765 },
    { name: "Aleppo", region: "Aleppo", country: "Syria", lat: 36.2021, lng: 37.1343 },
    { name: "Beirut", region: "Beirut", country: "Lebanon", lat: 33.8938, lng: 35.5018 },
    { name: "Baghdad", region: "Baghdad", country: "Iraq", lat: 33.3152, lng: 44.3661 },
    { name: "Erbil", region: "Erbil", country: "Iraq", lat: 36.1901, lng: 44.0091 },
];

const uniq = (a: string[]) => [...new Set(a)];
export const COUNTRIES = same(uniq(CITIES.map((c) => c.country)));
export const REGIONS = same(uniq(CITIES.map((c) => c.region)));
export const CITY_OPTS = same(CITIES.map((c) => c.name));

/**
 * "include similar titles": each group lists titles that mean the same job.
 * A title that matches one entry also matches the others in its group.
 */
export const TITLE_SYNONYMS: string[][] = [
    ["CEO", "Chief Executive Officer", "Managing Director", "General Manager", "المدير التنفيذي", "الرئيس التنفيذي", "المدير العام"],
    ["CMO", "Chief Marketing Officer", "Head of Marketing", "Marketing Director", "VP Marketing", "مدير التسويق"],
    ["CTO", "Chief Technology Officer", "Head of Engineering", "VP Engineering", "Technical Director", "المدير التقني"],
    ["CFO", "Chief Financial Officer", "Finance Director", "Head of Finance", "المدير المالي"],
    ["COO", "Chief Operating Officer", "Operations Director", "Head of Operations", "مدير العمليات"],
    ["Owner", "Founder", "Co-Founder", "Co-founder", "المالك", "المؤسس"],
    ["Sales Manager", "Head of Sales", "Sales Director", "VP Sales", "مدير المبيعات"],
    ["HR Manager", "Head of HR", "HR Director", "People Manager", "مدير الموارد البشرية"],
    ["IT Manager", "Head of IT", "IT Director", "مدير تقنية المعلومات"],
];

/** periods ("30d", "6m", "1y") -> ISO timestamp that far before `now` */
export function since(period: string, now: Date): string | null {
    const m = /^(\d+)([dmy])$/.exec(period);
    if (!m) return null;
    const n = Number(m[1]);
    const d = new Date(now.getTime());
    if (m[2] === "d") d.setUTCDate(d.getUTCDate() - n);
    if (m[2] === "m") d.setUTCMonth(d.getUTCMonth() - n);
    if (m[2] === "y") d.setUTCFullYear(d.getUTCFullYear() - n);
    return d.toISOString();
}

export interface Preset {
    id: string;
    name: string;
    tab: "people" | "companies";
    filters: Filters;
}

export const PRESETS: Preset[] = [
    {
        id: "qawsan-sa",
        name: "عملاء قوسان - السعودية",
        tab: "people",
        filters: {
            personLocation: {
                countries: { inc: ["Saudi Arabia"], exc: [] },
                cities: { inc: ["Riyadh", "Jeddah", "Dammam"], exc: [] },
            },
            seniority: { inc: ["Owner", "Founder", "C-Suite", "Director"], exc: [] },
            departments: { inc: ["Marketing", "Management"], exc: [] },
            employees: { presets: ["11-20", "21-50", "51-100", "101-200"] },
            emailStatus: ["verified"],
        },
    },
];
