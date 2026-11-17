// Entering a clinic's WhatsApp number by hand (for example one found on its Instagram page or given on the
// phone): written in any usual way, turned into an international number using the clinic's country.

import { dialFor } from "../discovery/extract.ts";
import { phoneKind } from "../discovery/places.ts";
import { normalizePhone } from "./csvimport.ts";

export type WhatsappResult = { ok: true; number: string; warning?: string } | { ok: false; error: string };

/** "" clears the number; otherwise "+966…" or an error. A landline is accepted with a warning (it may not be on WhatsApp). */
export function cleanWhatsapp(raw: string, country: string): WhatsappResult {
    const text = raw.trim();
    if (!text) return { ok: true, number: "" };
    const number = normalizePhone(text, dialFor(country));
    if (!number) return { ok: false, error: "رقم غير صالح. اكتبه مع رمز الدولة (+966…) أو بالصيغة المحلية (05…)." };
    return phoneKind(number) === "mobile" ? { ok: true, number } : { ok: true, number, warning: "هذا الرقم لا يبدو جوالًا (قد يكون ثابتًا)، وقد لا يكون عليه واتساب. تأكد منه قبل الإرسال." };
}
