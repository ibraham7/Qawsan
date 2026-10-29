import { useEffect, useState } from "react";

import type { Locale } from "../i18n/locales";

declare global {
    interface Window {
        __QAWSAN_PROJECTS__?: Project[];
    }
}

export interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    link: string;
    images: string[];
    sort_order: number;
    /* optional translations (see supabase/migrations/20261029000000_qawsan_projects_i18n.sql) */
    title_en?: string | null;
    title_tr?: string | null;
    category_en?: string | null;
    category_tr?: string | null;
    description_en?: string | null;
    description_tr?: string | null;
}

export type ProjectInput = Omit<Project, "id">;

export const TRANSLATION_FIELDS = [
    "title_en",
    "title_tr",
    "category_en",
    "category_tr",
    "description_en",
    "description_tr",
] as const;

/* shown until Supabase answers, and if it can't be reached */
const fallbackRows: Project[] = [
    {
        id: "clinova",
        title: "Clinova",
        category: "UI/UX · Development",
        description:
            "نظام متكامل لإدارة العيادات: المواعيد، ملفات المرضى، والتقارير في تجربة واحدة سلسة وسهلة الاستخدام.",
        link: "https://clinova.novanoai.online/",
        images: ["/images/projects/clinova.png"],
        sort_order: 1,
    },
    {
        id: "novasales",
        title: "NovaSales",
        category: "UI/UX · Development",
        description:
            "منصة لإدارة المبيعات والعملاء، تمنح الفرق رؤية واضحة للأداء وتختصر الوقت في المهام اليومية.",
        link: "https://sales.novanoai.online/",
        images: ["/images/projects/novasales.png"],
        sort_order: 2,
    },
    {
        id: "university",
        title: "نظام الجامعة",
        category: "System Design · Development",
        description:
            "نظام جامعي شامل لإدارة الطلاب والمقررات والأقسام، مبني بمعمارية قابلة للتوسع.",
        link: "https://uni.novanoai.online/",
        images: ["/images/projects/university-system.png"],
        sort_order: 3,
    },
];

/*
 * Extra screenshots for projects whose database row only lists the original cover.
 * They go first (the cover image is the first one shown); the database images follow.
 */
const BUILT_IN_IMAGES: Record<string, string[]> = {
    "https://sales.novanoai.online/": [
        "/images/projects/novasales-dashboard.webp",
        "/images/projects/novasales-reports.webp",
        "/images/projects/novasales-products.webp",
    ],
    "https://uni.novanoai.online/": [
        "/images/projects/university-dashboard.webp",
        "/images/projects/university-courses.webp",
        "/images/projects/university-structure.webp",
    ],
};

function withGallery(p: Project): Project {
    const extra = BUILT_IN_IMAGES[p.link];
    if (!extra) return p;
    return { ...p, images: [...extra, ...p.images.filter((src) => !extra.includes(src))] };
}

export const fallbackProjects: Project[] = fallbackRows.map(withGallery);

/*
 * English / Turkish copy for the projects that already exist, keyed by link.
 * The database columns win when they are filled, so new or edited projects
 * can be translated from /admin without touching the code.
 */
