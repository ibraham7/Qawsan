import ArrowOutward from "@mui/icons-material/ArrowOutward";

import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

import { useI18n } from "../../i18n";


function CTA() {
  const { t, to } = useI18n();

  return (
    <>
      <Box
        component="section"
        id="contact"
        sx={{
          py: {
            xs: 8,
            sm: 10,
            md: 16,
          },

          bgcolor: "background.default",

          overflow: "hidden",
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: 1280,

            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}
        >
          <Box
            sx={{
              position: "relative",

              overflow: "hidden",

              border: "1px solid",

              borderColor: "divider",

              borderRadius: {
                xs: 3,
                sm: 3.5,
                md: 4,
              },

              p: {
                xs: 3.5,
                sm: 5,
                md: 9,
              },

              bgcolor: "background.paper",

              minHeight: {
                xs: 420,
                sm: 440,
                md: 500,
              },

              display: "flex",

              alignItems: "center",

              justifyContent: "center",
            }}
          >
            {/* ==========================================
                DECORATIVE BRACES
            =========================================== */}

            <Box
              sx={{
                position: "absolute",

                top: {
                  xs: 10,
                  sm: 20,
                  md: 30,
                },

                left: {
                  xs: 8,
                  sm: 20,
                  md: 40,
                },

                fontFamily:
                  "Inter, sans-serif",

                fontSize: {
                  xs: 70,
                  sm: 100,
                  md: 150,
                },

                fontWeight: 400,

                lineHeight: 1,

                color: "primary.main",

                opacity: 0.08,

                userSelect: "none",

                pointerEvents: "none",
              }}
            >
              {"{"}
            </Box>

            <Box
              sx={{
                position: "absolute",

                right: {
                  xs: 8,
                  sm: 20,
                  md: 40,
                },

                bottom: {
                  xs: -5,
                  sm: -10,
                  md: -25,
                },

                fontFamily:
                  "Inter, sans-serif",

                fontSize: {
                  xs: 70,
                  sm: 100,
                  md: 150,
                },

                fontWeight: 400,

                lineHeight: 1,

                color: "primaryDark",

                opacity: 0.08,

                userSelect: "none",

                pointerEvents: "none",
              }}
            >
              {"}"}
            </Box>

            {/* ==========================================
                CONTENT
            =========================================== */}

            <Box
              sx={{
                position: "relative",

                zIndex: 1,

                width: "100%",

                maxWidth: 800,

                mx: "auto",

                textAlign: "center",

                display: "flex",

                flexDirection: "column",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              {/* Label */}

              <Typography
                sx={{
                  mb: {
                    xs: 2,
                    md: 2.5,
                  },

                  fontFamily:
                    "Inter, sans-serif",

                  fontSize: {
                    xs: 11,
                    sm: 12,
                    md: 13,
                  },

                  fontWeight: 600,

                  letterSpacing: "0.12em",

                  color: "primary.main",

                  direction: "ltr",

                  textAlign: "center",
                }}
              >
                {"{ LET'S BUILD }"}
              </Typography>

              {/* Heading */}

              <Typography
                component="h2"
                sx={{
                  width: "100%",

                  m: 0,

                  fontSize: {
                    xs: 30,
                    sm: 42,
                    md: 60,
                  },

                  fontWeight: 700,

                  lineHeight: {
                    xs: 1.3,
                    sm: 1.2,
                    md: 1.15,
                  },

                  color: "text.primary",

                  mb: {
                    xs: 2.5,
                    sm: 3,
                    md: 3,
                  },

                  direction: "rtl",

                  unicodeBidi:
                    "plaintext",

                  textAlign: "center",
                }}
              >
                {t.cta.title1}

                <Box
                  component="span"
                  sx={{
                    display: "block",

                    width: "100%",

                    color: "primary.main",

                    direction: "rtl",

                    unicodeBidi:
                      "plaintext",

                    textAlign: "center",
                  }}
                >
                  {t.cta.title2}
                </Box>
              </Typography>

              {/* Description */}

              <Typography
                sx={{
                  width: "100%",

                  maxWidth: {
                    xs: 320,
                    sm: 500,
                    md: 650,
                  },

                  mx: "auto",

                  fontSize: {
                    xs: 14,
                    sm: 16,
                    md: 18,
                  },

                  lineHeight: {
                    xs: 1.9,
                    md: 1.9,
                  },

                  color: "text.secondary",

                  mb: {
                    xs: 3,
                    sm: 3.5,
                    md: 4,
                  },

                  direction: "rtl",

                  unicodeBidi:
                    "plaintext",

                  textAlign: "center",
                }}
              >
                {t.cta.lead}
              </Typography>

              {/* Start Project Button */}

              <Button
                component="a"
                href={to("/start-project")}
                variant="contained"
                size="large"
                endIcon={
                  <ArrowOutward />
                }
                sx={{
                  minHeight: {
                    xs: 48,
                    sm: 50,
                    md: 52,
                  },

                  px: {
                    xs: 3,
                    sm: 3.5,
                  },

                  borderRadius: 2,

                  fontSize: {
                    xs: 14,
                    sm: 15,
                    md: 16,
                  },

                  fontWeight: 500,

                  direction: "ltr",

                  backgroundColor:
                    "primary.main",

                  color:
                    "background.default",

                  whiteSpace: "nowrap",

                  "& .MuiButton-endIcon svg": {
                    transition: "transform 300ms cubic-bezier(.2,.7,.2,1)",
                  },

                  "&:hover": {
                    backgroundColor:
                      "primary.main",
                  },

                  "&:hover .MuiButton-endIcon svg": {
                    transform: "rotate(45deg)",
                  },
                }}
              >
                {t.cta.button}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

    </>
  );
}

export default CTA;