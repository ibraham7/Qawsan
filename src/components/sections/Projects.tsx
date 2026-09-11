import {
    Box,
    Container,
    Typography,
    Button,
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
        category:
            "Development",
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
                    xs: 10,
                    md: 16,
                },

                bgcolor:
                    "background.default",

                overflow: "hidden",
            }}
        >
            <Container maxWidth="xl">

                {/* ==========================================
                    SECTION HEADER
                =========================================== */}

                <Box
                    sx={{
                        display: "flex",

                        flexDirection: {
                            xs: "column",
                            md: "row-reverse",
                        },

                        alignItems: {
                            xs: "flex-start",
                            md: "flex-end",
                        },

                        justifyContent:
                            "space-between",

                        gap: 4,

                        mb: {
                            xs: 6,
                            md: 8,
                        },
                    }}
                >

                    {/* Heading */}

                    <Box
                        sx={{
                            maxWidth: 650,

                            direction: "ltr",

                            textAlign: "left",
                        }}
                    >

                        <Typography
                            component="span"
                            sx={{
                                display: "block",

                                mb: 2,

                                fontFamily:
                                    "Inter, sans-serif",

                                fontSize: 13,

                                fontWeight: 500,

                                letterSpacing:
                                    "0.12em",

                                color:
                                    "primary.main",

                                direction: "ltr",
                            }}
                        >
                            {"{ SELECTED WORK }"}
                        </Typography>

                        <Typography
                            component="h2"
                            sx={{
                                m: 0,

                                fontSize: {
                                    xs: 36,
                                    sm: 44,
                                    md: 52,
                                },

                                lineHeight: 1.2,

                                fontWeight: 700,

                                letterSpacing:
                                    "-0.025em",

                                color:
                                    "text.primary",

                                direction: "rtl",

                                unicodeBidi:
                                    "plaintext",

                                textAlign: "right",
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

                            maxWidth: 430,

                            fontSize: {
                                xs: 15,
                                md: 17,
                            },

                            lineHeight: 1.9,

                            color:
                                "text.secondary",

                            direction: "rtl",

                            unicodeBidi:
                                "plaintext",

                            textAlign: "left",
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
                            md: 5,
                        },

                        direction: "ltr",
                    }}
                >

                    {projects.map(
                        (project, index) => (
                            <Box
                                key={
                                    project.number
                                }
                                sx={{
                                    gridColumn:
                                        index === 0
                                            ? {
                                                xs: "auto",
                                                md: "span 2",
                                            }
                                            : "auto",

                                    minWidth: 0,

                                    direction:
                                        "ltr",
                                }}
                            >

                                {/* ==================================
                                    PROJECT IMAGE
                                =================================== */}

                                <Box
                                    sx={{
                                        position:
                                            "relative",

                                        aspectRatio:
                                            index === 0
                                                ? "2.1 / 1"
                                                : "1.35 / 1",

                                        overflow:
                                            "hidden",

                                        borderRadius:
                                            "16px",

                                        border:
                                            "1px solid",

                                        borderColor:
                                            "divider",

                                        bgcolor:
                                            "background.paper",

                                        transition:
                                            "border-color 250ms ease, transform 300ms ease",

                                        "&:hover": {
                                            borderColor:
                                                "primary.main",

                                            transform:
                                                "translateY(-4px)",
                                        },

                                        "&:hover img": {
                                            transform:
                                                "scale(1.025)",
                                        },

                                        "&::after": {
                                            content:
                                                '""',

                                            position:
                                                "absolute",

                                            inset: 0,

                                            background:
                                                "linear-gradient(135deg, rgba(0,208,132,0.08), transparent 45%)",

                                            pointerEvents:
                                                "none",
                                        },
                                    }}
                                >

                                    {project.image ? (
                                        <Box
                                            component="img"
                                            src={
                                                project.image
                                            }
                                            alt={
                                                project.title
                                            }
                                            sx={{
                                                width: "100%",

                                                height: "100%",

                                                objectFit:
                                                    "cover",

                                                display:
                                                    "block",

                                                transition:
                                                    "transform 500ms ease",
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                position:
                                                    "absolute",

                                                inset: 0,

                                                display:
                                                    "flex",

                                                alignItems:
                                                    "center",

                                                justifyContent:
                                                    "center",

                                                fontFamily:
                                                    "Inter, sans-serif",

                                                fontSize: {
                                                    xs: 48,
                                                    md:
                                                        index ===
                                                            0
                                                            ? 72
                                                            : 56,
                                                },

                                                fontWeight:
                                                    700,

                                                color:
                                                    "primary.main",

                                                opacity:
                                                    0.35,

                                                userSelect:
                                                    "none",
                                            }}
                                        >
                                            {"{ }"}
                                        </Box>
                                    )}

                                    {/* Number */}

                                    <Box
                                        sx={{
                                            position:
                                                "absolute",

                                            top: 20,

                                            left: 20,

                                            px: 1.25,

                                            py: 0.6,

                                            border:
                                                "1px solid",

                                            borderColor:
                                                "divider",

                                            borderRadius:
                                                "8px",

                                            bgcolor:
                                                "rgba(11, 15, 14, 0.72)",

                                            backdropFilter:
                                                "blur(10px)",

                                            color:
                                                "text.secondary",

                                            fontFamily:
                                                "Inter, sans-serif",

                                            fontSize: 12,

                                            fontWeight:
                                                500,

                                            zIndex: 2,
                                        }}
                                    >
                                        {
                                            project.number
                                        }
                                    </Box>

                                </Box>

                                {/* ==================================
                                    PROJECT INFORMATION
                                =================================== */}

                                <Box
                                    sx={{
                                        mt: 2,

                                        display: "flex",

                                        flexDirection: {
                                            xs: "column",
                                            sm: "row",
                                        },

                                        justifyContent:
                                            "space-between",

                                        alignItems: {
                                            xs: "flex-start",
                                            sm: "flex-start",
                                        },

                                        gap: 2,

                                        direction:
                                            "ltr",
                                    }}
                                >

                                    {/* Project Name */}

                                    <Box
                                        sx={{
                                            direction:
                                                "rtl",

                                            textAlign:
                                                "right",
                                        }}
                                    >

                                        <Typography
                                            component="h3"
                                            sx={{
                                                m: 0,

                                                fontSize: {
                                                    xs: 20,
                                                    md: 24,
                                                },

                                                fontWeight:
                                                    600,

                                                color:
                                                    "text.primary",

                                                direction:
                                                    "rtl",

                                                unicodeBidi:
                                                    "plaintext",
                                            }}
                                        >
                                            {
                                                project.title
                                            }
                                        </Typography>

                                        <Typography
                                            sx={{
                                                mt: 0.5,

                                                fontFamily:
                                                    "Inter, sans-serif",

                                                fontSize: 12,

                                                fontWeight:
                                                    500,

                                                letterSpacing:
                                                    "0.03em",

                                                color:
                                                    "primary.main",

                                                direction:
                                                    "ltr",

                                                textAlign:
                                                    "right",
                                            }}
                                        >
                                            {
                                                project.category
                                            }
                                        </Typography>

                                    </Box>

                                    {/* Description + Link */}

                                    <Box
                                        sx={{
                                            display:
                                                "flex",

                                            flexDirection:
                                                "column",

                                            alignItems: {
                                                xs: "flex-start",
                                                sm: "flex-end",
                                            },

                                            gap: 1.5,

                                            direction:
                                                "rtl",
                                        }}
                                    >

                                        <Typography
                                            sx={{
                                                maxWidth:
                                                    400,

                                                m: 0,

                                                fontSize: 14,

                                                lineHeight:
                                                    1.8,

                                                color:
                                                    "text.secondary",

                                                direction:
                                                    "rtl",

                                                unicodeBidi:
                                                    "plaintext",

                                                textAlign:
                                                    "right",
                                            }}
                                        >
                                            {
                                                project.description
                                            }
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

                                                        fontSize:
                                                            14,

                                                        fontWeight:
                                                            500,

                                                        color:
                                                            "primary.main",

                                                        direction:
                                                            "ltr",

                                                        "&:hover":
                                                        {
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