const BUILT_IN: Record<string, Partial<Record<"en" | "tr", { title?: string; category: string; description: string }>>> = {
    "https://clinova.novanoai.online/": {
        en: {
            category: "UI/UX · Development",
            description:
                "A complete clinic management system: appointments, patient records and reports in one smooth, easy-to-use experience.",
        },
        tr: {
            category: "UI/UX · Geliştirme",
            description:
                "Randevuları, hasta dosyalarını ve raporları tek bir akıcı ve kullanımı kolay deneyimde buluşturan eksiksiz bir klinik yönetim sistemi.",
        },
    },
    "https://sales.novanoai.online/": {
        en: {
            category: "UI/UX · Development",
            description:
                "A sales and customer management platform that gives teams a clear view of performance and saves time on everyday tasks.",
        },
        tr: {
            category: "UI/UX · Geliştirme",
            description:
                "Ekiplere performans konusunda net bir görünüm sunan ve günlük işlerde zaman kazandıran bir satış ve müşteri yönetimi platformu.",
        },
    },
    "https://uni.novanoai.online/": {
        en: {
            title: "University System",
            category: "System Design · Development",
            description:
                "A comprehensive university system for managing students, courses and departments, built on a scalable architecture.",
        },
        tr: {
            title: "Üniversite Sistemi",
            category: "Sistem Tasarımı · Geliştirme",
            description:
                "Öğrencileri, dersleri ve bölümleri yönetmek için ölçeklenebilir bir mimariyle geliştirilmiş kapsamlı bir üniversite sistemi.",
        },
    },
    "https://wird-platform.vercel.app/": {
        en: {
            title: "Wird — Quran Learning",
            category: "Branding · UI/UX · Development",
            description:
                "A digital platform for learning the Holy Quran and its sciences, designed to offer a simple, clear learning experience that pairs a calm visual identity with ease of use.",
        },
        tr: {
            title: "Wird — Kur'an Eğitimi",
            category: "Marka Kimliği · UI/UX · Geliştirme",
            description:
                "Kur'an-ı Kerim'i ve ilimlerini öğrenmek için geliştirilmiş dijital bir platform; sakin bir görsel kimliği kullanım kolaylığıyla buluşturan sade ve anlaşılır bir öğrenme deneyimi sunar.",
        },
    },
    "https://rpanyon.com/": {
        en: {
            title: "Rabbanioon Center",
            category: "Development",
            description:
                "A website for the Rabbanioon Center: the interface is implemented in code, delivering a responsive Arabic experience that runs smoothly on every screen size.",
        },
        tr: {
            title: "Rabbanioon Merkezi",
            category: "Geliştirme",
            description:
                "Rabbanioon Merkezi için geliştirilen web sitesi: arayüz kodlanarak hayata geçirildi ve her ekran boyutunda sorunsuz çalışan, duyarlı bir Arapça deneyim sunuyor.",
        },
    },
};

export interface ProjectText {
    title: string;
    category: string;
    description: string;
}

/** the project's copy in the visitor's language; Arabic is the stored original */
export function localize(p: Project, locale: Locale): ProjectText {
    if (locale === "ar") return { title: p.title, category: p.category, description: p.description };
    const built = BUILT_IN[p.link]?.[locale];
    const fromDb =
        locale === "en"
            ? { title: p.title_en, category: p.category_en, description: p.description_en }
            : { title: p.title_tr, category: p.category_tr, description: p.description_tr };
    return {
        title: fromDb.title?.trim() || built?.title || p.title,
        category: fromDb.category?.trim() || built?.category || p.category,
        description: fromDb.description?.trim() || built?.description || p.description,
    };
}

/* the prerender seeds the list it fetched at build time; the built page then
   carries the same list in window.__QAWSAN_PROJECTS__ so the first render matches */
let seeded: Project[] | null = null;

export function seedProjects(rows: Project[]) {
    seeded = rows;
}

function initialProjects(): Project[] {
    if (seeded?.length) return seeded;
    if (typeof window !== "undefined" && window.__QAWSAN_PROJECTS__?.length) {
        return window.__QAWSAN_PROJECTS__;
    }
    return fallbackProjects;
}

export async function fetchProjects(): Promise<Project[]> {
    // loaded on demand so the Supabase client stays out of the main bundle
    const { PROJECTS_TABLE, supabase } = await import("../lib/supabase");
    // "*" keeps working before the translation columns exist
    const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row) => withGallery({
        id: row.id,
        title: row.title,
        category: row.category,
        description: row.description,
        link: row.link,
        images: row.images ?? [],
        sort_order: row.sort_order,
        title_en: row.title_en ?? null,
        title_tr: row.title_tr ?? null,
        category_en: row.category_en ?? null,
        category_tr: row.category_tr ?? null,
        description_en: row.description_en ?? null,
        description_tr: row.description_tr ?? null,
    }));
}

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>(initialProjects);

    useEffect(() => {
        let active = true;
        fetchProjects()
            .then((rows) => {
                if (active && rows.length) setProjects(rows);
            })
            .catch(() => {
                /* keep the fallback list */
            });
        return () => {
            active = false;
        };
    }, []);

    return projects;
}
