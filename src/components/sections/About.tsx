import { Box, Container, Typography } from "@mui/material";

function About() {
  return (
    <Box
      component="section"
      id="about"
      sx={{
        py: {
          xs: 10,
          md: 14,
        },
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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "0.8fr 1.2fr",
            },
            gap: {
              xs: 6,
              md: 10,
            },
            alignItems: "center",
          }}
        >
          {/* Label */}
          <Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.12em",
                color: "primary.main",
                mb: 3,
              }}
            >
              {"{ ABOUT QAWSAN }"}
            </Typography>

            <Typography
              component="h2"
              sx={{
                fontSize: {
                  xs: 32,
                  sm: 40,
                  md: 48,
                },
                fontWeight: 700,
                lineHeight: 1.2,
                color: "text.primary",
              }}
            >
              نصنع التجارب
              <Box
                component="span"
                sx={{
                  display: "block",
                  color: "primary.main",
                }}
              >
                التي تستحقها الأفكار.
              </Box>
            </Typography>
          </Box>

          {/* Content */}
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: 17,
                  md: 20,
                },
                lineHeight: 1.9,
                color: "text.primary",
                mb: 3,
              }}
            >
              قوسان استوديو رقمي يجمع بين التصميم والتقنية لبناء
              تجارب ومنتجات رقمية تبدأ من الفكرة وتنتهي بمنتج حقيقي.
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: 15,
                  md: 17,
                },
                lineHeight: 2,
                color: "text.secondary",
              }}
            >
              نؤمن أن التصميم الجيد لا ينفصل عن التقنية، وأن المنتج
              الناجح يحتاج إلى رؤية واضحة في كل مرحلة؛ من الهوية
              البصرية وتجربة المستخدم، إلى التطوير والاختبار والإطلاق.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 3,
                mt: 6,
                pt: 4,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "primary.main",
                    mb: 1,
                  }}
                >
                  DESIGN
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    color: "text.secondary",
                  }}
                >
                  هوية وتجارب بصرية
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "primary.main",
                    mb: 1,
                  }}
                >
                  DEVELOPMENT
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    color: "text.secondary",
                  }}
                >
                  منتجات رقمية متطورة
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "primary.main",
                    mb: 1,
                  }}
                >
                  EXPERIENCE
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    color: "text.secondary",
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