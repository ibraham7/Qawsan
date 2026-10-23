export interface Project {
    number: string;
    title: string;
    category: string;
    description: string;
    image: string;
    link: string;
    /** how the screenshot fills the card (default: cover) */
    fit?: "cover" | "contain";
    /** background shown behind a contained screenshot */
    bg?: string;
    /** object-position of the screenshot inside the card */
    position?: string;
}

/* المشاريع المعروضة في الواجهة */
export const featuredProjects: Project[] = [
    {
        number: "01",
        title: "Clinova",
        category: "UI/UX · Development",
        description:
            "نظام متكامل لإدارة العيادات: المواعيد، ملفات المرضى، والتقارير في تجربة واحدة سلسة وسهلة الاستخدام.",
        image: "/images/projects/clinova.png",
        link: "https://clinova.novanoai.online/",
    },
    {
        number: "02",
        title: "NovaSales",
        category: "UI/UX · Development",
        description:
            "منصة لإدارة المبيعات والعملاء، تمنح الفرق رؤية واضحة للأداء وتختصر الوقت في المهام اليومية.",
        image: "/images/projects/novasales.png",
        link: "https://sales.novanoai.online/",
    },
    {
        number: "03",
        title: "نظام الجامعة",
        category: "System Design · Development",
        description:
            "نظام جامعي شامل لإدارة الطلاب والمقررات والأقسام، مبني بمعمارية قابلة للتوسع.",
        image: "/images/projects/university-system.png",
        link: "https://uni.novanoai.online/",
    },
];

/* باقي المشاريع تظهر في صفحة /projects */
export const moreProjects: Project[] = [
    {
        number: "04",
        title: "ورد لتعليم القرآن الكريم",
        category: "Branding · UI/UX · Development",
        description:
            "منصة رقمية لتعليم القرآن الكريم وعلومه، صُممت لتقديم تجربة تعليمية بسيطة وواضحة تجمع بين الهوية البصرية الهادئة وسهولة الاستخدام.",
        image: "/images/projects/wird.jpg",
        link: "https://wird-platform.vercel.app/",
        position: "top center",
    },
    {
        number: "05",
        title: "مركز ربانيون",
        category: "Development",
        description:
            "تطوير موقع رقمي لمركز ربانيون، مع تنفيذ الواجهة برمجيًا وبناء تجربة عربية متجاوبة تعمل بسلاسة على مختلف أحجام الشاشات.",
        image: "/images/projects/rabbanioon.jpg",
        link: "https://rpanyon.com/",
        fit: "contain",
        bg: "#272f55",
    },
    {
        number: "06",
        title: "ثانوية أبي عبيدة ابن الجراح",
        category: "Branding · UI/UX · Development",
        description:
            "موقع رقمي متكامل تم تنفيذه من الصفر، بدءًا من بناء الهوية البصرية وتصميم الواجهة، وصولًا إلى تطوير الموقع وكتابة الكود.",
        image: "/images/projects/abi-ubaida.jpg",
        link: "#",
        fit: "contain",
        bg: "#0f3a2c",
    },
];

export const allProjects: Project[] = [...featuredProjects, ...moreProjects];
