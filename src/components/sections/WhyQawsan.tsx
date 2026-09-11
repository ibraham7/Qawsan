import { Box, Container, Typography } from "@mui/material";

const reasons = [
  {
    number: "01",
    title: "نبدأ من الفكرة",
    description:
      "لا تحتاج إلى مشروع جاهز أو تصميم مكتمل. نساعدك على تحويل فكرتك إلى اتجاه واضح قابل للتنفيذ.",
  },
  {
    number: "02",
    title: "التصميم والتطوير معًا",
    description:
      "من الهوية البصرية وواجهة المستخدم إلى كتابة الكود، نبني التجربة بشكل متكامل.",
  },
  {
    number: "03",
    title: "اهتمام بالتفاصيل",
    description:
      "نهتم بالتفاصيل البصرية والتجربة والأداء، حتى يكون المنتج النهائي متناسقًا واحترافيًا.",
  },
  {
    number: "04",
    title: "نبني للمستخدم",
    description:
      "كل قرار في التصميم والتطوير هدفه تقديم تجربة واضحة، سهلة، وسريعة للمستخدم.",
  },
];

function WhyQawsan() {
  return (
    <Box
      component="section"
      id="why-qawsan"
      sx={{
        py: {
          xs: 10,
          md: 14,
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
        {/* Section Header */}
        <Box
          sx={{
            maxWidth: 720,
            mb: {
              xs: 6,
              md: 8,
            },
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontFamily: "Inter, sans-serif",
              fontSize: {
                xs: 12,
                md: 13,
              },
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "primary.main",
            }}
          >
            {"{ WHY QAWSAN }"}
          </Typography>

          <Typography
            component="h2"
            sx={{
              fontSize: {
                xs: 32,
                sm: 40,
                md: 52,
              },
              fontWeight: 700,
              lineHeight: 1.15,
              color: "text.primary",
              mb: 2.5,
            }}
          >
            لأن المنتج الجيد يبدأ
            <Box
              component="span"
              sx={{
                display: {
                  xs: "inline",
                  md: "block",
                },
              }}
            >
              من التفاصيل.
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 620,
              fontSize: {
                xs: 16,
                md: 18,
              },
              lineHeight: 1.9,
              fontWeight: 400,
              color: "text.secondary",
            }}
          >
            نربط التفكير الإبداعي بالتقنية لنصنع منتجات رقمية
            واضحة، متناسقة، وقابلة للنمو.
          </Typography>
        </Box>

        {/* Reasons */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {reasons.map((reason) => (
            <Box
              key={reason.number}
              sx={{
                position: "relative",
                py: {
                  xs: 4,
                  md: 5,
                },
                px: {
                  xs: 0,
                  sm: 3,
                  md: 4,
                },

                borderBottom: "1px solid",
                borderColor: "divider",

                "&:nth-of-type(odd)": {
                  borderLeft: {
                    xs: "none",
                    sm: "1px solid",
                  },
                  borderColor: "divider",
                },

                transition:
                  "background-color 250ms ease",

                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Typography
                sx={{
                  mb: 3,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                {reason.number}
              </Typography>

              <Typography
                component="h3"
                sx={{
                  mb: 1.5,
                  fontSize: {
                    xs: 20,
                    md: 23,
                  },
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {reason.title}
              </Typography>

              <Typography
                sx={{
                  maxWidth: 480,
                  fontSize: {
                    xs: 15,
                    md: 16,
                  },
                  lineHeight: 1.9,
                  color: "text.secondary",
                }}
              >
                {reason.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default WhyQawsan;