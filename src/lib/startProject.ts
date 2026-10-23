export const PROJECT_TYPES = [
  { value: "website", label: "تطوير موقع (Website Development)" },
  { value: "software", label: "برمجيات مخصصة (Custom Software)" },
  { value: "uiux", label: "تصميم UI/UX" },
  { value: "branding", label: "هوية بصرية (Branding)" },
  { value: "other", label: "أخرى / لست متأكدًا" },
] as const;

export const BUDGETS = [
  { value: "lt500", label: "أقل من $500" },
  { value: "500-1000", label: "$500 – $1,000" },
  { value: "1000-3000", label: "$1,000 – $3,000" },
  { value: "3000-5000", label: "$3,000 – $5,000" },
  { value: "gt5000", label: "أكثر من $5,000" },
  { value: "undecided", label: "لم أحدد الميزانية بعد" },
] as const;

export const TIMELINES = [
  { value: "asap", label: "في أقرب وقت" },
  { value: "1m", label: "خلال شهر" },
  { value: "1-3m", label: "خلال 1–3 أشهر" },
  { value: "flexible", label: "الموعد مرن" },
] as const;

export const CONTACT_METHODS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
] as const;

export const LIMITS = {
  name: 100,
  company: 120,
  email: 254,
  whatsapp: 24,
  description: 3000,
  features: 2000,
  references: 1500,
} as const;

export interface StartProjectPayload {
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  projectType: string;
  description: string;
  features: string;
  references: string;
  budget: string;
  timeline: string;
  contactMethod: string;
  consent: boolean;
  /** honeypot: must stay empty */
  website: string;
  /** ms the visitor spent on the form */
  elapsed: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+[1-9][0-9\s\-()]{6,20}$/;

const oneOf = (list: readonly { value: string }[], v: string) =>
  list.some((i) => i.value === v);

export type FieldErrors = Partial<Record<keyof StartProjectPayload, string>>;

/** Shared by the browser and the API route so both enforce the same rules. */
export function validate(p: StartProjectPayload): FieldErrors {
  const e: FieldErrors = {};
  const name = p.name.trim();
  if (name.length < 2) e.name = "الاسم مطلوب";
  else if (name.length > LIMITS.name) e.name = "الاسم طويل جدًا";
  if (p.company.length > LIMITS.company) e.company = "النص طويل جدًا";
  if (!EMAIL_RE.test(p.email.trim()) || p.email.length > LIMITS.email)
    e.email = "أدخل بريدًا إلكترونيًا صحيحًا";
  if (!PHONE_RE.test(p.whatsapp.trim()))
    e.whatsapp = "أدخل الرقم مع رمز الدولة، مثل +962791234567";
  if (!oneOf(PROJECT_TYPES, p.projectType)) e.projectType = "اختر نوع المشروع";
  const d = p.description.trim();
  if (d.length < 20) e.description = "اكتب وصفًا مختصرًا للمشروع (20 حرفًا على الأقل)";
  else if (d.length > LIMITS.description) e.description = "الوصف طويل جدًا";
  if (p.features.length > LIMITS.features) e.features = "النص طويل جدًا";
  if (p.references.length > LIMITS.references) e.references = "النص طويل جدًا";
  if (!oneOf(BUDGETS, p.budget)) e.budget = "اختر الميزانية";
  if (!oneOf(TIMELINES, p.timeline)) e.timeline = "اختر المدة";
  if (!oneOf(CONTACT_METHODS, p.contactMethod)) e.contactMethod = "اختر وسيلة التواصل";
  if (!p.consent) e.consent = "الموافقة مطلوبة لإرسال الطلب";
  return e;
}
