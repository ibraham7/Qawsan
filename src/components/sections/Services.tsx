import {
    Box,
    Container,
    Typography,
} from "@mui/material";

const services = [
    {
        number: "01",
        title: "BRANDING",
        arabicTitle: "الهوية البصرية",
        description:
            "نبني هوية بصرية متكاملة تمنح مشروعك شخصية واضحة وحضورًا مميزًا.",
    },
    {
        number: "02",
        title: "UI / UX",
        arabicTitle: "تصميم التجربة",
        description:
            "نصمم واجهات وتجارب رقمية تجمع بين الجمال، الوضوح، وسهولة الاستخدام.",
    },
    {
        number: "03",
        title: "DEVELOPMENT",
        arabicTitle: "التطوير",
        description:
            "نحوّل التصاميم إلى منتجات رقمية سريعة، متجاوبة، وقابلة للتوسع.",
    },
    {
        number: "04",
        title: "DIGITAL PRODUCTS",
        arabicTitle: "المنتجات الرقمية",
        description:
            "نطوّر المنصات والمنتجات الرقمية من الفكرة الأولى حتى الإطلاق.",
    },
];

function Services() {
    return (
        <Box
            component="section"
            id="services"
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
                {/* ==========================================
            SECTION HEADER
        =========================================== */}

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

                        justifyContent: "space-between",

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
                            {"{ SERVICES }"}
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
                            نبني أكثر من
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
                                موقع.
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

                            fontWeight: 400,
                        }}
                    >
                        من بناء الهوية إلى تطوير المنتج،
                        نجمع التصميم والتقنية في تجربة
                        واحدة متكاملة.
                    </Typography>
                </Box>

                {/* ==========================================
            SERVICES GRID
        =========================================== */}

                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            lg: "repeat(4, 1fr)",
                        },

                        gap: {
                            xs: 2,
                            md: 3,
                        },
                    }}
                >
                    {services.map((service) => (
                        <Box
                            key={service.number}
                            sx={{
                                position: "relative",

                                minHeight: {
                                    xs: 300,
                                    md: 340,
                                },

                                p: {
                                    xs: 3,
                                    md: 4,
                                },

                                display: "flex",

                                flexDirection:
                                    "column",

                                justifyContent:
                                    "space-between",

                                overflow: "hidden",

                                border: "1px solid",

                                borderColor:
                                    "divider",

                                borderRadius: "16px",

                                bgcolor:
                                    "background.paper",

                                transition:
                                    "transform 250ms ease, border-color 250ms ease, box-shadow 250ms ease",

                                "&:hover": {
                                    transform:
                                        "translateY(-6px)",

                                    borderColor:
                                        "primary.main",

                                    boxShadow:
                                        "0 20px 50px rgba(0, 208, 132, 0.08)",
                                },
                            }}
                        >
                            {/* Number */}

                            <Typography
                                sx={{
                                    fontFamily:
                                        "Inter, sans-serif",

                                    fontSize: 13,

                                    fontWeight: 500,

                                    letterSpacing:
                                        "0.08em",

                                    color:
                                        "text.secondary",
                                }}
                            >
                                {service.number}
                            </Typography>

                            {/* Icon / Braces */}

                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,

                                    display: "flex",

                                    alignItems: "center",

                                    justifyContent:
                                        "center",

                                    border: "1px solid",

                                    borderColor:
                                        "divider",

                                    borderRadius:
                                        "12px",

                                    color:
                                        "primary.main",

                                    fontFamily:
                                        "Inter, sans-serif",

                                    fontSize: 24,

                                    direction: "ltr",

                                    transition:
                                        "all 250ms ease",

                                    ".MuiBox-root:hover &":
                                    {
                                        borderColor:
                                            "primary.main",
                                    },
                                }}
                            >
                                {"{}"}
                            </Box>

                            {/* Content */}

                            <Box>
                                <Typography
                                    component="h3"
                                    sx={{
                                        m: 0,

                                        fontFamily:
                                            "Inter, sans-serif",

                                        fontSize: {
                                            xs: 20,
                                            md: 22,
                                        },

                                        fontWeight: 700,

                                        letterSpacing:
                                            "-0.02em",

                                        color:
                                            "text.primary",
                                    }}
                                >
                                    {service.title}
                                </Typography>

                                <Typography
                                    component="h4"
                                    sx={{
                                        m: 0,

                                        mt: 0.5,

                                        fontSize: 17,

                                        fontWeight: 500,

                                        color:
                                            "primary.main",
                                    }}
                                >
                                    {service.arabicTitle}
                                </Typography>

                                <Typography
                                    component="p"
                                    sx={{
                                        m: 0,

                                        mt: 1.5,

                                        fontSize: 14,

                                        lineHeight: 1.9,

                                        color:
                                            "text.secondary",
                                    }}
                                >
                                    {service.description}
                                </Typography>
                            </Box>

                            {/* Decorative Braces */}

                            <Typography
                                aria-hidden="true"
                                sx={{
                                    position: "absolute",

                                    left: -8,

                                    bottom: -30,

                                    fontFamily:
                                        "Inter, sans-serif",

                                    fontSize: 150,

                                    lineHeight: 1,

                                    color:
                                        "primary.main",

                                    opacity: 0.025,

                                    direction: "ltr",

                                    userSelect:
                                        "none",

                                    pointerEvents:
                                        "none",
                                }}
                            >
                                {"{}"}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}

export default Services;