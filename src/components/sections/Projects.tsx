import {
    Box,
    Button,
    Container,
    Typography,
} from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const projects = [
    {
        number: "01",
        title: "ورد لتعليم القرآن الكريم",
        category:
            "Branding · UI/UX · Development",
        description:
            "منصة رقمية لتعليم القرآن الكريم وعلومه، صُممت لتقديم تجربة تعليمية بسيطة وواضحة تجمع بين الهوية البصرية الهادئة وسهولة الاستخدام.",
        image: "/images/projects/wird.jpg",
        link: "https://wird-platform.vercel.app/",
        size: "large",
    },

    {
        number: "02",
        title: "مركز ربانيون",
        category: "Development",
        description:
            "تطوير موقع رقمي لمركز ربانيون، مع تنفيذ الواجهة برمجيًا وبناء تجربة عربية متجاوبة تعمل بسلاسة على مختلف أحجام الشاشات.",
        image: "/images/projects/rabbanioon.jpg",
        link: "https://rpanyon.com/",
        size: "small",
    },

    {
        number: "03",
        title: "ثانوية أبي عبيدة ابن الجراح",
        category:
            "Branding · UI/UX · Development",
        description:
            "موقع رقمي متكامل تم تنفيذه من الصفر، بدءًا من بناء الهوية البصرية وتصميم الواجهة، وصولًا إلى تطوير الموقع وكتابة الكود.",
        image: "/images/projects/abi-ubaida.jpg",
        link: "#",
        size: "small",
    },
];

