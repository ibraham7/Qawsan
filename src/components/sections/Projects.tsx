import {
    Box,
    Container,
    Typography,
} from "@mui/material";

const projects = [
    {
        number: "01",
        title: "اسم المشروع الأول",
        category: "UI/UX · Development",
        description:
            "تجربة رقمية متكاملة صُممت وطُورت لتقديم تجربة واضحة وحديثة.",
        size: "large",
    },
    {
        number: "02",
        title: "اسم المشروع الثاني",
        category: "Branding · UI/UX",
        description:
            "هوية وتجربة بصرية متكاملة لمشروع رقمي.",
        size: "small",
    },
    {
        number: "03",
        title: "اسم المشروع الثالث",
        category: "Web Development",
        description:
            "واجهة رقمية سريعة ومتجاوبة مبنية لتخدم المستخدم.",
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

                bgcolor: "background.default",

                overflow: "hidden",
            }}
        >
            <Container maxWidth="xl">
                {/* Section Header */}

                <Box
                    sx={{
                        display: "flex",

                        flexDirection: {
                            xs: "column",
                            md: "row",
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
                    <Box
                        sx={{
                            maxWidth: 650,
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
                            }}
                        >
                            أعمال تُترجم
                            <Box
                                component="span"
                                sx={{
                                    display: {
                                        xs: "block",
                                        sm: "inline",
                                    },

                                    color:
                                        "primary.main",
                                }}
                            >
                                {" "}
                                الأفكار.
                            </Box>
                        </Typography>
                    </Box>

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
                        }}
                    >
                        مجموعة من المشاريع التي تعكس
                        طريقة تفكيرنا في التصميم والتقنية
                        وبناء التجارب الرقمية.
                    </Typography>
                </Box>

                {/* Projects */}

                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(2, 1fr)",
                        },

                        gap: {
                            xs: 2,
                            md: 3,
                        },
                    }}
                >
                    {projects.map((project, index) => (
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

                                display: "flex",

                                flexDirection:
                                    "column",

                                gap: 2,

                                minWidth: 0,
                            }}
                        >
                            {/* Project Image */}

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
                                        "border-color 250ms ease",

                                    "&:hover": {
                                        borderColor:
                                            "primary.main",
                                    },

                                    "&::before": {
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
                                {/* Temporary Project Visual */}

                                <Box
                                    sx={{
                                        position:
                                            "absolute",

                                        inset: 0,

                                        display: "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        fontFamily:
                                            "Inter, sans-serif",

                                        fontSize: {
                                            xs: 48,
                                            md:
                                                index === 0
                                                    ? 72
                                                    : 56,
                                        },

                                        fontWeight: 700,

                                        letterSpacing:
                                            "-0.05em",

                                        color:
                                            "primary.main",

                                        opacity: 0.35,

                                        userSelect:
                                            "none",
                                    }}
                                >
                                    {"{ }"}
                                </Box>

                                {/* Number */}

                                <Box
                                    sx={{
                                        position:
                                            "absolute",

                                        top: 20,

                                        right: 20,

                                        px: 1.25,

                                        py: 0.6,

                                        border:
                                            "1px solid",

                                        borderColor:
                                            "divider",

                                        borderRadius:
                                            "8px",

                                        bgcolor:
                                            "background.paper",

                                        color:
                                            "text.secondary",

                                        fontFamily:
                                            "Inter, sans-serif",

                                        fontSize: 12,

                                        fontWeight: 500,
                                    }}
                                >
                                    {project.number}
                                </Box>
                            </Box>

                            {/* Project Information */}

                            <Box
                                sx={{
                                    display:
                                        "flex",

                                    flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                    },

                                    justifyContent:
                                        "space-between",

                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        component="h3"
                                        sx={{
                                            m: 0,

                                            fontSize: {
                                                xs: 20,
                                                md: 24,
                                            },

                                            fontWeight: 600,

                                            color:
                                                "text.primary",
                                        }}
                                    >
                                        {project.title}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.5,

                                            fontFamily:
                                                "Inter, sans-serif",

                                            fontSize: 12,

                                            fontWeight: 500,

                                            letterSpacing:
                                                "0.03em",

                                            color:
                                                "primary.main",
                                        }}
                                    >
                                        {project.category}
                                    </Typography>
                                </Box>

                                <Typography
                                    sx={{
                                        maxWidth: 400,

                                        m: 0,

                                        fontSize: 14,

                                        lineHeight: 1.8,

                                        color:
                                            "text.secondary",
                                    }}
                                >
                                    {project.description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}

export default Projects;