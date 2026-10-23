import { useState } from "react";

import {
    Box,
    Button,
    Container,
    Pagination,
    Typography,
} from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

interface Project {
    number: string;
    title: string;
    category: string;
    description: string;
    image: string;
    link: string;
}

/* المشاريع المعروضة في الواجهة */
const featuredProjects: Project[] = [
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

/* باقي المشاريع تظهر في قسم الأرشيف مع تقسيم صفحات */
const moreProjects: Project[] = [
    {
        number: "04",
        title: "ورد لتعليم القرآن الكريم",
        category: "Branding · UI/UX · Development",
        description:
            "منصة رقمية لتعليم القرآن الكريم وعلومه، صُممت لتقديم تجربة تعليمية بسيطة وواضحة تجمع بين الهوية البصرية الهادئة وسهولة الاستخدام.",
        image: "/images/projects/wird.jpg",
        link: "https://wird-platform.vercel.app/",
    },
    {
        number: "05",
        title: "مركز ربانيون",
        category: "Development",
        description:
            "تطوير موقع رقمي لمركز ربانيون، مع تنفيذ الواجهة برمجيًا وبناء تجربة عربية متجاوبة تعمل بسلاسة على مختلف أحجام الشاشات.",
        image: "/images/projects/rabbanioon.jpg",
        link: "https://rpanyon.com/",
    },
    {
        number: "06",
        title: "ثانوية أبي عبيدة ابن الجراح",
        category: "Branding · UI/UX · Development",
        description:
            "موقع رقمي متكامل تم تنفيذه من الصفر، بدءًا من بناء الهوية البصرية وتصميم الواجهة، وصولًا إلى تطوير الموقع وكتابة الكود.",
        image: "/images/projects/abi-ubaida.jpg",
        link: "#",
    },
];

const PAGE_SIZE = 2;

function ProjectCard({ project }: { project: Project }) {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                height: "100%",
                overflow: "hidden",
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                transition:
                    "border-color 250ms ease, transform 300ms ease, box-shadow 300ms ease",
                "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 50px rgba(0, 208, 132, 0.06)",
                },
                "&:hover img": { transform: "scale(1.03)" },
            }}
        >
            {/* IMAGE */}
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 10",
                    overflow: "hidden",
                    background:
                        "linear-gradient(135deg, rgba(0,208,132,0.16), rgba(0,208,132,0.02))",
                }}
            >
                {imageFailed ? (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            px: 2,
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: 700,
                            color: "primary.main",
                        }}
                    >
                        {project.title}
                    </Box>
                ) : (
                    <Box
                        component="img"
                        src={project.image}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImageFailed(true)}
                        sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            display: "block",
                            objectFit: "cover",
                            objectPosition: "top center",
                            transition: "transform 500ms ease",
                            userSelect: "none",
                        }}
                    />
                )}

                <Box
                    sx={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                        px: 1.25,
                        py: 0.5,
                        border: "1px solid rgba(255,255,255,0.18)",
                        borderRadius: "8px",
                        bgcolor: "rgba(11, 15, 14, 0.72)",
                        backdropFilter: "blur(10px)",
                        color: "#F8FAF9",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        zIndex: 2,
                    }}
                >
                    {project.number}
                </Box>
            </Box>

            {/* INFO */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    gap: 1,
                    p: { xs: 2.5, md: 3 },
                    direction: "rtl",
                    textAlign: "right",
                }}
            >
                <Typography
                    component="h3"
                    sx={{
                        m: 0,
                        fontSize: { xs: 18, md: 22 },
                        lineHeight: 1.4,
                        fontWeight: 600,
                        color: "text.primary",
                        unicodeBidi: "plaintext",
                    }}
                >
                    {project.title}
                </Typography>

                <Typography
                    sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: "0.03em",
                        color: "primary.main",
                        direction: "ltr",
                        textAlign: "right",
                    }}
                >
                    {project.category}
                </Typography>

                <Typography
                    sx={{
                        m: 0,
                        fontSize: 14,
                        lineHeight: 1.8,
                        color: "text.secondary",
                        unicodeBidi: "plaintext",
                    }}
                >
                    {project.description}
                </Typography>

                {project.link !== "#" && (
                    <Button
                        component="a"
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<ArrowForwardRoundedIcon />}
                        sx={{
                            mt: "auto",
                            pt: 1,
                            px: 0,
                            minWidth: "auto",
                            alignSelf: "flex-start",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "primary.main",
                            direction: "ltr",
                            "&:hover": {
                                backgroundColor: "transparent",
                                color: "primary.main",
                            },
                        }}
                    >
                        زيارة المشروع
                    </Button>
                )}
            </Box>
        </Box>
    );
}

