// Ready replies for what clinics usually answer ("how much?", "we have a website", "send details"...), so the
// reply is one click away while the conversation is hot. Built-in ones plus the person's own, kept in this
// browser. Placeholders: {name} the clinic, {price} the starting price the person sets, {issue} the
// confirmed website problem written for that clinic (see campaigns.ts).

export interface Reply {
    id: string;
    title: string;
    /** when to use it */
    hint: string;
    text: string;
    /** a reply that ends the conversation: afterwards the person should record "طلب الإيقاف" */
    stop?: boolean;
}

export const REPLIES: Reply[] = [
    {
        id: "price",
        title: "كم السعر؟",
        hint: "حين تسأل العيادة عن السعر قبل أن تحدد المطلوب.",
        text: "حياكم الله. السعر يعتمد على المطلوب بالضبط (موقع جديد، أو تحسين الموجود، أو حجز وأتمتة). نبدأ عادةً من {price}. تفضلون أرسل لكم عرضًا مفصلًا بعد أن أفهم احتياجكم؟",
    },
    {
        id: "has-site",
        title: "«عندنا موقع»",
        hint: "للعيادة التي لها موقع وفحصت موقعها. يحتاج عيبًا مؤكدًا في موقعها.",
        text: "ممتاز، ما قصدت أنكم بلا موقع. لاحظت فقط أن موقعكم {issue}، وهذا يؤثر على المرضى الذين يدخلون من الجوال. أجهز لكم تقريرًا مختصرًا مجانًا بالنقاط، وتقررون بعده دون أي التزام.",
    },
    {
        id: "send-details",
        title: "«أرسل التفاصيل»",
        hint: "حين تطلب العيادة التفاصيل. اعرف من صاحب القرار.",
        text: "تمام، أرسل لكم الآن ملخصًا مختصرًا. هل المسؤول عن الموقع والحجوزات أنتم أم شخص آخر؟ أراسله مباشرة إن أحببتم.",
    },
    {
        id: "interested",
        title: "مهتمون",
        hint: "حين تبدي العيادة اهتمامًا. اطلب مكالمة قصيرة.",
        text: "يسعدني ذلك. أقترح مكالمة قصيرة (10 دقائق) أفهم فيها احتياجكم وأعرض عليكم المناسب. أي وقت يناسبكم هذا الأسبوع (من الأحد إلى الخميس)؟",
    },
    {
        id: "busy",
        title: "مشغولون / لاحقًا",
        hint: "حين تطلب العيادة التأجيل.",
        text: "لا مشكلة، في الوقت الذي يناسبكم. أترك لكم رقمي متى احتجتم، وأتابع معكم بعد أسبوع إن سمحتم.",
    },
    {
        id: "who",
        title: "من أنتم؟ كيف حصلتم على رقمنا؟",
        hint: "للجهات التي وجدتها في Google Maps فقط. جواب صادق.",
        text: "حياكم الله. أنا من استوديو قوسان، نصمم مواقع وأنظمة للعيادات. وجدت عيادتكم على خرائط Google وراسلتكم لأني أظن أن ما نقدمه قد يفيدكم. وإن لم يكن مناسبًا فأخبروني وأتوقف فورًا.",
    },
    {
        id: "has-agency",
        title: "«عندنا شركة تتولى ذلك»",
        hint: "حين تقول العيادة إن لها مزوّدًا.",
        text: "ممتاز أن عندكم من يتولى ذلك. إن احتجتم لاحقًا لرأي ثانٍ أو تحسين محدد فأنا جاهز. هل تسمحون أن أترك لكم رقمي؟",
    },
    {
        id: "no-thanks",
        title: "«لا، شكرًا» أو «توقف»",
        hint: "حين ترفض العيادة. بعد الإرسال سجّل «طلب الإيقاف» فورًا.",
        text: "شكرًا لوقتكم وأعتذر عن الإزعاج، لن أراسلكم مجددًا.",
        stop: true,
    },
];

export interface ReplyContext {
    name?: string;
    price?: string;
    issue?: string;
}

/** what the placeholders could not be filled with (so the person fills them by hand before sending) */
export type Missing = "price" | "issue";

/** the reply text with the placeholders filled; a missing value stays visible in brackets so it is not sent by mistake */
export function renderReply(text: string, ctx: ReplyContext): { text: string; missing: Missing[] } {
    const missing: Missing[] = [];
    let out = text.replace(/\{name\}/g, (ctx.name ?? "").trim());
    out = out.replace(/\{price\}/g, () => {
        const p = (ctx.price ?? "").trim();
        if (!p) missing.push("price");
        return p || "[السعر]";
    });
    out = out.replace(/\{issue\}/g, () => {
        const i = (ctx.issue ?? "").trim();
        if (!i) missing.push("issue");
        return i || "[العيب]";
    });
    return { text: out.replace(/ {2,}/g, " ").replace(/ ([،.؟!])/g, "$1").trim(), missing: [...new Set(missing)] };
}

/* ------------------------------------------------------------------ */
/* the person's own replies, kept in this browser                         */

export interface CustomReply {
    id: string;
    title: string;
    text: string;
}

export const CUSTOM_KEY = "qawsan-quick-replies";
export const PRICE_KEY = "qawsan-quick-price";
export const MAX_CUSTOM = 30;

export function parseCustom(raw: string | null): CustomReply[] {
    if (!raw) return [];
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        return [];
    }
    if (!Array.isArray(data)) return [];
    const out: CustomReply[] = [];
    for (const x of data) {
        const r = x as Partial<CustomReply> | null;
        if (!r || typeof r.id !== "string" || typeof r.title !== "string" || typeof r.text !== "string") continue;
        if (!r.title.trim() || !r.text.trim() || r.text.length > 1000) continue;
        out.push({ id: r.id, title: r.title.trim().slice(0, 60), text: r.text });
        if (out.length >= MAX_CUSTOM) break;
    }
    return out;
}

/** add a reply, or replace the one with the same title */
export function withCustom(list: CustomReply[], r: Omit<CustomReply, "id">, id: string): CustomReply[] {
    const title = r.title.trim().slice(0, 60);
    return [{ id, title, text: r.text }, ...list.filter((x) => x.title !== title)].slice(0, MAX_CUSTOM);
}
