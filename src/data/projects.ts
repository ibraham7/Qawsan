import { useEffect, useState } from "react";

import { PROJECTS_TABLE, supabase } from "../lib/supabase";

export interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    link: string;
    images: string[];
    sort_order: number;
}

export type ProjectInput = Omit<Project, "id">;

/* shown until Supabase answers, and if it can't be reached */
export const fallbackProjects: Project[] = [
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

export async function fetchProjects(): Promise<Project[]> {
    const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select("id, title, category, description, link, images, sort_order")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>(fallbackProjects);

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