const gridSx = {
    display: "grid",
    gap: { xs: 3, md: 4 },
    direction: "ltr",
};

function Projects() {
    const [page, setPage] = useState(1);
    const pageCount = Math.ceil(moreProjects.length / PAGE_SIZE);
    const visible = moreProjects.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <Box
            component="section"
            id="projects"
            sx={{
                py: { xs: 8, sm: 10, md: 16 },
                bgcolor: "background.default",
                overflow: "hidden",
            }}
        >
            <Container
                maxWidth={false}
                sx={{
                    maxWidth: 1280,
                    px: { xs: 2.5, sm: 3, md: 4 },
                }}
            >
                {/* SECTION HEADER */}

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: { xs: 2, sm: 2.5, md: 3 },
                        mb: { xs: 5, sm: 6, md: 8 },
                        width: "100%",
                        textAlign: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: { xs: "100%", sm: 700, md: 800 },
                            direction: "rtl",
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            component="span"
                            sx={{
                                display: "block",
                                mb: { xs: 1.5, md: 2 },
                                fontFamily: "Inter, sans-serif",
                                fontSize: { xs: 11, sm: 12, md: 13 },
                                fontWeight: 500,
                                letterSpacing: "0.12em",
                                color: "primary.main",
                                direction: "ltr",
                                textAlign: "center",
                            }}
                        >
                            {"{ SELECTED WORK }"}
                        </Typography>

                        <Typography
                            component="h2"
                            sx={{
                                m: 0,
                                fontSize: { xs: 30, sm: 40, md: 52 },
                                lineHeight: { xs: 1.3, md: 1.2 },
                                fontWeight: 700,
                                letterSpacing: "-0.025em",
                                color: "text.primary",
                                direction: "rtl",
                                unicodeBidi: "plaintext",
                                textAlign: "center",
                            }}
                        >
                            أعمال تُترجم{" "}
                            <Box
                                component="span"
                                sx={{
                                    color: "primary.main",
                                    direction: "rtl",
                                    unicodeBidi: "plaintext",
                                }}
                            >
                                الأفكار.
                            </Box>
                        </Typography>
                    </Box>

                    <Typography
                        component="p"
                        sx={{
                            m: 0,
                            width: "100%",
                            maxWidth: { xs: 340, sm: 560, md: 620 },
                            fontSize: { xs: 14, sm: 15, md: 17 },
                            lineHeight: 1.9,
                            color: "text.secondary",
                            direction: "rtl",
                            unicodeBidi: "plaintext",
                            textAlign: "center",
                        }}
                    >
                        مجموعة من المشاريع التي تعكس طريقة تفكيرنا في
                        التصميم والتقنية وبناء التجارب الرقمية.
                    </Typography>
                </Box>

                {/* FEATURED PROJECTS */}

                <Box
                    sx={{
                        ...gridSx,
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                    }}
                >
                    {featuredProjects.map((project) => (
                        <ProjectCard
                            key={project.number}
                            project={project}
                        />
                    ))}
                </Box>

                {/* MORE PROJECTS (PAGINATED) */}

                <Box sx={{ mt: { xs: 8, md: 12 } }}>
                    <Typography
                        component="h3"
                        sx={{
                            m: 0,
                            mb: { xs: 3, md: 4 },
                            fontSize: { xs: 22, md: 28 },
                            fontWeight: 700,
                            color: "text.primary",
                            direction: "rtl",
                            textAlign: "right",
                        }}
                    >
                        مشاريع أخرى
                    </Typography>

                    <Box
                        sx={{
                            ...gridSx,
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                            },
                        }}
                    >
                        {visible.map((project) => (
                            <ProjectCard
                                key={project.number}
                                project={project}
                            />
                        ))}
                    </Box>

                    {pageCount > 1 && (
                        <Box
                            sx={{
                                mt: 5,
                                display: "flex",
                                justifyContent: "center",
                                direction: "ltr",
                            }}
                        >
                            <Pagination
                                count={pageCount}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                                shape="rounded"
                            />
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    );
}

export default Projects;
