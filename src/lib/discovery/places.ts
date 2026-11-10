// Google Places (New) Text Search: request building and mapping a place to a company row.
// No runtime imports, so the Vercel function (ESM, per-file) and the browser can both use it.

export type Lang = "ar" | "en" | "tr";

export interface SearchInput {
    type: string;
    keywords: string;
    country: string;
    city: string;
    language: Lang;
    minRating: number | null;
    max: 20 | 40 | 60;
}

export interface CityRef {
    name: string;
    region: string;
    country: string;
    lat: number;
    lng: number;
}

/** returns the cleaned input, or an Arabic error message */
export function validateInput(o: unknown): SearchInput | string {
    if (!o || typeof o !== "object") return "طلب غير صالح.";
    const b = o as Record<string, unknown>;
    const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const type = s(b.type, 120);
    if (type.length < 2) return "اكتب نوع النشاط (مثل: عيادات أسنان).";
    const language: Lang = b.language === "en" || b.language === "tr" ? b.language : "ar";
    const max = b.max === 40 || b.max === 60 ? b.max : 20;
    const mr = typeof b.minRating === "number" && b.minRating > 0 && b.minRating <= 5 ? Math.round(b.minRating * 2) / 2 : null;
    return { type, keywords: s(b.keywords, 200), country: s(b.country, 80), city: s(b.city, 80), language, minRating: mr, max };
}

export const pagesFor = (max: number) => Math.ceil(max / 20);

export function textQuery(i: SearchInput): string {
    const what = [i.type, i.keywords].filter(Boolean).join(" ");
    const where = [i.city, i.country].filter(Boolean).join(", ");
    return where ? `${what} in ${where}` : what;
}

/** fields we ask Google for; this also decides which Places SKU is billed */
export const FIELD_MASK = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.addressComponents",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.internationalPhoneNumber",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.googleMapsUri",
    "places.types",
    "places.primaryType",
    "nextPageToken",
].join(",");

export function requestBody(i: SearchInput, center: { lat: number; lng: number } | null, pageToken?: string) {
    const body: Record<string, unknown> = { textQuery: textQuery(i), languageCode: i.language, pageSize: 20 };
    if (i.minRating) body.minRating = i.minRating;
    if (center) body.locationBias = { circle: { center: { latitude: center.lat, longitude: center.lng }, radius: 30000 } };
    if (pageToken) body.pageToken = pageToken;
    return body;
}

export interface GooglePlace {
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    addressComponents?: { longText?: string; shortText?: string; types?: string[] }[];
    location?: { latitude?: number; longitude?: number };
    rating?: number;
    userRatingCount?: number;
    internationalPhoneNumber?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    googleMapsUri?: string;
    types?: string[];
    primaryType?: string;
}

/** Google place type -> our industry list (English values, used by the industry filter) */
const INDUSTRY_BY_TYPE: Record<string, string> = {
    dentist: "Dental",
    dental_clinic: "Dental",
    doctor: "Hospitals & Clinics",
    hospital: "Hospitals & Clinics",
    medical_clinic: "Hospitals & Clinics",
    medical_lab: "Hospitals & Clinics",
    physiotherapist: "Hospitals & Clinics",
    pharmacy: "Pharmaceuticals",
    drugstore: "Pharmaceuticals",
    restaurant: "Restaurants",
    cafe: "Restaurants",
    coffee_shop: "Restaurants",
    bakery: "Food & Beverages",
    meal_takeaway: "Restaurants",
    meal_delivery: "Restaurants",
    real_estate_agency: "Real Estate",
    lawyer: "Legal Services",
    accounting: "Financial Services",
    bank: "Banking",
    insurance_agency: "Insurance",
    car_dealer: "Automotive",
    car_repair: "Automotive",
    car_rental: "Automotive",
    beauty_salon: "Beauty & Cosmetics",
    hair_salon: "Beauty & Cosmetics",
    spa: "Beauty & Cosmetics",
    clothing_store: "Fashion & Apparel",
    shoe_store: "Fashion & Apparel",
    jewelry_store: "Fashion & Apparel",
    school: "Education",
    primary_school: "Education",
    secondary_school: "Education",
    university: "Education",
    lodging: "Hospitality",
    hotel: "Hospitality",
    travel_agency: "Travel & Tourism",
    moving_company: "Logistics",
    storage: "Logistics",
    electronics_store: "Retail",
    furniture_store: "Retail",
    home_goods_store: "Retail",
    supermarket: "Retail",
    grocery_store: "Retail",
    store: "Retail",
    general_contractor: "Construction",
    electrician: "Construction",
    plumber: "Construction",
    marketing_agency: "Marketing & Advertising",
    advertising_agency: "Marketing & Advertising",
    consultant: "Consulting",
    corporate_office: "Consulting",
    manufacturer: "Manufacturing",
    wholesaler: "Wholesale & Distribution",
};

export function industryFor(types: string[], primary?: string): string {
    for (const t of [primary, ...types]) if (t && INDUSTRY_BY_TYPE[t]) return INDUSTRY_BY_TYPE[t];
    return "";
}

export function normDomain(url: string): string {
    return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[/?#].*$/, "");
}

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const r = Math.PI / 180;
    const x = (b.lng - a.lng) * r * Math.cos(((a.lat + b.lat) / 2) * r);
    const y = (b.lat - a.lat) * r;
    return Math.sqrt(x * x + y * y) * 6371;
}

const countryName = (code: string) => {
    try {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ?? code;
    } catch {
        return code;
    }
};

/**
 * Company row for a place. Country is always the English name (from the ISO code) and the
 * city/region use our English gazetteer when the place lies within 40 km of a known city,
 * so the location filters work whatever language the search used.
 */
export function toCompany(p: GooglePlace, ctx: { cities: CityRef[]; searchId: string; query: string }) {
    const comp = (type: string) => p.addressComponents?.find((c) => c.types?.includes(type));
    const lat = p.location?.latitude ?? null;
    const lng = p.location?.longitude ?? null;
    let city = comp("locality")?.longText ?? comp("postal_town")?.longText ?? comp("administrative_area_level_2")?.longText ?? "";
    let region = comp("administrative_area_level_1")?.longText ?? "";
    const code = comp("country")?.shortText ?? "";
    let country = code ? countryName(code) : comp("country")?.longText ?? "";
    if (lat !== null && lng !== null) {
        let best: CityRef | null = null;
        let bestKm = 40;
        for (const c of ctx.cities) {
            const d = km({ lat, lng }, c);
            if (d < bestKm) {
                best = c;
                bestKm = d;
            }
        }
        if (best) {
            city = best.name;
            region = best.region;
            country = best.country;
        }
    }
    const website = p.websiteUri ?? "";
    const types = (p.types ?? []).slice(0, 12);
    return {
        google_place_id: p.id,
        name: (p.displayName?.text ?? "").slice(0, 200) || "—",
        website: website.slice(0, 500),
        domain: website ? normDomain(website).slice(0, 200) : "",
        phone: (p.internationalPhoneNumber ?? p.nationalPhoneNumber ?? "").slice(0, 40),
        address: (p.formattedAddress ?? "").slice(0, 500),
        google_maps_url: (p.googleMapsUri ?? "").slice(0, 500),
        hq_country: country,
        hq_region: region,
        hq_city: city,
        hq_lat: lat,
        hq_lng: lng,
        rating: typeof p.rating === "number" ? p.rating : null,
        rating_count: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
        place_types: types,
        industry: industryFor(types, p.primaryType),
        keywords: [ctx.query.toLowerCase().slice(0, 80)],
        search_id: ctx.searchId,
        source: "google_places",
    };
}
