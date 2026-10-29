/* eslint-disable react-refresh/only-export-components -- context + hook + helpers live together on purpose */
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import ar from "./messages/ar";
import en from "./messages/en";
import tr from "./messages/tr";
import type { Messages } from "./messages/ar";
import { DEFAULT_LOCALE, LOCALE_META, localizePath } from "./locales";
import type { Locale } from "./locales";

export * from "./locales";
export type { Messages };

export const MESSAGES: Record<Locale, Messages> = { ar, en, tr };

interface I18n {
  locale: Locale;
  /** route without the locale prefix, e.g. "/blog" — used by the language switcher */
  path: string;
  dir: "rtl" | "ltr";
  t: Messages;
  /** link to a page in the current language: to("/#projects") -> "/en#projects" */
  to: (path: string) => string;
}

const make = (locale: Locale, path: string): I18n => ({
  locale,
  path,
  dir: LOCALE_META[locale].dir,
  t: MESSAGES[locale],
  to: (p) => localizePath(locale, p),
});

const I18nContext = createContext<I18n>(make(DEFAULT_LOCALE, "/"));

export function I18nProvider({
  locale,
  path,
  children,
}: {
  locale: Locale;
  path: string;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={make(locale, path)}>{children}</I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
