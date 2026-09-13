import {
    Box,
    Container,
    Typography,
    IconButton,
} from "@mui/material";

import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import BrandingWatermarkOutlinedIcon from "@mui/icons-material/BrandingWatermarkOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const steps = [
    {
        number: "01",
        title: "IDEA",
        description:
            "نفهم فكرتك ونحدد هدف مشروعك.",
        icon: LightbulbOutlinedIcon,
        featured: true,
    },
    {
        number: "02",
        title: "BRAND",
        description:
            "نبني الهوية والاتجاه البصري.",
        icon: BrandingWatermarkOutlinedIcon,
        featured: false,
    },
    {
        number: "03",
        title: "UI / UX",
        description:
            "نصمم تجربة واضحة وسهلة الاستخدام.",
        icon: DesignServicesOutlinedIcon,
        featured: false,
    },
    {
        number: "04",
        title: "CODE",
        description:
            "نحوّل التصميم إلى منتج رقمي فعلي.",
        icon: CodeOutlinedIcon,
        featured: false,
    },
    {
        number: "05",
        title: "TEST",
        description:
            "نختبر ونحسن كل التفاصيل.",
        icon: CheckCircleOutlineOutlinedIcon,
        featured: false,
    },
    {
        number: "06",
        title: "LAUNCH",
        description:
            "نطلق المنتج ليصل إلى مستخدميه.",
        icon: RocketLaunchOutlinedIcon,
        featured: false,
    },
];

