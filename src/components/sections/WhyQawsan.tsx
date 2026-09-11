import {
  Box,
  Container,
  Typography,
} from "@mui/material";

import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

const reasons = [
  {
    title: "نبدأ من الفكرة",
    description:
      "نحوّل فكرتك إلى اتجاه واضح قابل للتنفيذ.",
    icon: LightbulbOutlinedIcon,
  },
  {
    title: "التصميم والتطوير",
    description:
      "نبني التجربة كاملة من التصميم إلى الكود.",
    icon: DesignServicesOutlinedIcon,
  },
  {
    title: "نهتم بالتفاصيل",
    description:
      "نصنع تجربة متناسقة واحترافية في كل جزء.",
    icon: SearchOutlinedIcon,
  },
  {
    title: "نبني للمستخدم",
    description:
      "نركز على تجربة واضحة، سهلة وسريعة.",
    icon: GroupsOutlinedIcon,
  },
];

function WhyQawsan() {
  return (
    <Box
      component="section"
      id="why-qawsan"
      sx={{
        position: "relative",
        py: {
          xs: 10,
          md: 16,
        },
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* ==========================================
          BACKGROUND GLOW
      =========================================== */}

      <Box
        sx={{
          position: "absolute",
          width: {
            xs: 300,
            md: 500,
          },
          height: {
            xs: 300,
            md: 500,
          },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,208,132,0.06) 0%, transparent 70%)",
          top: "10%",
          left: "-15%",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: {
            xs: 280,
            md: 450,
          },
          height: {
            xs: 280,
            md: 450,
          },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,208,132,0.04) 0%, transparent 70%)",
          bottom: "0%",
          right: "-15%",
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          px: {
            xs: 2.5,
            md: 4,
          },
        }}
      >
        {/* ==========================================
            HEADER
        =========================================== */}

        <Box
          sx={{
            maxWidth: 760,
            mx: "auto",
            mb: {
              xs: 7,
              md: 9,
            },
            textAlign: "center",
          }}
        >
          {/* Label */}

          <Typography
            sx={{
              mb: 2.5,
              fontFamily: "Inter, sans-serif",
              fontSize: {
                xs: 12,
                md: 13,
              },
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "primary.main",
              direction: "ltr",
              textAlign: "center",
            }}
          >
            {"{ WHY QAWSAN }"}
          </Typography>

          {/* Heading */}

          <Typography
            component="h2"
            sx={{
              m: 0,
              fontSize: {
                xs: 34,
                sm: 44,
                md: 54,
              },
              fontWeight: 700,
              lineHeight: 1.2,
              color: "text.primary",
              direction: "rtl",
              unicodeBidi: "plaintext",
              textAlign: "center",
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
                color: "primary.main",
                direction: "rtl",
                unicodeBidi: "plaintext",
              }}
            >
              {" "}من التفاصيل.
            </Box>
          </Typography>

          {/* Short Description */}

          <Typography
            sx={{
              maxWidth: 540,
              mx: "auto",
              mt: 2.5,
              mb: 0,
              fontSize: {
                xs: 15,
                md: 17,
              },
              lineHeight: 1.8,
              color: "text.secondary",
              direction: "rtl",
              unicodeBidi: "plaintext",
              textAlign: "center",
            }}
          >
            نربط التصميم بالتقنية لنصنع منتجات واضحة،
            متناسقة، وقابلة للنمو.
          </Typography>
        </Box>

        {/* ==========================================
            REASONS GRID
        =========================================== */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },
            gap: {
              xs: 2,
              md: 2.5,
            },
          }}
        >
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <Box
                key={reason.title}
                sx={{
                  position: "relative",
                  minHeight: {
                    xs: 220,
                    md: 245,
                  },

                  p: {
                    xs: 3.5,
                    md: 4,
                  },

                  border: "1px solid",
                  borderColor: "divider",

                  borderRadius: {
                    xs: 3,
                    md: 3.5,
                  },

                  bgcolor: "background.paper",

                  display: "flex",
                  alignItems: "flex-start",
                  gap: {
                    xs: 2.5,
                    md: 3,
                  },

                  direction: "ltr",

                  transition:
                    "transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease",

                  "&:hover": {
                    transform: "translateY(-5px)",
                    borderColor:
                      "rgba(0, 208, 132, 0.3)",
                    boxShadow:
                      "0 20px 50px rgba(0, 208, 132, 0.06)",

                    "& .reason-icon": {
                      backgroundColor:
                        "rgba(0, 208, 132, 0.12)",
                      borderColor:
                        "rgba(0, 208, 132, 0.35)",
                    },
                  },
                }}
              >
                {/* Icon */}

                <Box
                  className="reason-icon"
                  sx={{
                    flexShrink: 0,

                    width: {
                      xs: 58,
                      md: 64,
                    },

                    height: {
                      xs: 58,
                      md: 64,
                    },

                    borderRadius: 2.5,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    backgroundColor:
                      "rgba(0, 208, 132, 0.05)",

                    border: "1px solid",
                    borderColor:
                      "rgba(0, 208, 132, 0.18)",

                    color: "primary.main",

                    transition:
                      "all 300ms ease",
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: {
                        xs: 27,
                        md: 30,
                      },
                    }}
                  />
                </Box>

                {/* Content */}

                <Box
                  sx={{
                    pt: 0.5,
                    direction: "rtl",
                    textAlign: "left",
                  }}
                >
                  <Typography
                    component="h3"
                    sx={{
                      m: 0,
                      mb: 1,

                      fontSize: {
                        xs: 19,
                        md: 21,
                      },

                      fontWeight: 600,
                      lineHeight: 1.4,

                      color: "text.primary",

                      direction: "rtl",
                      unicodeBidi: "plaintext",
                      textAlign: "left",
                    }}
                  >
                    {reason.title}
                  </Typography>

                  <Typography
                    sx={{
                      m: 0,

                      fontSize: {
                        xs: 14,
                        md: 15,
                      },

                      lineHeight: 1.8,

                      color: "text.secondary",

                      direction: "rtl",
                      unicodeBidi: "plaintext",
                      textAlign: "left",
                    }}
                  >
                    {reason.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default WhyQawsan;