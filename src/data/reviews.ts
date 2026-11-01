import type { Locale } from "../i18n/locales";

/**
 * Customer reviews.
 *
 * Add real reviews to REVIEWS (a customer's own words, their real rating, a name and role
 * they agreed to show). The reviews section, the overall rating and the "client satisfaction"
 * figure in the numbers band all read from this list and appear as soon as it has entries.
 *
 * SAMPLE_REVIEWS exist only to preview the layout (add ?demo to the address of the home page,
 * or run the dev server). They are never shown to visitors, because invented reviews on a
 * business website mislead customers.
 */
export interface Review {
    id: string;
    name: string;
    /** job title / company / city, as the customer wants it shown */
    role: string;
    /** 1–5 */
    rating: number;
    /** the customer's words; give one language and it is shown everywhere, or translate it */
    text: Partial<Record<Locale, string>>;
}

export const REVIEWS: Review[] = [];

export const SAMPLE_REVIEWS: Review[] = [
    {
        id: "s1",
        name: "عميل تجريبي ١",
        role: "عيادة أسنان",
        rating: 5,
        text: {
            ar: "تجربة ممتازة من أول اجتماع. فهموا طريقة عمل العيادة وصمّموا النظام حولها، والمواعيد أصبحت منظّمة تمامًا.",
            en: "A great experience from the first meeting. They understood how the clinic works and built the system around it, and appointments are now perfectly organised.",
            tr: "İlk toplantıdan itibaren harika bir deneyim. Kliniğin çalışma şeklini anlayıp sistemi ona göre kurdular; randevular artık mükemmel şekilde düzenli.",
        },
    },
    {
        id: "s2",
        name: "عميل تجريبي ٢",
        role: "متجر إلكتروني",
        rating: 5,
        text: {
            ar: "رأيت التصميم كاملًا قبل البرمجة ووافقت عليه، فلم تكن هناك أي مفاجآت. التسليم كان في الموعد.",
            en: "I saw the full design before development and approved it, so there were no surprises. Delivery was on time.",
            tr: "Yazılımdan önce tasarımın tamamını gördüm ve onayladım; sürpriz yaşamadım. Teslimat zamanındaydı.",
        },
    },
    {
        id: "s3",
        name: "عميل تجريبي ٣",
        role: "شركة خدمات",
        rating: 4,
        text: {
            ar: "موقعنا الآن سريع وأنيق ويظهر في البحث. التواصل مع الفريق كان واضحًا وسريعًا طوال المشروع.",
            en: "Our site is now fast, elegant and shows up in search. Communication with the team was clear and quick throughout.",
            tr: "Sitemiz artık hızlı, şık ve aramalarda çıkıyor. Ekiple iletişim proje boyunca net ve hızlıydı.",
        },
    },
    {
        id: "s4",
        name: "عميل تجريبي ٤",
        role: "منصة تعليمية",
        rating: 5,
        text: {
            ar: "بدأنا بنسخة أولى مركّزة ثم توسّعنا. أعجبني أن كل شيء عند فريق واحد: الهوية والتصميم والبرمجة.",
            en: "We started with a focused first version and then grew. I liked that everything is with one team: brand, design and development.",
            tr: "Odaklı bir ilk sürümle başlayıp büyüdük. Marka, tasarım ve yazılımın tek ekipte olması hoşuma gitti.",
        },
    },
    {
        id: "s5",
        name: "عميل تجريبي ٥",
        role: "مركز تدريب",
        rating: 5,
        text: {
            ar: "واجهة عربية حقيقية وليست ترجمة مقلوبة. الطلاب يستخدمونها بسهولة من الجوال.",
            en: "A truly Arabic interface, not a flipped translation. Students use it easily from their phones.",
            tr: "Ters çevrilmiş bir çeviri değil, gerçek bir Arapça arayüz. Öğrenciler telefondan kolayca kullanıyor.",
        },
    },
    {
        id: "s6",
        name: "عميل تجريبي ٦",
        role: "مكتب استشارات",
        rating: 4,
        text: {
            ar: "عمل منظّم واهتمام بالتفاصيل. أنصح بهم لكل من لديه فكرة ويريد تحويلها إلى منتج.",
            en: "Organised work and attention to detail. I recommend them to anyone with an idea they want to turn into a product.",
            tr: "Düzenli çalışma ve detaylara özen. Fikrini ürüne dönüştürmek isteyen herkese tavsiye ederim.",
        },
    },
];

/** the review's text in the visitor's language, falling back to whatever language it was written in */
export const reviewText = (r: Review, locale: Locale) =>
    r.text[locale] ?? r.text.ar ?? r.text.en ?? r.text.tr ?? "";

export const averageRating = (list: Review[]) =>
    list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0;

/** share of reviews that gave 4 or 5 stars, as a whole percentage */
export const satisfactionPercent = (list: Review[]) =>
    list.length ? Math.round((list.filter((r) => r.rating >= 4).length / list.length) * 100) : 0;

/**
 * The reviews to show: the real ones; or, only when previewing (?demo in the address, or the
 * dev server), the sample ones, flagged so the page can say they are samples.
 */
export function pickReviews(): { list: Review[]; demo: boolean } {
    if (REVIEWS.length) return { list: REVIEWS, demo: false };
    const previewing =
        import.meta.env.DEV ||
        (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo"));
    return previewing ? { list: SAMPLE_REVIEWS, demo: true } : { list: [], demo: false };
}