function Projects() {
    return (
        <Box
            component="section"
            id="projects"
            sx={{
                py: {
                    xs: 8,
                    sm: 10,
                    md: 16,
                },

                bgcolor:
                    "background.default",

                overflow: "hidden",
            }}
        >
            <Container
                maxWidth={false}
                sx={{
                    maxWidth: 1280,

                    px: {
                        xs: 2.5,
                        sm: 3,
                        md: 4,
                    },
                }}
            >


                {/* ==========================================
    SECTION HEADER
========================================== */}

                <Box
                    sx={{
                        display: "flex",

                        flexDirection: "column",

                        alignItems: "center",

                        justifyContent: "center",

                        gap: {
                            xs: 2,
                            sm: 2.5,
                            md: 3,
                        },

                        mb: {
                            xs: 5,
                            sm: 6,
                            md: 8,
                        },

                        width: "100%",

                        textAlign: "center",
                    }}
                >
                    {/* Heading */}

                    <Box
                        sx={{
                            width: "100%",

                            maxWidth: {
                                xs: "100%",
                                sm: 700,
                                md: 800,
                            },

                            direction: "rtl",

                            textAlign: "center",
                        }}
                    >
                        <Typography
                            component="span"
                            sx={{
                                display: "block",

                                mb: {
                                    xs: 1.5,
                                    md: 2,
                                },

                                fontFamily:
                                    "Inter, sans-serif",

                                fontSize: {
                                    xs: 11,
                                    sm: 12,
                                    md: 13,
                                },

                                fontWeight: 500,

                                letterSpacing:
                                    "0.12em",

                                color:
                                    "primary.main",

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

                                fontSize: {
                                    xs: 30,
                                    sm: 40,
                                    md: 52,
                                },

                                lineHeight: {
                                    xs: 1.3,
                                    md: 1.2,
                                },

                                fontWeight: 700,

                                letterSpacing:
                                    "-0.025em",

                                color:
                                    "text.primary",

                                direction: "rtl",

                                unicodeBidi:
                                    "plaintext",

                                textAlign: "center",
                            }}
                        >
                            أعمال تُترجم{" "}

                            <Box
                                component="span"
                                sx={{
                                    color:
                                        "primary.main",

                                    direction:
                                        "rtl",

                                    unicodeBidi:
                                        "plaintext",
                                }}
                            >
                                الأفكار.
                            </Box>
                        </Typography>
                    </Box>

                    {/* Description */}

                    <Typography
                        component="p"
                        sx={{
                            m: 0,

                            width: "100%",

                            maxWidth: {
                                xs: 340,
                                sm: 560,
                                md: 620,
                            },

                            fontSize: {
                                xs: 14,
                                sm: 15,
                                md: 17,
                            },

                            lineHeight: 1.9,

                            color:
                                "text.secondary",

                            direction: "rtl",

                            unicodeBidi:
                                "plaintext",

                            textAlign: "center",
                        }}
                    >
                        مجموعة من المشاريع التي تعكس
                        طريقة تفكيرنا في التصميم
                        والتقنية وبناء التجارب الرقمية.
                    </Typography>
                </Box>
                {/* ==========================================
            PROJECTS
        =========================================== */}

                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(2, 1fr)",
                        },

                        gap: {
                            xs: 4,
                            sm: 4.5,
                            md: 5,
                        },

                        direction: "ltr",
                    }}
                >
                    {projects.map(
                        (project, index) => (
                            <Box
                                key={project.number}
                                sx={{
                                    gridColumn:
                                        index === 0
                                            ? {
                                                xs: "auto",
                                                md: "span 2",
                                            }
                                            : "auto",

                                    minWidth: 0,

                                    width: "100%",

                                    direction: "ltr",
                                }}
                            >
                                {/* ==================================
                    PROJECT IMAGE CARD
                =================================== */}

                                <Box
                                    sx={{
                                        position:
                                            "relative",

                                        width: "100%",

                                        aspectRatio:
                                            index === 0
                                                ? {
                                                    xs: "1.55 / 1",
                                                    sm: "1.85 / 1",
                                                    md: "2.1 / 1",
                                                }
                                                : {
                                                    xs: "1.5 / 1",
                                                    sm: "1.65 / 1",
                                                    md: "1.55 / 1",
                                                },

                                        overflow:
                                            "hidden",

                                        borderRadius: {
                                            xs: "12px",
                                            sm: "14px",
                                            md: "16px",
                                        },

                                        border: "1px solid",

                                        borderColor:
                                            "divider",

                                        bgcolor:
                                            "background.paper",

                                        transition:
                                            "border-color 250ms ease, transform 300ms ease, box-shadow 300ms ease",

                                        "&:hover": {
                                            borderColor:
                                                "primary.main",

                                            transform:
                                                "translateY(-4px)",

                                            boxShadow:
                                                "0 20px 50px rgba(0, 208, 132, 0.06)",
                                        },

                                        "&:hover img": {
                                            transform:
                                                "scale(1.025)",
                                        },

                                        "&::after": {
                                            content: '""',

                                            position:
                                                "absolute",

                                            inset: 0,

                                            background:
                                                "linear-gradient(135deg, rgba(0,208,132,0.08), transparent 45%)",

                                            pointerEvents:
                                                "none",

                                            zIndex: 1,
                                        },
                                    }}
                                >
                                    {/* PROJECT IMAGE */}

                                    <Box
                                        component="img"
                                        src={project.image}
                                        alt={project.title}
                                        loading={
                                            index === 0
                                                ? "eager"
                                                : "lazy"
                                        }
                                        decoding="async"
                                        sx={{
                                            position:
                                                "absolute",

                                            inset: 0,

                                            width: "100%",

                                            height: "100%",

                                            display:
                                                "block",

                                            objectFit:
                                                "cover",

                                            objectPosition:
                                                "center center",

                                            maxWidth: "none",

                                            transition:
                                                "transform 500ms ease",

                                            userSelect:
                                                "none",
                                        }}
                                    />

                                    {/* NUMBER */}

                                    <Box
                                        sx={{
                                            position:
                                                "absolute",

                                            top: {
                                                xs: 12,
                                                sm: 16,
                                                md: 20,
                                            },

                                            left: {
                                                xs: 12,
                                                sm: 16,
                                                md: 20,
                                            },

                                            px: {
                                                xs: 1,
                                                md: 1.25,
                                            },

                                            py: 0.6,

                                            border: "1px solid",

                                            borderColor:
                                                "rgba(255,255,255,0.18)",

                                            borderRadius:
                                                "8px",

                                            bgcolor:
                                                "rgba(11, 15, 14, 0.72)",

                                            backdropFilter:
                                                "blur(10px)",

                                            color:
                                                "#F8FAF9",

                                            fontFamily:
                                                "Inter, sans-serif",

                                            fontSize: {
                                                xs: 10,
                                                sm: 11,
                                                md: 12,
                                            },

                                            fontWeight: 500,

                                            zIndex: 3,
                                        }}
                                    >
                                        {project.number}
                                    </Box>
                                </Box>

                                {/* ==================================
                    PROJECT INFORMATION
                =================================== */}

                                <Box
                                    sx={{
                                        mt: {
                                            xs: 1.5,
                                            sm: 2,
                                        },

                                        display: "flex",

                                        flexDirection: {
                                            xs: "column",
                                            sm: "row",
                                        },

                                        justifyContent:
                                            "space-between",

                                        alignItems: {
                                            xs: "center",
                                            sm: "flex-start",
                                        },

                                        gap: {
                                            xs: 2,
                                            sm: 3,
                                        },

                                        direction: {
                                            xs: "rtl",
                                            sm: "ltr",
                                        },

                                        width: "100%",
                                    }}
                                >
                                    {/* Project Name */}

                                    <Box
                                        sx={{
                                            direction:
                                                "rtl",

                                            textAlign: {
                                                xs: "center",
                                                sm: "right",
                                            },

                                            minWidth: 0,

                                            width: {
                                                xs: "100%",
                                                sm: "auto",
                                            },

                                            flex: {
                                                sm: "0 1 auto",
                                            },
                                        }}
                                    >
                                        <Typography
                                            component="h3"
                                            sx={{
                                                m: 0,

                                                fontSize: {
                                                    xs: 18,
                                                    sm: 20,
                                                    md: 24,
                                                },

                                                lineHeight: 1.4,

                                                fontWeight: 600,

                                                color:
                                                    "text.primary",

                                                direction:
                                                    "rtl",

                                                unicodeBidi:
                                                    "plaintext",

                                                textAlign: {
                                                    xs: "center",
                                                    sm: "right",
                                                },
                                            }}
                                        >
                                            {project.title}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                mt: 0.5,

                                                fontFamily:
                                                    "Inter, sans-serif",

                                                fontSize: {
                                                    xs: 10,
                                                    sm: 11,
                                                    md: 12,
                                                },

                                                fontWeight: 500,

                                                letterSpacing:
                                                    "0.03em",

                                                color:
                                                    "primary.main",

                                                direction:
                                                    "ltr",

                                                textAlign: {
                                                    xs: "center",
                                                    sm: "right",
                                                },

                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {project.category}
                                        </Typography>
                                    </Box>

                                    {/* Description + Link */}

                                    <Box
                                        sx={{
                                            display: "flex",

                                            flexDirection:
                                                "column",

                                            alignItems: {
                                                xs: "center",
                                                sm: "flex-end",
                                            },

                                            gap: {
                                                xs: 1,
                                                md: 1.5,
                                            },

                                            direction:
                                                "rtl",

                                            width: {
                                                xs: "100%",
                                                sm: "auto",
                                            },
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                width: "100%",

                                                maxWidth: {
                                                    xs: 340,
                                                    sm: 400,
                                                },

                                                m: 0,

                                                fontSize: {
                                                    xs: 13,
                                                    sm: 14,
                                                },

                                                lineHeight: 1.8,

                                                color:
                                                    "text.secondary",

                                                direction:
                                                    "rtl",

                                                unicodeBidi:
                                                    "plaintext",

                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            {project.description}
                                        </Typography>

                                        {/* Project Link */}

                                        {project.link !==
                                            "#" && (
                                                <Button
                                                    component="a"
                                                    href={
                                                        project.link
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    endIcon={
                                                        <ArrowForwardRoundedIcon />
                                                    }
                                                    sx={{
                                                        px: 0,

                                                        minWidth:
                                                            "auto",

                                                        fontSize: {
                                                            xs: 13,
                                                            sm: 14,
                                                        },

                                                        fontWeight: 500,

                                                        color:
                                                            "primary.main",

                                                        direction:
                                                            "ltr",

                                                        alignSelf: {
                                                            xs: "center",
                                                            sm: "flex-end",
                                                        },

                                                        "&:hover": {
                                                            backgroundColor:
                                                                "transparent",

                                                            color:
                                                                "primary.main",
                                                        },
                                                    }}
                                                >
                                                    زيارة المشروع
                                                </Button>
                                            )}
                                    </Box>
                                </Box>
                            </Box>
                        )
                    )}
                </Box>
            </Container>
        </Box>
    );
}

export default Projects;