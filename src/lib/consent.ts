/*
 * Cookie consent: one small store shared by the banner and the trackers.
 *
 *   necessary  always on (language, theme) — never asks
 *   analytics  Google Analytics 4 + Microsoft Clarity
 *   marketing  Meta Pixel
 *
 * Nothing optional runs until the visitor has chosen. The choice is kept in localStorage and can
 * be changed at any time from the footer ("Cookie settings"); changing it notifies subscribers
 * so the trackers can start or stop right away.
 */

export interface Consent {
  analytics: boolean;
  marketing: boolean;
}

interface Stored extends Consent {
  v: 1;
  at: number;
}

const KEY = "qawsan-consent";
const OPEN_EVENT = "qawsan:open-consent";

type Listener = (consent: Consent | null) => void;
const listeners = new Set<Listener>();

/** the saved choice, or null while the visitor has not decided (or storage is unavailable) */
export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Stored>;
    if (s.v !== 1 || typeof s.analytics !== "boolean" || typeof s.marketing !== "boolean") return null;
    return { analytics: s.analytics, marketing: s.marketing };
  } catch {
    return null;
  }
}

export function saveConsent(consent: Consent) {
  try {
    const stored: Stored = { v: 1, at: Date.now(), ...consent };
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* storage blocked: the choice only lasts for this page, which fails closed on the next one */
  }
  listeners.forEach((fn) => fn(consent));
}

export function onConsentChange(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** lets the footer link reopen the banner without sharing React state */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenConsentSettings(fn: () => void) {
  window.addEventListener(OPEN_EVENT, fn);
  return () => window.removeEventListener(OPEN_EVENT, fn);
}