function IdeaToProduct() {
    return (
        <Box
            component="section"
            id="services"
            sx={{
                position: "relative",

                py: {
                    xs: 10,
                    md: 16,
                },

                bgcolor:
                    "background.default",

                overflow: "hidden",

                direction: "ltr",
            }}
        >
            {/* ==========================================
                BACKGROUND GLOW
            =========================================== */}

            <Box
                sx={{
                    position: "absolute",

                    top: {
                        xs: -180,
                        md: -280,
                    },

                    left: {
                        xs: -180,
                        md: -260,
                    },

                    width: {
                        xs: 420,
                        md: 680,
                    },

                    height: {
                        xs: 420,
                        md: 680,
                    },

                    borderRadius: "50%",



                    pointerEvents:
                        "none",
                }}
            />

            <Container
                maxWidth="xl"
                sx={{
                    position:
                        "relative",

                    zIndex: 1,
                }}
            >
                {/* ==========================================
                    SECTION HEADER
                =========================================== */}

                <Box
                    sx={{
                        width: "100%",

                        display: "flex",

                        flexDirection:
                            "column",

                        alignItems:
                            "flex-end",

                        mb: {
                            xs: 6,
                            md: 8,
                        },

                        textAlign:
                            "right",

                        direction: "rtl",
                    }}
                >
                    {/* Label */}

                    <Typography
                        component="span"
                        sx={{
                            mb: 2,

                            fontFamily:
                                "Inter, sans-serif",

                            fontSize: 12,

                            fontWeight: 500,

                            letterSpacing:
                                "0.12em",

                            color:
                                "primary.main",

                            direction: "ltr",

                            unicodeBidi:
                                "plaintext",

                            textAlign:
                                "right",
                        }}
                    >
                        {"{ OUR PROCESS }"}
                    </Typography>

                    {/* Heading */}

                    <Typography
                        component="h2"
                        sx={{
                            m: 0,

                            maxWidth: 720,

                            fontSize: {
                                xs: 38,
                                sm: 48,
                                md: 58,
                            },

                            lineHeight: 1.2,

                            fontWeight: 700,

                            letterSpacing:
                                "-0.03em",

                            color:
                                "text.primary",

                            direction:
                                "rtl",

                            unicodeBidi:
                                "plaintext",

                            textAlign:
                                "right",
                        }}
                    >
                        لديك فكرة؟
                    </Typography>

                    <Typography
                        component="h2"
                        sx={{
                            m: 0,

                            maxWidth: 720,

                            fontSize: {
                                xs: 38,
                                sm: 48,
                                md: 58,
                            },

                            lineHeight: 1.2,

                            fontWeight: 700,

                            letterSpacing:
                                "-0.03em",

                            color:
                                "primary.main",

                            direction:
                                "rtl",

                            unicodeBidi:
                                "plaintext",

                            textAlign:
                                "right",
                        }}
                    >
                        نحن نبني ما بعدها.
                    </Typography>

                    {/* Description */}

                    <Typography
                        component="p"
                        sx={{
                            m: 0,

                            mt: 2.5,

                            maxWidth: 570,

                            fontSize: {
                                xs: 15,
                                md: 17,
                            },

                            lineHeight: 1.9,

                            color:
                                "text.secondary",

                            fontWeight: 400,

                            direction:
                                "rtl",

                            unicodeBidi:
                                "plaintext",

                            textAlign:
                                "left",
                        }}
                    >
                        لا تحتاج إلى تصميم جاهز أو
                        هوية مكتملة، نبدأ معك من
                        الفكرة ونحوّلها إلى تجربة
                        رقمية متكاملة.
                    </Typography>
                </Box>

                {/* ==========================================
                    PROCESS GRID
                =========================================== */}

                <Box
                    sx={{
                        position:
                            "relative",

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

                        direction: "ltr",
                    }}
                >
                    {steps.map((step) => {
                        const Icon =
                            step.icon;

                        return (
                            <Box
                                key={
                                    step.number
                                }
                                sx={{
                                    position:
                                        "relative",

                                    minHeight: {
                                        xs: 280,
                                        md: 245,
                                    },

                                    p: {
                                        xs: 3,
                                        md: 4,
                                    },

                                    display:
                                        "flex",

                                    flexDirection:
                                        "column",

                                    justifyContent:
                                        "space-between",

                                    overflow:
                                        "hidden",
                                    border: "1px solid",
                                    borderColor: "divider",

                                    borderRadius:
                                        "16px",

                                    bgcolor:
                                        "background.paper",

                                    direction:
                                        "ltr",

                                    textAlign:
                                        "left",

                                    transition:
                                        "transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease",

                                    "&:hover": {
                                        transform:
                                            "translateY(-7px)",

                                        borderColor:
                                            "primary.main",

                                        boxShadow:
                                            "0 24px 60px rgba(0, 208, 132, 0.10)",
                                    },
                                }}
                            >
                                {/* ==================================
                                    CARD BACKGROUND CIRCLE
                                =================================== */}

                                <Box
                                    sx={{
                                        position:
                                            "absolute",

                                        right:
                                            -80,

                                        bottom:
                                            -100,

                                        width:
                                            250,

                                        height:
                                            250,

                                        borderRadius:
                                            "50%",

                                        background:
                                            "radial-gradient(circle, rgba(0,208,132,0.09) 0%, rgba(0,208,132,0.025) 45%, transparent 70%)",

                                        pointerEvents:
                                            "none",
                                    }}
                                />

                                {/* ==================================
                                    SUBTLE DOT GRID
                                =================================== */}

                                <Box
                                    sx={{
                                        position:
                                            "absolute",

                                        right: 0,

                                        bottom: 0,

                                        width:
                                            130,

                                        height:
                                            100,

                                        opacity:
                                            0.12,

                                        backgroundImage:
                                            "radial-gradient(rgba(0,208,132,0.55) 1px, transparent 1px)",

                                        backgroundSize:
                                            "10px 10px",

                                        maskImage:
                                            "linear-gradient(to bottom left, black, transparent 75%)",

                                        pointerEvents:
                                            "none",
                                    }}
                                />

                                {/* ==================================
                                    NUMBER
                                =================================== */}

                                <Typography
                                    sx={{
                                        position:
                                            "relative",

                                        zIndex: 2,

                                        alignSelf:
                                            "flex-end",

                                        fontFamily:
                                            "Inter, sans-serif",

                                        fontSize: 13,

                                        fontWeight: 500,

                                        letterSpacing:
                                            "0.08em",

                                        color:
                                            "text.secondary",

                                        direction:
                                            "ltr",
                                    }}
                                >
                                    {
                                        step.number
                                    }
                                </Typography>

                                {/* ==================================
                                    ICON
                                =================================== */}

                                <Box
                                    sx={{
                                        position:
                                            "relative",

                                        zIndex: 2,
                                        mb: {
                                            xs: 3,
                                            md: 4,
                                        },
                                        width: 56,

                                        height: 56,

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        border:
                                            "1px solid",

                                        borderColor:
                                            step.featured
                                                ? "rgba(0,208,132,0.45)"
                                                : "rgba(0,208,132,0.25)",

                                        borderRadius:
                                            "14px",

                                        background:
                                            "linear-gradient(145deg, rgba(0,208,132,0.13), rgba(0,208,132,0.025))",

                                        color:
                                            "primary.main",

                                        boxShadow:
                                            step.featured
                                                ? "0 0 30px rgba(0,208,132,0.10)"
                                                : "none",

                                        transition:
                                            "transform 300ms ease, box-shadow 300ms ease",

                                        ".MuiBox-root:hover > &":
                                        {
                                            transform:
                                                "translateY(-2px)",

                                            boxShadow:
                                                "0 0 30px rgba(0,208,132,0.15)",
                                        },
                                    }}
                                >
                                    <Icon
                                        sx={{
                                            fontSize: 28,
                                        }}
                                    />
                                </Box>

                                {/* ==================================
                                    CONTENT
                                =================================== */}

                                <Box
                                    sx={{
                                        position:
                                            "relative",

                                        zIndex: 2,

                                        width:
                                            "100%",

                                        direction:
                                            "ltr",

                                        textAlign:
                                            "left",
                                    }}
                                >
                                    {/* Title */}

                                    <Typography
                                        component="h3"
                                        sx={{
                                            m: 0,

                                            fontFamily:
                                                "Inter, sans-serif",

                                            fontSize: {
                                                xs: 21,
                                                md: 23,
                                            },

                                            fontWeight:
                                                700,

                                            letterSpacing:
                                                "-0.02em",

                                            color:
                                                "text.primary",

                                            direction:
                                                "ltr",

                                            textAlign:
                                                "left",
                                        }}
                                    >
                                        {
                                            step.title
                                        }
                                    </Typography>

                                    {/* Description */}

                                    <Typography
                                        component="p"
                                        sx={{
                                            m: 0,

                                            mt: 0.8,

                                            maxWidth:
                                                300,

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
                                                "left",
                                        }}
                                    >
                                        {
                                            step.description
                                        }
                                    </Typography>
                                </Box>

                                {/* ==================================
                                    ARROW
                                =================================== */}

                                <IconButton
                                    aria-label={`الانتقال إلى ${step.title}`}
                                    sx={{
                                        position:
                                            "relative",

                                        zIndex: 2,
                                        mt: {
                                            xs: 2,
                                            md: 3,
                                        },
                                        alignSelf:
                                            "flex-start",

                                        width: 38,

                                        height: 38,

                                        border:
                                            "1px solid",

                                        borderColor:
                                            "primary.main",

                                        color:
                                            "primary.main",

                                        backgroundColor:
                                            "transparent",

                                        transition:
                                            "all 250ms ease",

                                        "&:hover": {
                                            color:
                                                "#0B0F0E",

                                            backgroundColor:
                                                "primary.main",

                                            transform:
                                                "translateX(4px)",
                                        },
                                    }}
                                >
                                    <ArrowForwardRoundedIcon
                                        sx={{
                                            fontSize: 18,
                                        }}
                                    />
                                </IconButton>

                                {/* ==================================
                                    LARGE BACKGROUND NUMBER
                                =================================== */}

                                <Typography
                                    aria-hidden="true"
                                    sx={{
                                        position:
                                            "absolute",

                                        right:
                                            18,

                                        bottom:
                                            -18,

                                        fontFamily:
                                            "Inter, sans-serif",

                                        fontSize:
                                            86,

                                        fontWeight:
                                            400,

                                        lineHeight:
                                            1,

                                        color:
                                            "primary.main",

                                        opacity:
                                            0.035,

                                        direction:
                                            "ltr",

                                        userSelect:
                                            "none",

                                        pointerEvents:
                                            "none",
                                    }}
                                >
                                    {
                                        step.number
                                    }
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Container>
        </Box>
    );
}

export default IdeaToProduct;