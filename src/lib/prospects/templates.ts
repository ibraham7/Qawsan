// Ready-made first messages for a campaign, by who is being written to, plus the person's own saved
// templates. Built-in ones follow the same rules as the product: one question, no links or files in the
// first message, nothing stated that the audit has not confirmed (the website problem comes from
// {issue}, which only exists for companies with a confirmed one).

export type TemplateChannel = "whatsapp" | "email";

export interface Preset {
    id: string;
    label: string;
    /** who it is for, shown under the picker */
    hint: string;
    channel: TemplateChannel;
    subject: string;
    message: string;
    /** the text uses {issue}: only companies with a confirmed website problem can receive it */
    usesIssue: boolean;
    /** the text uses {custom}: the person writes a paragraph for each company, and none is sent before it is written */
    usesCustom: boolean;
}

const WA_SIGN = "معك إبراهيم من استوديو قوسان";
const MAIL_SIGN = "مع التحية،\nإبراهيم - قوسان\nhttps://qawsan.website";

export const PRESETS: Preset[] = [
    {
        id: "wa-general",
        label: "تعريف عام",
        hint: "لأي جهة. رسالة قصيرة بسؤال واحد.",
        channel: "whatsapp",
        subject: "",
        message: `{السلام عليكم|مرحبًا|أهلًا} {name}، ${WA_SIGN}. نصمم مواقع وأنظمة حجز للعيادات. لو مهتمين، أرسل لكم نموذجًا قصيرًا وسعرًا استرشاديًا؟`,
        usesIssue: false,
        usesCustom: false,
    },
    {
        id: "wa-no-site",
        label: "عيادة بلا موقع",
        hint: "للعيادات التي ليس لها موقع (فلتر «بيانات التواصل» بدون موقع).",
        channel: "whatsapp",
        subject: "",
        message: `{السلام عليكم|مرحبًا} {name}، ${WA_SIGN}. لاحظت أن عيادتكم لا تملك موقعًا خاصًا، وكثير من المرضى يبحثون في Google ثم يحجزون من الجوال. نصمم مواقع عيادات بحجز مباشر وزر واتساب. هل يناسبكم أن أرسل لكم مثالًا سريعًا؟`,
        usesIssue: false,
        usesCustom: false,
    },
    {
        id: "wa-weak-issue",
        label: "موقع ضعيف (بعيب مؤكد)",
        hint: "للعيادات التي فُحص موقعها وفيها عيب مؤكد. يدخل فيها من لهم عيب فقط.",
        channel: "whatsapp",
        subject: "",
        message: `{السلام عليكم|مرحبًا} {name}، ${WA_SIGN}. لاحظت أن موقعكم {issue}، وهذا قد يضيّع عليكم حجوزات من المرضى الذين يدخلون من الجوال. جهزت لكم ملاحظات مختصرة وطريقة إصلاح سريعة. هل أرسلها؟`,
        usesIssue: true,
        usesCustom: false,
    },
    {
        id: "wa-free-report",
        label: "عرض تقرير مجاني",
        hint: "للعيادات التي فُحص موقعها: تعرض عليهم تقرير الموقع (PDF) ويُرسَل بعد ردّهم.",
        channel: "whatsapp",
        subject: "",
        message: `{السلام عليكم|مرحبًا} {name}، ${WA_SIGN}. فحصت موقعكم فحصًا سريعًا وجهزت تقريرًا مختصرًا بنقاط تهم حجوزاتكم، مجانًا ودون التزام. هل أرسله لكم؟`,
        usesIssue: false,
        usesCustom: false,
    },
    {
        id: "wa-custom",
        label: "فقرة مخصصة لكل جهة",
        hint: "أنت تكتب فقرة خاصة بكل جهة حسب حاجتها بعد إنشاء الحملة. لا تُرسَل لجهة قبل أن تُكتب فقرتها.",
        channel: "whatsapp",
        subject: "",
        message: `{السلام عليكم|مرحبًا} {name}، ${WA_SIGN}. {custom} هل يناسبكم أن أرسل لكم التفاصيل؟`,
        usesIssue: false,
        usesCustom: true,
    },
    {
        id: "mail-general",
        label: "تعريف عام",
        hint: "لأي جهة. رسالة قصيرة بسؤال واحد.",
        channel: "email",
        subject: "اقتراح لموقع {name}",
        message: `{مرحبًا|أهلًا} فريق {name}،\n\nأنا إبراهيم من استوديو قوسان. نصمم مواقع وأنظمة حجز للعيادات، ولاحظت أن لديكم حضورًا جيدًا يمكن دعمه بموقع يناسب نشاطكم.\n\nهل يناسبكم أن أرسل لكم تفاصيل قصيرة وسعرًا استرشاديًا؟\n\n${MAIL_SIGN}`,
        usesIssue: false,
        usesCustom: false,
    },
    {
        id: "mail-no-site",
        label: "عيادة بلا موقع",
        hint: "للعيادات التي ليس لها موقع.",
        channel: "email",
        subject: "موقع لعيادة {name} يستقبل الحجوزات",
        message: `{مرحبًا|أهلًا} فريق {name}،\n\nأنا إبراهيم من استوديو قوسان. لاحظت أن عيادتكم لا تملك موقعًا خاصًا، وكثير من المرضى يبحثون في Google ثم يحجزون من الجوال.\n\nنصمم مواقع عيادات بحجز مباشر وزر واتساب. هل يناسبكم أن أرسل لكم مثالًا سريعًا؟\n\n${MAIL_SIGN}`,
        usesIssue: false,
        usesCustom: false,
    },
    {
        id: "mail-weak-issue",
        label: "موقع ضعيف (بعيب مؤكد)",
        hint: "للعيادات التي فُحص موقعها وفيها عيب مؤكد. يدخل فيها من لهم عيب فقط.",
        channel: "email",
        subject: "ملاحظة بخصوص موقع {name}",
        message: `{مرحبًا|أهلًا} فريق {name}،\n\nأنا إبراهيم من استوديو قوسان. لاحظت أن موقعكم {issue}، وهذا قد يضيّع عليكم حجوزات من المرضى الذين يدخلون من الجوال.\n\nجهزت لكم ملاحظات مختصرة وطريقة إصلاح سريعة. هل أرسلها؟\n\n${MAIL_SIGN}`,
        usesIssue: true,
        usesCustom: false,
    },
    {
        id: "mail-free-report",
        label: "عرض تقرير مجاني",
        hint: "للعيادات التي فُحص موقعها: تعرض عليهم تقرير الموقع (PDF) ويُرسَل بعد ردّهم.",
        channel: "email",
        subject: "تقرير مجاني عن موقع {name}",
        message: `{مرحبًا|أهلًا} فريق {name}،\n\nأنا إبراهيم من استوديو قوسان. فحصت موقعكم فحصًا سريعًا وجهزت تقريرًا مختصرًا بنقاط تهم حجوزاتكم، مجانًا ودون التزام.\n\nهل أرسله لكم؟\n\n${MAIL_SIGN}`,
        usesIssue: false,
        usesCustom: false,
    },
    {
        id: "mail-custom",
        label: "فقرة مخصصة لكل جهة",
        hint: "أنت تكتب فقرة خاصة بكل جهة حسب حاجتها بعد إنشاء الحملة. لا تُرسَل لجهة قبل أن تُكتب فقرتها، ولا تقل ما لم تتحقق منه.",
        channel: "email",
        subject: "اقتراح خاص لـ{name}",
        message: `{مرحبًا|أهلًا} فريق {name}،\n\nأنا إبراهيم من استوديو قوسان، نصمم مواقع وأنظمة حجز للعيادات.\n\n{custom}\n\nهل يناسبكم أن أرسل لكم تفاصيل مختصرة؟\n\n${MAIL_SIGN}`,
        usesIssue: false,
        usesCustom: true,
    },
];

