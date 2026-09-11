import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

function Hero() {
  const theme = useTheme();

  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      component="section"
      id="hero"
      sx={{
        position: "relative",

        minHeight: {
          xs: "calc(100vh - 68px)",
          md: "calc(100vh - 76px)",
        },

        display: "flex",
        alignItems: "center",

        overflow: "hidden",

        bgcolor: "background.default",

        transition:
          "background-color 250ms ease",
      }}
    >
      {/* ==========================================
          BACKGROUND GRID
      =========================================== */}

      <Box
        sx={{
          position: "absolute",

          inset: 0,

          opacity: isDark ? 0.035 : 0.045,

          backgroundImage: `
            linear-gradient(
              ${
                isDark
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(11,23,19,0.25)"
              } 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              ${
                isDark
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(11,23,19,0.25)"
              } 1px,
              transparent 1px
            )
          `,

          backgroundSize: {
            xs: "60px 60px",
            md: "80px 80px",
          },

          maskImage:
            "linear-gradient(to bottom, black, transparent 85%)",

          pointerEvents: "none",
        }}
      />

      {/* ==========================================
          GREEN BACKGROUND GLOW
      =========================================== */}

      <Box
        sx={{
          position: "absolute",

          width: {
            xs: 320,
            md: 620,
          },

          height: {
            xs: 320,
            md: 620,
          },

          borderRadius: "50%",

          background: isDark
            ? "radial-gradient(circle, rgba(0,208,132,0.13) 0%, rgba(0,208,132,0.04) 35%, transparent 70%)"
            : "radial-gradient(circle, rgba(0,168,107,0.10) 0%, rgba(0,168,107,0.035) 35%, transparent 70%)",

          top: "50%",

          left: {
            xs: "50%",
            md: "15%",
          },

          transform:
            "translate(-50%, -50%)",

          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "1.1fr 0.9fr",
            },

            alignItems: "center",

            gap: {
              xs: 6,
              md: 4,
              lg: 8,
            },

            minHeight: {
              xs: "calc(100vh - 68px)",
              md: "calc(100vh - 76px)",
            },

            py: {
              xs: 8,
              md: 10,
            },
          }}
        >
          {/* ==========================================
              TEXT CONTENT
          =========================================== */}

          <Box
            sx={{
              textAlign: {
                xs: "center",
                md: "right",
              },

              maxWidth: 680,

              justifySelf: {
                xs: "center",
                md: "end",
              },
            }}
          >
            {/* Eyebrow */}

            <Box
              sx={{
                display: "inline-flex",

                alignItems: "center",

                gap: 1,

                mb: 3,

                px: 1.5,
                py: 0.75,

                border: "1px solid",
                borderColor: "divider",

                borderRadius: "999px",

                color: "text.secondary",

                backgroundColor:
                  isDark
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(11,23,19,0.025)",
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 7,
                  height: 7,

                  flexShrink: 0,

                  borderRadius: "50%",

                  backgroundColor:
                    "primary.main",

                  boxShadow: isDark
                    ? "0 0 12px rgba(0,208,132,0.7)"
                    : "0 0 10px rgba(0,168,107,0.4)",
                }}
              />

              <Typography
                component="span"
                sx={{
                  fontSize: {
                    xs: 13,
                    md: 14,
                  },

                  fontWeight: 400,

                  color:
                    "text.secondary",
                }}
              >
                استوديو رقمي
              </Typography>
            </Box>

            {/* Main Heading */}

            <Typography
              component="h1"
              sx={{
                m: 0,

                fontSize: {
                  xs: "40px",
                  sm: "48px",
                  md: "58px",
                  lg: "64px",
                },

                lineHeight: {
                  xs: 1.25,
                  md: 1.2,
                },

                fontWeight: 700,

                letterSpacing:
                  "-0.025em",

                color:
                  "text.primary",

                transition:
                  "color 250ms ease",
              }}
            >
              من الفكرة إلى

              <Box
                component="span"
                sx={{
                  display: {
                    xs: "block",
                    md: "inline",
                  },
                }}
              >
                {" "}

                <Box
                  component="span"
                  sx={{
                    color:
                      "primary.main",
                  }}
                >
                  المنتج الرقمي.
                </Box>
              </Box>
            </Typography>

            {/* Description */}

            <Typography
              component="p"
              sx={{
                m: 0,

                mt: 3,

                maxWidth: 580,

                fontSize: {
                  xs: 16,
                  md: 18,
                },

                lineHeight: 1.9,

                fontWeight: 400,

                color:
                  "text.secondary",

                mx: {
                  xs: "auto",
                  md: 0,
                },
              }}
            >
              نبني تجارب رقمية متكاملة
              تبدأ من الفكرة، مرورًا
              بالهوية والتصميم، وصولًا
              إلى التطوير والإطلاق.
            </Typography>

            {/* Buttons */}

            <Box
              sx={{
                display: "flex",

                alignItems: "center",

                justifyContent: {
                  xs: "center",
                  md: "flex-start",
                },

                flexWrap: "wrap",

                gap: 1.5,

                mt: 4,
              }}
            >
              {/* Primary Button */}

              <Button
                href="#contact"
                variant="contained"
                endIcon={
                  <ArrowBackRoundedIcon
                    sx={{
                      transform:
                        "rotate(180deg)",
                    }}
                  />
                }
                sx={{
                  minHeight: 50,

                  px: 3,

                  borderRadius: "10px",

                  backgroundColor:
                    "primary.main",

                  color: isDark
                    ? "#0B0F0E"
                    : "#FFFFFF",

                  fontSize: 15,

                  fontWeight: 500,

                  transition:
                    "transform 200ms ease",

                  "&:hover": {
                    backgroundColor:
                      "primary.main",

                    transform:
                      "translateY(-2px)",
                  },
                }}
              >
                ابدأ مشروعك
              </Button>

              {/* Secondary Button */}

              <Button
                href="#projects"
                variant="outlined"
                sx={{
                  minHeight: 50,

                  px: 3,

                  borderRadius: "10px",

                  borderColor:
                    "divider",

                  color:
                    "text.primary",

                  fontSize: 15,

                  fontWeight: 500,

                  transition:
                    "all 200ms ease",

                  "&:hover": {
                    borderColor:
                      "primary.main",

                    color:
                      "primary.main",

                    backgroundColor:
                      "transparent",
                  },
                }}
              >
                شاهد أعمالنا
              </Button>
            </Box>
          </Box>

          {/* ==========================================
              HERO VISUAL
          =========================================== */}

          <Box
            sx={{
              position: "relative",

              minHeight: {
                xs: 260,
                sm: 320,
                md: 500,
              },

              display: "flex",

              alignItems: "center",

              justifyContent:
                "center",

              order: {
                xs: -1,
                md: 0,
              },
            }}
          >
            {/* Visual Glow */}

            <Box
              sx={{
                position: "absolute",

                width: {
                  xs: 230,
                  md: 440,
                },

                height: {
                  xs: 230,
                  md: 440,
                },

                borderRadius: "50%",

                background: isDark
                  ? "radial-gradient(circle, rgba(0,208,132,0.16) 0%, transparent 68%)"
                  : "radial-gradient(circle, rgba(0,168,107,0.11) 0%, transparent 68%)",

                filter: "blur(8px)",
              }}
            />

            {/* Braces */}

            <Box
              sx={{
                position: "relative",

                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                fontFamily:
                  "Inter, sans-serif",

                fontSize: {
                  xs: "150px",
                  sm: "190px",
                  md: "250px",
                  lg: "280px",
                },

                fontWeight: 400,

                lineHeight: 0.8,

                letterSpacing:
                  "-0.04em",

                direction: "ltr",

                userSelect: "none",

                filter: isDark
                  ? "drop-shadow(0 0 30px rgba(0,208,132,0.12))"
                  : "drop-shadow(0 0 24px rgba(0,168,107,0.08))",
              }}
            >
              {/* Left Brace */}

              <Box
                component="span"
                sx={{
                  color:
                    "primary.main",

                  transform:
                    "translateX(0)",
                }}
              >
                {"{"}
              </Box>

              {/* Right Brace */}

              <Box
                component="span"
                sx={{
                  color:
                    "primaryDark",

                  transform:
                    "translateX(0)",
                }}
              >
                {"}"}
              </Box>
            </Box>

            {/* Technical Label */}

            <Box
              sx={{
                position: "absolute",

                bottom: {
                  xs: 0,
                  md: 35,
                },

                right: {
                  xs: "8%",
                  md: "5%",
                },

                px: 1.5,
                py: 0.75,

                border: "1px solid",
                borderColor:
                  "divider",

                borderRadius: "8px",

                backgroundColor:
                  "background.paper",

                color:
                  "text.secondary",

                fontFamily:
                  "Inter, sans-serif",

                fontSize: 11,

                letterSpacing:
                  "0.12em",

                transition:
                  "background-color 250ms ease",
              }}
            >
              IDEA → CODE
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Hero;