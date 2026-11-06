/*
 * Analytics and marketing tags, gated by cookie consent (see ./consent.ts).
 *
 *   Google Analytics 4   VITE_GA_MEASUREMENT_ID   analytics consent
 *   Microsoft Clarity    VITE_CLARITY_PROJECT_ID  analytics consent
 *   Meta Pixel           VITE_META_PIXEL_ID       marketing consent
 *
 * Rules this file keeps:
 *  - a tool whose ID is not set does not exist; no default or placeholder IDs;
 *  - nothing is loaded, and no request leaves for any of the three, before the visitor consents;
 *  - withdrawing consent stops sending, switches the tool's consent off and removes its cookies;
 *  - no name, email, phone, message or any form value is ever sent. Event parameters are fixed
 *    labels (language, form name, a project-type option, a contact method).
 *
 * The site is a set of prerendered pages joined by ordinary links, so every navigation, including
 * a language change, is a full page load and sends exactly one page_view. The guards below keep a
 * page from being counted twice (consent given late, a re-run init, hot reload).
 *
 * GA4 events (all carry `page_language`):
 *   page_view        every page load            page_location, page_path, page_title
 *   select_service   a service was chosen       service, source (footer | start_project_form)
 *   start_project    first edit of the form     form_name
 *   generate_lead    the server accepted it     form_name, project_type — once per request ref
 *   contact_click    email/phone/WhatsApp/social method, placement (header | footer | page)
 *   language_change  a language link was used   language_from, language_to
 * Meta Pixel: PageView on every page, Lead when the project request is accepted.
 */

import { splitLocale } from "../i18n/locales";
import { onConsentChange, readConsent } from "./consent";
import type { Consent } from "./consent";

type Params = Record<string, string | number | boolean>;

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: unknown;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
    fbq?: Fbq;
    _fbq?: unknown;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/** read an ID from the environment; a value in the wrong shape counts as "not set" */
const fromEnv = (value: unknown, shape: RegExp) =>
  typeof value === "string" && shape.test(value.trim()) ? value.trim() : "";

const GA_ID = fromEnv(import.meta.env.VITE_GA_MEASUREMENT_ID, /^G-[A-Z0-9]{4,}$/);
const CLARITY_ID = fromEnv(import.meta.env.VITE_CLARITY_PROJECT_ID, /^[a-z0-9]{6,}$/i);
const PIXEL_ID = fromEnv(import.meta.env.VITE_META_PIXEL_ID, /^\d{8,20}$/);

/** which consent categories have anything behind them; the banner only offers these */
export const TRACKING = {
  analytics: !!(GA_ID || CLARITY_ID),
  marketing: !!PIXEL_ID,
  any: !!(GA_ID || CLARITY_ID || PIXEL_ID),
} as const;

const loaded = { ga: false, clarity: false, pixel: false };
let consent: Consent = { analytics: false, marketing: false };
let pageLanguage = "ar";
const counted = { ga: "", pixel: "" };

/* ── helpers ──────────────────────────────────────────────────────────────────────────── */

function addScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** the page URL without anything but campaign parameters, so no stray query value is reported */
function cleanLocation() {
  const keep = new URLSearchParams();
  new URLSearchParams(location.search).forEach((value, key) => {
    if (/^(utm_[a-z_]+|gclid|gbraid|wbraid)$/i.test(key)) keep.set(key, value.slice(0, 120));
  });
  const q = keep.toString();
  return location.origin + location.pathname + (q ? `?${q}` : "");
}

const COOKIES = {
  analytics: /^(_ga|_gid|_gat|_clck|_clsk|CLARITY|MUID|ANONCID|SM$|_uetsid|_uetvid)/,
  marketing: /^(_fbp|_fbc|fr$)/,
};

