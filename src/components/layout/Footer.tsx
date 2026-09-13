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

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
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
        {/* Main Footer */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.5fr 1fr 1fr 1fr",
            },
            gap: {
              xs: 6,
              md: 4,
            },
            py: {
              xs: 8,
              md: 10,
            },
          }}
        >
          {/* Brand */}
          <Box>
            <Box
              component="img"
              src="/logo/logo.png"
              alt="قوسان"
              sx={{
                width: 150,
                height: "auto",
                display: "block",
                objectFit: "contain",
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 4,
                transform: "translateX(-15px)",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "primary.main",
                  textAlign: "left",
                }}
              >
                {"{ }"}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  textAlign: "left",
                  unicodeBidi: "plaintext",
                }}
              >
                من الفكرة إلى المنتج.
              </Typography>
            </Box>
          </Box>

          {/* Navigation */}
          <Box>
            <Typography
              sx={{
                mb: 3,
                fontSize: 14,
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              روابط
            </Typography>

            <Box
              component="nav"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {navigationLinks.map((link) => (
                <Box
                  key={link.label}
                  component="a"
                  href={link.href}
                  sx={{
                    width: "fit-content",
                    fontSize: 14,
                    color: "text.secondary",
                    textDecoration: "none",
                    outline: "none",
                    transition: "color 200ms ease",

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

          {/* Services */}
          <Box>
            <Typography
              sx={{
                mb: 3,
                fontSize: 14,
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              خدماتنا
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {serviceLinks.map((service) => (
                <Box
                  key={service.label}
                  component="a"
                  href={service.href}
                  sx={{
                    width: "fit-content",
                    fontSize: 14,
                    color: "text.secondary",
                    textDecoration: "none",
                    outline: "none",
                    transition: "color 200ms ease",

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

          {/* Contact */}
          <Box>
            <Typography
              sx={{
                mb: 3,
                fontSize: 14,
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              تواصل معنا
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  color: "text.secondary",
                }}
              >
                Instagram
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  color: "text.secondary",
                }}
              >
                LinkedIn
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  color: "text.secondary",
                }}
              >
                Email
              </Typography>
            </Box>

            <Box
              component="a"
              href="#contact"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 3,
                px: 2.5,
                minHeight: 42,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "#06130E",
                fontSize: 14,
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

        {/* Bottom */}
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent: "space-between",
            gap: 2,
            py: 3,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            © {new Date().getFullYear()} QAWSAN. All rights reserved.
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: "text.secondary",
              unicodeBidi: "plaintext",
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