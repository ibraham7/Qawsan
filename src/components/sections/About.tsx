import {
  Box,
  Container,
  Typography,
} from "@mui/material";

function About() {
  return (
    <Box
      component="section"
      id="about"
      sx={{
        py: {
          xs: 8,
          sm: 10,
          md: 14,
        },

        bgcolor:
          "background.paper",

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
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "0.8fr 1.2fr",
            },

            gap: {
              xs: 5,
              sm: 6,
              md: 10,
            },

            alignItems: "center",
          }}
        >
          {/* ==========================================
              LABEL + HEADING
          =========================================== */}

          <Box
            sx={{
              textAlign: {
                xs: "center",
                md: "left",
              },

              display: "flex",

              flexDirection:
                "column",

              alignItems: {
                xs: "center",
                md: "flex-start",
              },
            }}
          >
            <Typography
              sx={{
                fontFamily:
                  "Inter, sans-serif",

                fontSize: {
                  xs: 11,
                  sm: 12,
                  md: 13,
                },

                fontWeight: 600,

                letterSpacing:
                  "0.12em",

                color:
                  "primary.main",

                mb: {
                  xs: 2,
                  md: 3,
                },

                textAlign: {
                  xs: "center",
                  md: "left",
                },

                whiteSpace: "nowrap",

                direction: "ltr",
              }}
            >
              {"{ ABOUT QAWSAN }"}
            </Typography>

            <Typography
              component="h2"
              sx={{
                m: 0,

                width: "100%",

                fontSize: {
                  xs: 30,
                  sm: 38,
                  md: 48,
                },

                fontWeight: 700,

                lineHeight: {
                  xs: 1.3,
                  md: 1.2,
                },

                color:
                  "text.primary",

                textAlign: {
                  xs: "center",
                  md: "left",
                },

                maxWidth: {
                  xs: "100%",
                  md: 460,
                },

                direction: "rtl",

                unicodeBidi:
                  "plaintext",
              }}
            >
              نصنع التجارب

              <Box
                component="span"
                sx={{
                  display: "block",

                  color:
                    "primary.main",

                  textAlign: {
                    xs: "center",
                    md: "left",
                  },

                  unicodeBidi:
                    "plaintext",
                }}
              >
                التي تستحقها الأفكار.
              </Box>
            </Typography>
          </Box>

          {/* ==========================================
              CONTENT
          =========================================== */}

          <Box
            sx={{
              minWidth: 0,

              width: "100%",

              textAlign: {
                xs: "center",
                md: "left",
              },
            }}
          >
            {/* Main Paragraph */}

            <Typography
              sx={{
                width: "100%",

                fontSize: {
                  xs: 16,
                  sm: 17,
                  md: 20,
                },

                lineHeight: {
                  xs: 1.85,
                  md: 1.9,
                },

                color:
                  "text.primary",

                mb: {
                  xs: 2.5,
                  md: 3,
                },

                textAlign: {
                  xs: "center",
                  md: "left",
                },

                direction: "rtl",

                unicodeBidi:
                  "plaintext",

                maxWidth: {
                  xs: 500,
                  md: "none",
                },

                mx: {
                  xs: "auto",
                  md: 0,
                },
              }}
            >
              قوسان استوديو رقمي يجمع بين التصميم والتقنية لبناء
              تجارب ومنتجات رقمية تبدأ من الفكرة وتنتهي بمنتج حقيقي.
            </Typography>

            {/* Secondary Paragraph */}

            <Typography
              sx={{
                width: "100%",

                fontSize: {
                  xs: 14,
                  sm: 15,
                  md: 17,
                },

                lineHeight: {
                  xs: 1.9,
                  md: 2,
                },

                color:
                  "text.secondary",

                textAlign: {
                  xs: "center",
                  md: "left",
                },

                direction: "rtl",

                unicodeBidi:
                  "plaintext",

                maxWidth: {
                  xs: 500,
                  md: "none",
                },

                mx: {
                  xs: "auto",
                  md: 0,
                },
              }}
            >
              نؤمن أن التصميم الجيد لا ينفصل عن التقنية، وأن المنتج
              الناجح يحتاج إلى رؤية واضحة في كل مرحلة؛ من الهوية
              البصرية وتجربة المستخدم، إلى التطوير والاختبار والإطلاق.
            </Typography>

            {/* ==========================================
                CAPABILITIES
            =========================================== */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },

                gap: {
                  xs: 3,
                  sm: 2.5,
                  md: 3,
                },

                mt: {
                  xs: 4,
                  sm: 5,
                  md: 6,
                },

                pt: {
                  xs: 3,
                  sm: 3.5,
                  md: 4,
                },

                borderTop:
                  "1px solid",

                borderColor:
                  "divider",

                textAlign: {
                  xs: "center",
                  md: "left",
                },
              }}
            >
              {/* Design */}

              <Box
                sx={{
                  minWidth: 0,

                  display: "flex",

                  flexDirection:
                    "column",

                  alignItems: {
                    xs: "center",
                    md: "flex-start",
                  },

                  textAlign: {
                    xs: "center",
                    md: "left",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily:
                      "Inter, sans-serif",

                    fontSize: {
                      xs: 12,
                      md: 14,
                    },

                    fontWeight: 600,

                    color:
                      "primary.main",

                    mb: 1,

                    textAlign: {
                      xs: "center",
                      md: "left",
                    },
                  }}
                >
                  DESIGN
                </Typography>

                <Typography
                  sx={{
                    fontSize: {
                      xs: 14,
                      md: 15,
                    },

                    color:
                      "text.secondary",

                    textAlign: {
                      xs: "center",
                      md: "left",
                    },

                    direction: "rtl",
                  }}
                >
                  هوية وتجارب بصرية
                </Typography>
              </Box>

              {/* Development */}

              <Box
                sx={{
                  minWidth: 0,

                  display: "flex",

                  flexDirection:
                    "column",

                  alignItems: {
                    xs: "center",
                    md: "flex-start",
                  },

                  textAlign: {
                    xs: "center",
                    md: "left",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily:
                      "Inter, sans-serif",

                    fontSize: {
                      xs: 12,
                      md: 14,
                    },

                    fontWeight: 600,

                    color:
                      "primary.main",

                    mb: 1,

                    textAlign: {
                      xs: "center",
                      md: "left",
                    },
                  }}
                >
                  DEVELOPMENT
                </Typography>

                <Typography
                  sx={{
                    fontSize: {
                      xs: 14,
                      md: 15,
                    },

                    color:
                      "text.secondary",

                    textAlign: {
                      xs: "center",
                      md: "left",
                    },

                    direction: "rtl",
                  }}
                >
                  منتجات رقمية متطورة
                </Typography>
              </Box>

              {/* Experience */}

              <Box
                sx={{
                  minWidth: 0,

                  display: "flex",

                  flexDirection:
                    "column",

                  alignItems: {
                    xs: "center",
                    md: "flex-start",
                  },

                  textAlign: {
                    xs: "center",
                    md: "left",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily:
                      "Inter, sans-serif",

                    fontSize: {
                      xs: 12,
                      md: 14,
                    },

                    fontWeight: 600,

                    color:
                      "primary.main",

                    mb: 1,

                    textAlign: {
                      xs: "center",
                      md: "left",
                    },
                  }}
                >
                  EXPERIENCE
                </Typography>

                <Typography
                  sx={{
                    fontSize: {
                      xs: 14,
                      md: 15,
                    },

                    color:
                      "text.secondary",

                    textAlign: {
                      xs: "center",
                      md: "left",
                    },

                    direction: "rtl",
                  }}
                >
                  تجربة واضحة ومتكاملة
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default About;