/** remove the tools' cookies from this host and its parent domain */
function clearCookies(kind: keyof typeof COOKIES) {
  const host = location.hostname;
  const parent = host.split(".").slice(-2).join(".");
  const domains = [undefined, host, `.${host}`, `.${parent}`];
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (!name || !COOKIES[kind].test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

/* ── Google Analytics 4 ───────────────────────────────────────────────────────────────── */

function loadGA() {
  if (!GA_ID) return;
  window[`ga-disable-${GA_ID}`] = false;
  if (loaded.ga) {
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }
  loaded.ga = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js reads the arguments object itself, not an array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  // Consent Mode: analytics storage only; this site uses no ads features
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    send_page_view: false, // sent by hand, once per page, below
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  addScript("ga4-tag", `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
}

function revokeGA() {
  if (!GA_ID || !loaded.ga) return;
  window[`ga-disable-${GA_ID}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
}

/* ── Microsoft Clarity ────────────────────────────────────────────────────────────────── */

function loadClarity() {
  if (!CLARITY_ID) return;
  if (loaded.clarity) {
    window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
    return;
  }
  loaded.clarity = true;
  window.clarity =
    window.clarity ||
    function clarity() {
      // eslint-disable-next-line prefer-rest-params
      (window.clarity!.q = window.clarity!.q || []).push(arguments);
    };
  window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
  window.clarity("set", "page_language", pageLanguage); // a label, never anything about the visitor
  addScript("clarity-tag", `https://www.clarity.ms/tag/${CLARITY_ID}`);
}

function revokeClarity() {
  if (!loaded.clarity) return;
  window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
}

/* ── Meta Pixel ───────────────────────────────────────────────────────────────────────── */

function loadPixel() {
  if (!PIXEL_ID) return;
  if (loaded.pixel) {
    window.fbq?.("consent", "grant");
    return;
  }
  loaded.pixel = true;
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }
  // automatic configuration would read buttons and form fields on its own; keep it off
  window.fbq("set", "autoConfig", false, PIXEL_ID);
  window.fbq("init", PIXEL_ID);
  addScript("meta-pixel-tag", "https://connect.facebook.net/en_US/fbevents.js");
}

function revokePixel() {
  if (!loaded.pixel) return;
  window.fbq?.("consent", "revoke");
}

/* ── sending ──────────────────────────────────────────────────────────────────────────── */

const gaOn = () => !!GA_ID && consent.analytics && loaded.ga;
const pixelOn = () => !!PIXEL_ID && consent.marketing && loaded.pixel;

/** one page_view and one PageView per page, however many times consent or init runs */
function sendPageViews() {
  const key = location.pathname + location.search;
  if (gaOn() && counted.ga !== key) {
    counted.ga = key;
    window.gtag?.("event", "page_view", {
      page_location: cleanLocation(),
      page_path: location.pathname,
      page_title: document.title,
      page_language: pageLanguage,
    });
  }
  if (pixelOn() && counted.pixel !== key) {
    counted.pixel = key;
    window.fbq?.("track", "PageView");
  }
}

/** a GA4 event; silently dropped unless the visitor allowed analytics */
export function trackEvent(name: string, params: Params = {}) {
  if (!gaOn()) return;
  try {
    window.gtag?.("event", name, { page_language: pageLanguage, transport_type: "beacon", ...params });
  } catch {
    /* a blocked or broken tag must never break the page */
  }
}

const sentLeads = new Set<string>();

/**
 * A project request the server accepted. Call it only from the success branch. `requestRef` is the
 * reference the server returned; the same one is never counted twice, even across a reload.
 */
export function trackLead(requestRef: string, params: { projectType?: string } = {}) {
  const id = requestRef || `local-${Date.now()}`;
  const storageKey = `qawsan-lead-${id}`;
  let seen = sentLeads.has(id);
  try {
    seen = seen || sessionStorage.getItem(storageKey) === "1";
    sessionStorage.setItem(storageKey, "1");
  } catch {
    /* storage blocked: the in-memory set still covers this page */
  }
  sentLeads.add(id);
  if (seen) return;

  trackEvent("generate_lead", {
    form_name: "start_project",
    ...(params.projectType ? { project_type: params.projectType } : {}),
  });
  if (pixelOn()) {
    try {
      window.fbq?.("track", "Lead", { content_name: "start_project" }, { eventID: id });
    } catch {
      /* ignore */
    }
  }
}

/** the first edit of the project form — counted once per page */
let formStarted = false;
export function trackStartProject() {
  if (formStarted) return;
  formStarted = true;
  trackEvent("start_project", { form_name: "start_project" });
}

export function trackSelectService(service: string, source: string) {
  trackEvent("select_service", { service, source });
}

/* ── link clicks (one delegated listener, so no component needs wiring) ───────────────── */

function contactMethod(a: HTMLAnchorElement): string | null {
  const href = a.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) return "email";
  if (href.startsWith("tel:")) return "phone";
  let host: string;
  try {
    host = new URL(a.href).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  if (host === "wa.me" || host.endsWith("whatsapp.com")) return "whatsapp";
  if (host.endsWith("instagram.com")) return "instagram";
  if (host.endsWith("linkedin.com")) return "linkedin";
  return null;
}

function onClick(event: MouseEvent) {
  const a = (event.target as Element | null)?.closest?.("a");
  if (!a) return;

  const service = a.getAttribute("data-track-service");
  if (service) trackSelectService(service, "footer");

  const method = contactMethod(a);
  if (method) {
    const placement = a.closest("footer") ? "footer" : a.closest("header, nav") ? "header" : "page";
    trackEvent("contact_click", { method, placement });
  }

  const target = a.getAttribute("hreflang");
  if (target && target !== pageLanguage && a.hasAttribute("lang")) {
    trackEvent("language_change", { language_from: pageLanguage, language_to: target });
  }
}

/* ── start-up and consent changes ─────────────────────────────────────────────────────── */

function apply(next: Consent | null) {
  const prev = consent;
  consent = next ?? { analytics: false, marketing: false };

  if (consent.analytics) {
    loadGA();
    loadClarity();
  } else if (prev.analytics) {
    revokeGA();
    revokeClarity();
    clearCookies("analytics");
    counted.ga = "";
  }

  if (consent.marketing) loadPixel();
  else if (prev.marketing) {
    revokePixel();
    clearCookies("marketing");
    counted.pixel = "";
  }

  sendPageViews();
}

let started = false;

/** call once, in the browser. Does nothing on the admin page, which is never measured. */
export function initAnalytics() {
  if (started || typeof window === "undefined") return;
  started = true;

  const { locale, path } = splitLocale(location.pathname);
  if (path === "/admin") return;
  pageLanguage = locale;

  document.addEventListener("click", onClick, true);
  apply(readConsent());
  onConsentChange(apply);
}
