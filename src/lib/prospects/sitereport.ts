// The content of the one-page website report that can be handed to a clinic: what was checked, what
// works, what to improve and why it matters to its patients. Built from the audit already stored on
// the company (nothing is fetched here). Confirmed problems come first and are worded as facts; the
// ones the audit only suspects are listed apart as "observations", never as facts.

import { bucket } from "../discovery/siteaudit.ts";
import { isConfirmedIssue } from "./campaigns.ts";

export interface ReportInput {
    name: string;
    website: string;
    site_score: number | null;
    site_issues: string[];
    site_checked_at: string | null;
    site_perf: number | null;
    site_seo: number | null;
    site_a11y: number | null;
    site_lcp_ms: number | null;
}

export interface Finding {
    code: string;
    title: string;
    /** what it costs the clinic, in plain words */
    why: string;
}

export interface SiteReportModel {
    score: number;
    level: "weak" | "medium" | "good";
    verdict: string;
    /** problems the audit confirmed */
    confirmed: Finding[];
    /** things the audit noticed but cannot be sure of */
    observations: Finding[];
    /** checks the site passed */
    passed: string[];
    speed: { perf: number | null; seo: number | null; a11y: number | null; lcpSeconds: number | null };
    date: string;
}

const FINDINGS: Record<string, { title: string; why: string }> = {
    noindex: { title: "الموقع محجوب عن محركات البحث", why: "لن يجد المرضى الموقع عند البحث في Google، فتضيع عليكم حجوزات تأتي بلا إعلان." },
    no_viewport: { title: "الموقع لا يتكيّف مع شاشة الجوال", why: "أغلب المرضى يبحثون عن العيادة من جوالهم. الموقع غير المتجاوب يصعّب القراءة والحجز فيغادرون إلى عيادة أخرى." },
    no_https: { title: "الموقع بلا شهادة أمان (HTTPS)", why: "يعرض المتصفح تحذير «غير آمن» للزائر، وهذا يُضعف ثقة المريض قبل أن يقرأ شيئًا، ويؤثر على ترتيب الموقع في Google." },
    slow_mobile: { title: "الموقع بطيء على الجوال (قياس Google)", why: "كلما تأخر ظهور الصفحة خسرتم نسبة من الزوار قبل أن يروا خدماتكم." },
    poor_lcp: { title: "المحتوى الرئيسي يتأخر في الظهور على الجوال", why: "ظهور الصفحة بعد أكثر من 4 ثوانٍ يجعل كثيرًا من الزوار يغادرون." },
    bad_phone_link: { title: "رابط الاتصال أو الواتساب لا يعمل", why: "المريض الراغب بالحجز لا يستطيع التواصل بضغطة واحدة، وقد لا يحاول مرة ثانية." },
    broken_links: { title: "روابط داخلية في الموقع معطّلة", why: "الزائر الذي يضغط على رابط معطّل يرى صفحة خطأ، وهذا يوحي بإهمال الموقع." },
    free_builder: { title: "الموقع على عنوان منصة مجانية", why: "العنوان يبدو أقل احترافية ويصعب تذكره، ولا يعطي انطباع عيادة موثوقة." },
    social_only: { title: "لا يوجد موقع مستقل، فقط حساب على منصة اجتماعية", why: "لا يمكن للمريض الحجز أو معرفة خدماتكم وأسعاركم بسهولة، ولا يظهر حسابكم كما يظهر موقع في نتائج Google." },
    unreachable: { title: "الموقع لا يفتح", why: "الزائر لا يصل إليكم أصلًا. قد يكون الدومين منتهيًا أو الصفحة محذوفة." },
};

