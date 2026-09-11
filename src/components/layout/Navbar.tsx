import { useState } from "react";

import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  useMediaQuery,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

import ProjectForm from "../common/ProjectForm";

import Logo from "../common/Logo";

interface NavbarProps {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

const navLinks = [
  {
    label: "الخدمات",
    href: "#services",
  },
  {
    label: "أعمالنا",
    href: "#projects",
  },
  {
    label: "من نحن",
    href: "#about",
  },
];

function Navbar({
  mode,
  onToggleTheme,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width:900px)");

  const isLightMode = mode === "light";

  const handleOpenMenu = () => {
    setMobileOpen(true);
  };

  const handleCloseMenu = () => {
    setMobileOpen(false);
  };
  const [projectFormOpen, setProjectFormOpen] =
    useState(false);
  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: isLightMode
            ? "#181C1A"
            : "rgba(11, 15, 14, 0.82)",

          backdropFilter: "blur(16px)",

          borderBottom: "1px solid",

          borderColor: isLightMode
            ? "#2B322F"
            : "divider",

          color: isLightMode
            ? "#F8FAF9"
            : "text.primary",

          transition:
            "background-color 250ms ease, border-color 250ms ease",
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
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 68,
                md: 76,
              },

              position: "relative",

              display: "flex",
              alignItems: "center",

