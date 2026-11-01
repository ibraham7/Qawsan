import { Box, Container, Typography } from "@mui/material";

import { useI18n } from "../../i18n";
import { fade } from "../../theme/motion";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/qawsa.n",
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
  const { t, to, dir } = useI18n();
  const ltr = dir === "ltr";

  const navigationLinks = [
    { label: t.nav.home, href: to("/#hero") },
    { label: t.nav.projects, href: to("/#projects") },
    { label: t.nav.services, href: to("/#services") },
    { label: t.nav.about, href: to("/#about") },
    { label: t.nav.blog, href: to("/blog") },
  ];

  const serviceLinks = [
    { label: t.footer.identity, href: to("/#services") },
    { label: t.footer.uiux, href: to("/#services") },
    { label: t.footer.development, href: to("/#services") },
    { label: t.footer.products, href: to("/#services") },
  ];

  const rateLink = { label: t.footer.rate, href: to("/review") };

  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "transparent",
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
            {/* the logo and its sentence form one unit: the sentence sits right under the logo, centred on it */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "fit-content",
              }}
            >
              <Box
                component="img"
                src="/logo/logo.png"
                alt={t.nav.logoAlt}
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

              <Typography
                sx={{
                  mt: 0.5,

                  fontSize: {
                    xs: 12,
                    md: 13,
                  },

                  color: "text.secondary",

                  textAlign: "center",

                  whiteSpace: "nowrap",
                }}
              >
                {t.footer.tagline}
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
              {t.footer.links}
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

                    transition: fade(["color", "translate"], 380),

                    textAlign: "center",

                    "&:hover": {
                      color: "primary.main",
                      translate: ltr ? "3px 0" : "-3px 0",
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
              {t.footer.services}
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

                    transition: fade(["color", "translate"], 380),

                    textAlign: "center",

                    "&:hover": {
                      color: "primary.main",
                      translate: ltr ? "3px 0" : "-3px 0",
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
              {t.footer.contact}
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
              {[...socialLinks, rateLink].map((social) => (
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

                    transition: fade(["color", "translate"], 380),

                    textAlign: "center",

                    "&:hover": {
                      color: "primary.main",
                      translate: ltr ? "3px 0" : "-3px 0",
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
              href={to("/start-project")}
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

                transition: fade(["transform", "box-shadow", "filter"], 420),

                "&:hover": {
                  filter: "brightness(1.05)",

                  transform: "translateY(-2px)",

                  boxShadow: "0 14px 32px -16px rgba(0, 208, 132, 0.6)",
                },

                "&:focus": {
                  outline: "none",
                },

                "&:focus-visible": {
                  outline: "none",
                },
              }}
            >
              {t.nav.start}
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
            {t.footer.motto}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;