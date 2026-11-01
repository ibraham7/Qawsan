import { useEffect, useState } from "react";

import type { Locale } from "../i18n/locales";

declare global {
    interface Window {
        __QAWSAN_REVIEWS__?: Review[];
    }
}

/**
 * Customer reviews.
 *
 * Real reviews come from the database (table qawsan_reviews): customers send them from /review,
 * an admin approves them in /admin, and only approved ones are public. You can also add a
 * review by hand to REVIEWS below. The reviews section, the overall rating and the "client
 * satisfaction" figure all read from the combined list and appear as soon as it has entries.
 */
export interface Review {
    id: string;
    name: string;
    /** job title / company / city, as the customer wants it shown */
    role: string;
    /** 1–5 */
    rating: number;
    /** the customer's words; give one language and it is shown everywhere, or translate it */
    text: Partial<Record<Locale, string>>;
}

export const REVIEWS: Review[] = [];

/** the review's text in the visitor's language, falling back to whatever language it was written in */
export const reviewText = (r: Review, locale: Locale) =>
    r.text[locale] ?? r.text.ar ?? r.text.en ?? r.text.tr ?? "";

export const averageRating = (list: Review[]) =>
    list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0;

/** share of reviews that gave 4 or 5 stars, as a whole percentage */
export const satisfactionPercent = (list: Review[]) =>
    list.length ? Math.round((list.filter((r) => r.rating >= 4).length / list.length) * 100) : 0;

/* the prerender seeds the approved reviews it fetched at build time; the built page carries
   the same list in window.__QAWSAN_REVIEWS__ so the first render already has them */
let seeded: Review[] | null = null;

export function seedReviews(rows: Review[]) {
    seeded = rows;
}

/** approved reviews from the database (public read; RLS hides everything unapproved) */
export async function fetchReviews(): Promise<Review[]> {
    // loaded on demand so the Supabase client stays out of the main bundle
    const { supabase } = await import("../lib/supabase");
    const { data, error } = await supabase
        .from("qawsan_reviews")
        .select("id, name, role, rating, text, locale, created_at")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(40);
    if (error) throw error;
    return (data ?? []).map((row) => ({
        id: row.id as string,
        name: row.name as string,
        role: (row.role as string) ?? "",
        rating: Number(row.rating),
        text: { [row.locale as Locale]: row.text as string },
    }));
}

function initialReviews(): Review[] {
    const fromBuild =
        seeded ?? (typeof window !== "undefined" ? window.__QAWSAN_REVIEWS__ : undefined) ?? [];
    return [...REVIEWS, ...fromBuild];
}

/** The reviews to show: only real ones (hand-added or approved in the database). */
export function useReviews(): { list: Review[] } {
    const [real, setReal] = useState<Review[]>(initialReviews);

    useEffect(() => {
        let active = true;
        fetchReviews()
            .then((rows) => {
                if (active) setReal([...REVIEWS, ...rows]);
            })
            .catch(() => {
                /* keep what we have */
            });
        return () => {
            active = false;
        };
    }, []);

    return { list: real };
}
