import { useState } from "react";

import {
  ArrowOutward,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

import ProjectForm from "../common/ProjectForm";

function CTA() {
  const [projectFormOpen, setProjectFormOpen] =
    useState(false);

  return (
    <>
      <Box
        component="section"
        id="contact"
        sx={{
          py: {
            xs: 10,
            md: 16,
          },

          bgcolor: "background.default",
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: 1280,

            px: {
              xs: 2.5,
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
                md: 4,
              },

              p: {
                xs: 4,
                sm: 6,
                md: 9,
              },

              bgcolor: "background.paper",
            }}
          >
            {/* ==========================================
                DECORATIVE BRACES
            =========================================== */}

            <Box
              sx={{
                position: "absolute",

                top: {
                  xs: 20,
                  md: 30,
                },

                left: {
                  xs: 20,
                  md: 40,
                },

                fontFamily:
                  "Inter, sans-serif",

                fontSize: {
                  xs: 90,
                  md: 150,
                },

                fontWeight: 400,

                lineHeight: 1,

                color: "primary.main",

                opacity: 0.08,

                userSelect: "none",
              }}
            >
              {"{"}
            </Box>

            <Box
              sx={{
                position: "absolute",

                right: {
                  xs: 20,
                  md: 40,
                },

                bottom: {
                  xs: -10,
                  md: -25,
                },

                fontFamily:
                  "Inter, sans-serif",

                fontSize: {
                  xs: 90,
                  md: 150,
                },

                fontWeight: 400,

                lineHeight: 1,

                color: "primaryDark",

                opacity: 0.08,

                userSelect: "none",
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

                maxWidth: 800,

                mx: "auto",

                textAlign: "center",
              }}
            >
              {/* Label */}

              <Typography
                sx={{
                  mb: 2.5,

                  fontFamily:
                    "Inter, sans-serif",

                  fontSize: 13,

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
                  fontSize: {
                    xs: 34,
                    sm: 44,
                    md: 60,
                  },

                  fontWeight: 700,

                  lineHeight: 1.15,

                  color: "text.primary",

                  mb: 3,

                  direction: "rtl",

                  unicodeBidi:
                    "plaintext",

                  textAlign: "center",
                }}
              >
                لديك فكرة؟

                <Box
                  component="span"
                  sx={{
                    display: "block",

                    color: "primary.main",

                    direction: "rtl",

                    unicodeBidi:
                      "plaintext",

                    textAlign: "center",
                  }}
                >
                  لنحوّلها إلى منتج.
                </Box>
              </Typography>

              {/* Description */}

              <Typography
                sx={{
                  maxWidth: 650,

                  mx: "auto",

                  fontSize: {
                    xs: 16,
                    md: 18,
                  },

                  lineHeight: 1.9,

                  color: "text.secondary",

                  mb: 4,

                  direction: "rtl",

                  unicodeBidi:
                    "plaintext",

                  textAlign: "center",
                }}
              >
                أخبرنا عن فكرتك، وسنساعدك
                على تحويلها إلى تجربة رقمية
                متكاملة تبدأ من التخطيط وتنتهي
                بمنتج جاهز.
              </Typography>

              {/* Start Project Button */}

              <Button
                onClick={() =>
                  setProjectFormOpen(true)
                }
                variant="contained"
                size="large"
                endIcon={
                  <ArrowOutward />
                }
                sx={{
                  minHeight: 52,

                  px: 3.5,

                  borderRadius: 2,

                  fontSize: 16,

                  fontWeight: 500,

                  direction: "ltr",

                  backgroundColor:
                    "primary.main",

                  color:
                    "background.default",

                  transition:
                    "transform 200ms ease, background-color 200ms ease",

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
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ==========================================
          PROJECT FORM
      =========================================== */}

      <ProjectForm
        open={projectFormOpen}
        onClose={() =>
          setProjectFormOpen(false)
        }
      />
    </>
  );
}

export default CTA;