const OBSERVATIONS: Record<string, { title: string; why: string }> = {
    no_booking: { title: "لم نجد حجزًا مباشرًا أو نموذج تواصل", why: "وجود حجز أو نموذج بسيط يرفع عدد المرضى الذين يكملون الطلب." },
    no_contact_action: { title: "لم نجد زر اتصال أو واتساب ظاهرًا", why: "زر واحد على الجوال يختصر خطوات كثيرة على المريض." },
    outdated: { title: "التصميم أو التقنية تبدو قديمة", why: "الشكل القديم يقلل الثقة، وقد يتعارض مع متصفحات الجوال الحديثة." },
    thin_content: { title: "محتوى الصفحة قليل", why: "الصفحة التي تشرح الخدمات والأسعار والأطباء تقنع المريض أكثر وتفيد ظهوركم في البحث." },
    seo_low: { title: "أساسيات الظهور في Google تحتاج تحسينًا", why: "تحسينها يزيد من يجدكم دون إعلانات." },
    no_title: { title: "عنوان الصفحة غير واضح", why: "هو أول ما يراه المريض في نتائج Google." },
    no_description: { title: "لا يوجد وصف يظهر في نتائج Google", why: "الوصف الجيد يقنع المريض أن يضغط على موقعكم." },
    no_h1: { title: "لا يوجد عنوان رئيسي في الصفحة", why: "يساعد الزائر ومحركات البحث على فهم موضوع الصفحة." },
    no_alt: { title: "الصور بلا وصف", why: "الوصف يساعد في البحث بالصور ويخدم ذوي الإعاقة البصرية." },
    no_sitemap: { title: "لا توجد خريطة للموقع (sitemap)", why: "تساعد Google على اكتشاف كل صفحاتكم." },
    no_structured_data: { title: "لا توجد بيانات منظمة للعيادة (Schema)", why: "تتيح لـ Google عرض عنوانكم وتقييمكم وساعات العمل مباشرة في النتائج." },
    no_lang: { title: "لغة الصفحة غير محددة", why: "تحديدها يحسّن عرض الصفحة وظهورها للجمهور الصحيح." },
    heavy: { title: "الصفحة ثقيلة", why: "الصفحات الثقيلة تبطؤ على الجوال وشبكات الإنترنت الضعيفة." },
    slow: { title: "استجابة الموقع بطيئة", why: "البطء يُخسر الزوار قبل أن يروا خدماتكم." },
};

/** the checks shown as passed when the matching problem is absent */
const PASSABLE: [string, string][] = [
    ["no_viewport", "الموقع يتكيّف مع شاشة الجوال"],
    ["no_https", "الموقع آمن (HTTPS)"],
    ["noindex", "الموقع ظاهر لمحركات البحث"],
    ["bad_phone_link", "روابط الاتصال والواتساب سليمة"],
    ["broken_links", "الروابط الداخلية تعمل"],
    ["no_title", "للصفحة عنوان واضح"],
    ["no_description", "للصفحة وصف يظهر في Google"],
    ["no_structured_data", "فيه بيانات منظمة للعيادة"],
    ["no_lang", "لغة الصفحة محددة"],
];

export const reportAvailable = (c: Pick<ReportInput, "site_score" | "site_checked_at">) => c.site_checked_at !== null && c.site_score !== null;

export function buildReport(c: ReportInput): SiteReportModel | null {
    if (!reportAvailable(c)) return null;
    const score = c.site_score as number;
    const level = bucket(score) as "weak" | "medium" | "good";
    const verdict = level === "weak" ? "الموقع يحتاج إلى تحسينات مهمة" : level === "medium" ? "الموقع مقبول ويمكن تحسينه" : "الموقع جيد مع نقاط بسيطة للتحسين";

    const confirmed: Finding[] = [];
    const observations: Finding[] = [];
    for (const code of c.site_issues) {
        if (code === "unreadable") continue;
        if (isConfirmedIssue(code) || code === "social_only" || code === "unreachable") {
            const f = FINDINGS[code];
            if (f) confirmed.push({ code, ...f });
        } else if (OBSERVATIONS[code]) {
            observations.push({ code, ...OBSERVATIONS[code] });
        }
    }

    // "passed" only makes sense for a real, readable site
    const real = !c.site_issues.some((i) => i === "social_only" || i === "unreachable");
    const passed = real ? PASSABLE.filter(([code]) => !c.site_issues.includes(code)).map(([, text]) => text) : [];

    return {
        score,
        level,
        verdict,
        confirmed,
        observations,
        passed,
        speed: { perf: c.site_perf, seo: c.site_seo, a11y: c.site_a11y, lcpSeconds: c.site_lcp_ms === null ? null : Math.round(c.site_lcp_ms / 100) / 10 },
        date: (c.site_checked_at as string).slice(0, 10),
    };
}
