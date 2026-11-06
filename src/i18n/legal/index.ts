import type { Locale } from "../locales";

import ar from "./ar";
import en from "./en";
import tr from "./tr";
import type { LegalText } from "./ar";

export type { LegalDoc, LegalSection, LegalText, LegalUi } from "./ar";

export const LEGAL: Record<Locale, LegalText> = { ar, en, tr };

/** the three legal pages, as route paths without the language prefix */
export const LEGAL_PAGES = { privacy: "/privacy", terms: "/terms", cookies: "/cookies" } as const;
export type LegalKind = keyof typeof LEGAL_PAGES;

/** the contact address already shown in the site footer; confirm it before relying on it for legal requests */
export const LEGAL_EMAIL = "ibrahim.dev.pr@gmail.com";
