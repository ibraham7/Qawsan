import { Box, Container, Typography } from "@mui/material";

const navigationLinks = [
  { label: "الرئيسية", href: "#hero" },
  { label: "أعمالنا", href: "#projects" },
  { label: "الخدمات", href: "#services" },
  { label: "من نحن", href: "#about" },
];

const serviceLinks = [
  { label: "الهوية البصرية", href: "#services" },
  { label: "UI / UX", href: "#services" },
  { label: "التطوير", href: "#services" },
  { label: "المنتجات الرقمية", href: "#services" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/qawsa.n?stkn=ZXVsbnZqdzY1NWN6",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ibrahimajanji/",
  },
  {
    label: "Email",
    href: "mailto:ibrahim.dev.pr@gmail.com",
  },
];

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
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
            MAIN FOOTER
        =========================================== */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "1.5fr 1fr 1fr 1fr",
            },

            gap: {
              xs: 5,
              sm: 6,
              md: 4,
            },

            py: {
              xs: 7,
              sm: 8,
              md: 10,
            },
          }}
        >
          {/* ==========================================
              BRAND
          =========================================== */}

          <Box
            sx={{
              display: "flex",

              flexDirection: "column",

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
            <Box
              component="img"
              src="/logo/logo.png"
              alt="قوسان"
              sx={{
                width: {
                  xs: 110,
                  sm: 125,
                  md: 150,
                },

                height: "auto",

                display: "block",

                objectFit: "contain",
              }}
            />

            <Box
              sx={{
                display: "flex",

                alignItems: "center",

                justifyContent: {
                  xs: "center",
                  md: "flex-start",
                },

                gap: {
                  xs: 0.8,
                  md: 1,
                },

                mt: {
                  xs: 2.5,
                  sm: 3,
                  md: 4,
                },

                transform: {
                  xs: "none",
                  md: "translateX(-15px)",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",

                  fontSize: {
                    xs: 11,
                    md: 12,
                  },

                  fontWeight: 600,

                  color: "primary.main",

                  textAlign: "center",
                }}
              >
                {"{ }"}
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: 12,
                    md: 13,
                  },

                  color: "text.secondary",

                  textAlign: {
                    xs: "center",
                    md: "left",
                  },

                  unicodeBidi: "plaintext",
                }}
              >
                من الفكرة إلى المنتج.
              </Typography>
            </Box>
          </Box>

          {/* ==========================================
              NAVIGATION
          =========================================== */}

          <Box
            sx={{
              display: "flex",

              flexDirection: "column",

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
                mb: {
                  xs: 2,
                  md: 3,
                },

                fontSize: {
                  xs: 13,
                  md: 14,
                },

                fontWeight: 600,

                color: "text.primary",

                textAlign: {
                  xs: "center",
                  md: "left",
                },
              }}
            >
              روابط
            </Typography>

            <Box
              component="nav"
              sx={{
                display: "flex",

                flexDirection: "column",

                alignItems: {
                  xs: "center",
                  md: "flex-start",
                },

                gap: {
                  xs: 1.2,
                  md: 1.5,
                },
              }}
            >
              {navigationLinks.map((link) => (
                <Box
                  key={link.label}
                  component="a"
                  href={link.href}
                  sx={{
                    width: "fit-content",

                    fontSize: {
                      xs: 13,
                      md: 14,
                    },

                    color: "text.secondary",

                    textDecoration: "none",

                    outline: "none",

                    transition: "color 200ms ease",

                    textAlign: "center",

                    "&:hover": {
                      color: "primary.main",
                    },

                    "&:focus": {
                      outline: "none",
                    },

                    "&:focus-visible": {
                      outline: "none",
                    },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* ==========================================
              SERVICES
          =========================================== */}

          <Box
            sx={{
              display: "flex",

              flexDirection: "column",

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
                mb: {
                  xs: 2,
                  md: 3,
                },

                fontSize: {
                  xs: 13,
                  md: 14,
                },

                fontWeight: 600,

                color: "text.primary",

                textAlign: {
                  xs: "center",
                  md: "left",
                },
              }}
            >
              خدماتنا
            </Typography>

            <Box
              sx={{
                display: "flex",

                flexDirection: "column",

                alignItems: {
                  xs: "center",
                  md: "flex-start",
                },

                gap: {
                  xs: 1.2,
                  md: 1.5,
                },
              }}
            >
              {serviceLinks.map((service) => (
                <Box
                  key={service.label}
                  component="a"
                  href={service.href}
                  sx={{
                    width: "fit-content",

                    fontSize: {
                      xs: 13,
                      md: 14,
                    },

                    color: "text.secondary",

                    textDecoration: "none",

                    outline: "none",

                    transition: "color 200ms ease",

                    textAlign: "center",

                    "&:hover": {
                      color: "primary.main",
                    },

                    "&:focus": {
                      outline: "none",
                    },

                    "&:focus-visible": {
                      outline: "none",
                    },
                  }}
                >
                  {service.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* ==========================================
              CONTACT
          =========================================== */}

          <Box
            sx={{
              display: "flex",

              flexDirection: "column",

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
                mb: {
                  xs: 2,
                  md: 3,
                },

                fontSize: {
                  xs: 13,
                  md: 14,
                },

                fontWeight: 600,

                color: "text.primary",

                textAlign: {
                  xs: "center",
                  md: "left",
                },
              }}
            >
              تواصل معنا
            </Typography>

            <Box
              sx={{
                display: "flex",

                flexDirection: "column",

                alignItems: {
                  xs: "center",
                  md: "flex-start",
                },

                gap: {
                  xs: 1.2,
                  md: 1.5,
                },
              }}
            >
              {socialLinks.map((social) => (
                <Box
                  key={social.label}
                  component="a"
                  href={social.href}
                  target={
                    social.label === "Email"
                      ? undefined
                      : "_blank"
                  }
                  rel={
                    social.label === "Email"
                      ? undefined
                      : "noopener noreferrer"
                  }
                  sx={{
                    width: "fit-content",

                    fontSize: {
                      xs: 13,
                      md: 14,
                    },

                    color: "text.secondary",

                    textDecoration: "none",

                    outline: "none",

                    transition: "color 200ms ease",

                    textAlign: "center",

                    "&:hover": {
                      color: "primary.main",
                    },

                    "&:focus": {
                      outline: "none",
                    },

                    "&:focus-visible": {
                      outline: "none",
                    },
                  }}
                >
                  {social.label}
                </Box>
              ))}
            </Box>

            <Box
              component="a"
              href="#contact"
              sx={{
                display: "inline-flex",

                alignItems: "center",

                justifyContent: "center",

                mt: {
                  xs: 2.5,
                  md: 3,
                },

                px: {
                  xs: 2.2,
                  md: 2.5,
                },

                minHeight: {
                  xs: 40,
                  md: 42,
                },

                borderRadius: 2,

                bgcolor: "primary.main",

                color: "#06130E",

                fontSize: {
                  xs: 13,
                  md: 14,
                },

                fontWeight: 500,

                textDecoration: "none",

                outline: "none",

                transition:
                  "transform 200ms ease, opacity 200ms ease",

                "&:hover": {
                  opacity: 0.9,

                  transform: "translateY(-2px)",
                },

                "&:focus": {
                  outline: "none",
                },

                "&:focus-visible": {
                  outline: "none",
                },
              }}
            >
              ابدأ مشروعك
            </Box>
          </Box>
        </Box>

        {/* ==========================================
            BOTTOM
        =========================================== */}

        <Box
          sx={{
            display: "flex",

            flexDirection: {
              xs: "column",
              sm: "row",
            },

            alignItems: {
              xs: "center",
              sm: "center",
            },

            justifyContent: "space-between",

            gap: {
              xs: 1.5,
              sm: 2,
            },

            py: {
              xs: 2.5,
              sm: 3,
            },

            borderTop: "1px solid",

            borderColor: "divider",

            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",

              fontSize: {
                xs: 10,
                sm: 11,
                md: 12,
              },

              color: "text.secondary",

              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} QAWSAN.
            All rights reserved.
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: 11,
                sm: 12,
              },

              color: "text.secondary",

              unicodeBidi: "plaintext",

              textAlign: "center",
            }}
          >
            نصنع الأفكار. نبني التجارب.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;