              justifyContent: "space-between",
            }}
          >
            {/* =====================================
                DESKTOP NAVBAR
            ====================================== */}

            {!isMobile && (
              <>
                {/* LEFT SIDE */}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  {/* Theme Toggle */}

                  <IconButton
                    onClick={onToggleTheme}
                    aria-label={
                      isLightMode
                        ? "تفعيل الوضع الليلي"
                        : "تفعيل الوضع النهاري"
                    }
                    sx={{
                      width: 48,
                      height: 48,

                      border: "1px solid",

                      borderColor: isLightMode
                        ? "rgba(0, 168, 107, 0.25)"
                        : "rgba(0, 208, 132, 0.18)",

                      borderRadius: "50%",

                      color: isLightMode
                        ? "#00A86B"
                        : "#00D084",

                      backgroundColor: isLightMode
                        ? "rgba(0, 168, 107, 0.05)"
                        : "rgba(0, 208, 132, 0.04)",

                      transition:
                        "all 250ms ease",

                      "&:hover": {
                        color: isLightMode
                          ? "#FFFFFF"
                          : "#0B0F0E",

                        backgroundColor:
                          isLightMode
                            ? "#0E3D2E"
                            : "#00D084",

                        borderColor:
                          isLightMode
                            ? "#0E3D2E"
                            : "#00D084",

                        transform:
                          "rotate(15deg)",
                      },
                    }}
                  >
                    {isLightMode ? (
                      <DarkModeRoundedIcon
                        sx={{
                          fontSize: 21,
                        }}
                      />
                    ) : (
                      <LightModeRoundedIcon
                        sx={{
                          fontSize: 21,
                        }}
                      />
                    )}
                  </IconButton>

                  {/* CTA */}

                  <Button
                    onClick={() => setProjectFormOpen(true)}
                    variant="contained"
                    sx={{
                      minHeight: 40,
                      px: 2.5,
                      borderRadius: "10px",
                      backgroundColor: "primary.main",
                      color: isLightMode
                        ? "#FFFFFF"
                        : "#0B0F0E",
                      fontSize: "14px",
                      fontWeight: 500,
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

                {/* CENTER NAVIGATION */}

                <Box
                  component="nav"
                  aria-label="التنقل الرئيسي"
                  sx={{
                    position: "absolute",

                    left: "50%",

                    transform:
                      "translateX(-50%)",

                    display: "flex",
                    alignItems: "center",

                    gap: 4,
                  }}
                >
                  {navLinks.map((link) => (
                    <Button
                      key={link.href}
                      href={link.href}
                      sx={{
                        minWidth: "auto",

                        px: 0,

                        color: isLightMode
                          ? "#D6DCDA"
                          : "text.secondary",

                        fontSize: "15px",

                        fontWeight: 500,

                        whiteSpace: "nowrap",

                        transition:
                          "color 200ms ease",

                        "&:hover": {
                          color:
                            "primary.main",

                          backgroundColor:
                            "transparent",
                        },
                      }}
                    >
                      {link.label}
                    </Button>
                  ))}
                </Box>

                {/* RIGHT SIDE — LOGO */}

                <Logo
                  size="medium"
                  showEnglish={false}
                />
              </>
            )}

            {/* =====================================
                MOBILE NAVBAR
            ====================================== */}

            {isMobile && (
              <>
                {/* LEFT SIDE */}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",

                    gap: 0.5,
                  }}
                >
                  {/* Theme Toggle */}

                  <IconButton
                    onClick={onToggleTheme}
                    aria-label={
                      isLightMode
                        ? "تفعيل الوضع الليلي"
                        : "تفعيل الوضع النهاري"
                    }
                    sx={{
                      width: 40,
                      height: 40,

                      border: "1px solid",

                      borderColor: isLightMode
                        ? "rgba(0, 168, 107, 0.25)"
                        : "rgba(0, 208, 132, 0.18)",

                      borderRadius: "50%",

                      color: isLightMode
                        ? "#00A86B"
                        : "#00D084",

                      backgroundColor: isLightMode
                        ? "rgba(0, 168, 107, 0.05)"
                        : "rgba(0, 208, 132, 0.04)",

                      transition:
                        "all 250ms ease",

                      "&:hover": {
                        color: isLightMode
                          ? "#FFFFFF"
                          : "#0B0F0E",

                        backgroundColor:
                          isLightMode
                            ? "#0E3D2E"
                            : "#00D084",

                        borderColor:
                          isLightMode
                            ? "#0E3D2E"
                            : "#00D084",

                        transform:
                          "rotate(15deg)",
                      },
                    }}
                  >
                    {isLightMode ? (
                      <DarkModeRoundedIcon
                        sx={{
                          fontSize: 19,
                        }}
                      />
                    ) : (
                      <LightModeRoundedIcon
                        sx={{
                          fontSize: 19,
                        }}
                      />
                    )}
                  </IconButton>

                  {/* Menu */}

                  <IconButton
                    onClick={handleOpenMenu}
                    aria-label="فتح القائمة"
                    sx={{
                      width: 40,
                      height: 40,

                      color: isLightMode
                        ? "#F8FAF9"
                        : "text.primary",

                      "&:hover": {
                        color:
                          "primary.main",

                        backgroundColor:
                          "transparent",
                      },
                    }}
                  >
                    <MenuRoundedIcon />
                  </IconButton>
                </Box>

                {/* RIGHT SIDE — LOGO */}

                <Logo
                  size="medium"
                  showEnglish={false}
                />
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* ==========================================
            MOBILE DRAWER
      =========================================== */}

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            width: "min(320px, 85vw)",

            backgroundColor:
              "background.default",

            color: "text.primary",

            borderLeft: "1px solid",

            borderColor: "divider",
          },
        }}
      >
        <Box
          sx={{
            p: 3,
          }}
        >
          {/* Drawer Header */}

          <Box
            sx={{
              display: "flex",

              alignItems: "center",

              justifyContent:
                "space-between",

              mb: 4,
            }}
          >
            <Logo
              size="small"
              showEnglish={false}
            />

            <IconButton
              onClick={handleCloseMenu}
              aria-label="إغلاق القائمة"
              sx={{
                color:
                  "text.primary",

                "&:hover": {
                  color:
                    "primary.main",

                  backgroundColor:
                    "transparent",
                },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          {/* Navigation Links */}

          <List disablePadding>
            {navLinks.map((link) => (
              <ListItem
                key={link.href}
                disablePadding
              >
                <ListItemButton
                  component="a"
                  href={link.href}
                  onClick={handleCloseMenu}
                  sx={{
                    minHeight: 52,

                    mb: 1,

                    px: 2,
                    py: 1.5,

                    borderRadius: "10px",

                    color:
                      "text.primary",

                    transition:
                      "color 200ms ease, background-color 200ms ease",

                    "&:hover": {
                      color:
                        "primary.main",

                      backgroundColor:
                        "action.hover",
                    },
                  }}
                >
                  <ListItemText
                    primary={link.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: 500,
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Mobile CTA */}

          <Button
            fullWidth
            onClick={() => {
              handleCloseMenu();
              setProjectFormOpen(true);
            }}
            variant="contained"

            sx={{
              mt: 3,

              py: 1.4,

              borderRadius: "10px",

              backgroundColor:
                "primary.main",

              color: isLightMode
                ? "#FFFFFF"
                : "#0B0F0E",

              fontWeight: 500,

              "&:hover": {
                backgroundColor:
                  "primary.main",
              },
            }}
          >
            ابدأ مشروعك
          </Button>
        </Box>
      </Drawer>
      <ProjectForm
        open={projectFormOpen}
        onClose={() =>
          setProjectFormOpen(false)
        }
      />
    </>
  );
}

export default Navbar;