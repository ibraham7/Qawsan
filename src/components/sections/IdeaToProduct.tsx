import { Box, Container, Typography } from "@mui/material";

const steps = [
    {
        number: "01",
        title: "IDEA",
        description: "نفهم فكرتك وهدف مشروعك.",
    },
    {
        number: "02",
        title: "BRAND",
        description: "نبني الهوية والاتجاه البصري.",
    },
    {
        number: "03",
        title: "UI / UX",
        description: "نصمم تجربة واضحة وسهلة الاستخدام.",
    },
    {
        number: "04",
        title: "CODE",
        description: "نحوّل التصميم إلى منتج رقمي فعلي.",
    },
    {
        number: "05",
        title: "TEST",
        description: "نختبر ونحسن كل التفاصيل.",
    },
    {
        number: "06",
        title: "LAUNCH",
        description: "نطلق المنتج ليصل إلى مستخدميه.",
    },
];

function IdeaToProduct() {
    return (
        <Box
            component="section"
            id="process"
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
                        maxWidth: 700,

                        mb: {
                            xs: 7,
                            md: 10,
                        },
                    }}
                >
                    {/* Label */}

                    <Typography
                        component="span"
                        sx={{
                            display: "inline-block",

                            mb: 2,

                            fontFamily: "Inter, sans-serif",

                            fontSize: 13,

                            fontWeight: 500,

                            letterSpacing: "0.12em",

                            color: "primary.main",

                            textTransform: "uppercase",
                        }}
                    >
                        {"{ OUR PROCESS }"}
                    </Typography>

                    {/* Heading */}

                    <Typography
                        component="h2"
                        sx={{
                            m: 0,

                            fontSize: {
                                xs: "36px",
                                sm: "44px",
                                md: "52px",
                            },

                            lineHeight: 1.25,

                            fontWeight: 700,

                            letterSpacing: "-0.025em",

                            color: "text.primary",
                        }}
                    >
                        لديك فكرة؟
                        <Box
                            component="span"
                            sx={{
                                display: "block",

                                color: "primary.main",
                            }}
                        >
                            نحن نبني ما بعدها.
                        </Box>
                    </Typography>

                    {/* Description */}

                    <Typography
                        component="p"
                        sx={{
                            m: 0,

                            mt: 3,

                            maxWidth: 620,

                            fontSize: {
                                xs: 16,
                                md: 18,
                            },

                            lineHeight: 1.9,

                            color: "text.secondary",

                            fontWeight: 400,
                        }}
                    >
                        لا تحتاج إلى تصميم جاهز أو هوية مكتملة. نبدأ معك
                        من الفكرة، ونحوّلها إلى تجربة رقمية متكاملة.
                    </Typography>
                </Box>

                {/* Steps */}

                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            lg: "repeat(3, 1fr)",
                        },

                        gap: {
                            xs: 2,
                            md: 3,
                        },
                    }}
                >
                    {steps.map((step, index) => (
                        <Box
                            key={step.number}
                            sx={{
                                position: "relative",

                                minHeight: {
                                    xs: 190,
                                    md: 220,
                                },

                                p: {
                                    xs: 3,
                                    md: 4,
                                },

                                display: "flex",

                                flexDirection: "column",

                                justifyContent: "space-between",

                                border: "1px solid",

                                borderColor: "divider",

                                borderRadius: "16px",

                                bgcolor: "background.paper",

                                transition:
                                    "transform 250ms ease, border-color 250ms ease",

                                "&:hover": {
                                    transform:
                                        "translateY(-5px)",

                                    borderColor:
                                        "primary.main",
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

                                    color:
                                        "text.secondary",

                                    letterSpacing:
                                        "0.08em",
                                }}
                            >
                                {step.number}
                            </Typography>

                            {/* Content */}

                            <Box>
                                <Typography
                                    component="h3"
                                    sx={{
                                        m: 0,

                                        fontFamily:
                                            "Inter, sans-serif",

                                        fontSize: {
                                            xs: 22,
                                            md: 26,
                                        },

                                        fontWeight: 700,

                                        letterSpacing:
                                            "-0.02em",

                                        color:
                                            "text.primary",
                                    }}
                                >
                                    {step.title}
                                </Typography>

                                <Typography
                                    component="p"
                                    sx={{
                                        m: 0,

                                        mt: 1,

                                        fontSize: 15,

                                        lineHeight: 1.8,

                                        color:
                                            "text.secondary",
                                    }}
                                >
                                    {step.description}
                                </Typography>
                            </Box>

                            {/* Braces */}

                            <Typography
                                aria-hidden="true"
                                sx={{
                                    position: "absolute",

                                    left: 20,

                                    bottom: 12,

                                    fontFamily:
                                        "Inter, sans-serif",

                                    fontSize: 30,

                                    fontWeight: 400,

                                    color:
                                        "primary.main",

                                    opacity: 0.12,

                                    direction: "ltr",

                                    userSelect: "none",
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

export default IdeaToProduct;