export const presetsFor = (channel: TemplateChannel) => PRESETS.filter((p) => p.channel === channel);
export const defaultPreset = (channel: TemplateChannel) => presetsFor(channel)[0];

/* ------------------------------------------------------------------ */
/* the person's own templates, kept in this browser                       */

export interface SavedTemplate {
    id: string;
    name: string;
    channel: TemplateChannel;
    subject: string;
    message: string;
}

export const SAVED_KEY = "qawsan-campaign-templates";
export const MAX_SAVED = 30;

/** what was stored, keeping only well-formed entries (storage can hold anything) */
export function parseSaved(raw: string | null): SavedTemplate[] {
    if (!raw) return [];
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        return [];
    }
    if (!Array.isArray(data)) return [];
    const out: SavedTemplate[] = [];
    for (const x of data) {
        const t = x as Partial<SavedTemplate> | null;
        if (!t || typeof t.id !== "string" || typeof t.name !== "string" || typeof t.message !== "string") continue;
        if (t.channel !== "whatsapp" && t.channel !== "email") continue;
        if (!t.name.trim() || t.message.length > 1500) continue;
        out.push({ id: t.id, name: t.name.trim().slice(0, 60), channel: t.channel, subject: typeof t.subject === "string" ? t.subject.slice(0, 200) : "", message: t.message });
        if (out.length >= MAX_SAVED) break;
    }
    return out;
}

/** add a template, or replace the one with the same name and channel */
export function withSaved(list: SavedTemplate[], t: Omit<SavedTemplate, "id">, id: string): SavedTemplate[] {
    const name = t.name.trim().slice(0, 60);
    const rest = list.filter((x) => !(x.channel === t.channel && x.name === name));
    return [{ ...t, name, id }, ...rest].slice(0, MAX_SAVED);
}
