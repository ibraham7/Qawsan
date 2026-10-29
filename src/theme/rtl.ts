import createCache from "@emotion/cache";
import type { StylisPlugin } from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";

import type { Locale } from "../i18n/locales";
import { LOCALE_META } from "../i18n/locales";

/*
 * Styles are written LTR-style and mirrored for Arabic by stylis-plugin-rtl.
 * Some Arabic paragraphs also pin `direction: rtl`; on the English/Turkish
 * pages that would push Latin punctuation to the wrong side, so the LTR cache
 * turns those into `direction: ltr`.
 */
const pinnedRtlToLtr: StylisPlugin = (element) => {
  if (element.type === "decl" && element.props === "direction" && element.children === "rtl") {
    element.return = "direction:ltr;";
  }
};

export const createDirectionCache = (dir: "rtl" | "ltr") =>
  dir === "rtl"
    ? createCache({ key: "muirtl", stylisPlugins: [rtlPlugin] })
    : createCache({ key: "muiltr", stylisPlugins: [pinnedRtlToLtr] });

export const rtlCache = createDirectionCache("rtl");
export const ltrCache = createDirectionCache("ltr");

export const cacheFor = (locale: Locale) =>
  LOCALE_META[locale].dir === "rtl" ? rtlCache : ltrCache;
