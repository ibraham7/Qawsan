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

  const handleOpenMenu = () => {
    setMobileOpen(true);
  };

  const handleCloseMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor:
            mode === "dark"
              ? "rgba(11, 15, 14, 0.78)"
              : "rgba(248, 250, 249, 0.88)",

          backdropFilter: "blur(16px)",

          borderBottom: "1px solid",
          borderColor: "divider",

          color: "text.primary",
        }}
      >
        <Container maxWidth="xl">
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
                      mode === "dark"
                        ? "تفعيل الوضع النهاري"
                        : "تفعيل الوضع الليلي"
                    }
                    sx={{
                      width: 40,
                      height: 40,

                      color: "text.primary",

                      border: "1px solid",
                      borderColor: "divider",

                      transition:
                        "color 200ms ease, border-color 200ms ease",

                      "&:hover": {
                        color: "primary.main",
                        borderColor: "primary.main",
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    {mode === "dark" ? (
                      <LightModeRoundedIcon fontSize="small" />
                    ) : (
                      <DarkModeRoundedIcon fontSize="small" />
                    )}
                  </IconButton>

                  {/* CTA */}

                  <Button
                    href="#contact"
                    variant="contained"
                    sx={{
                      minHeight: 40,

                      px: 2.5,

                      borderRadius: "10px",

                      backgroundColor: "primary.main",

                      color:
                        mode === "dark"
                          ? "#0B0F0E"
                          : "#FFFFFF",

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

                        color:
                          "text.secondary",

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
                  {/* Theme */}

                  <IconButton
                    onClick={onToggleTheme}
                    aria-label={
                      mode === "dark"
                        ? "تفعيل الوضع النهاري"
                        : "تفعيل الوضع الليلي"
                    }
                    sx={{
                      width: 40,
                      height: 40,

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
                    {mode === "dark" ? (
                      <LightModeRoundedIcon />
                    ) : (
                      <DarkModeRoundedIcon />
                    )}
                  </IconButton>

                  {/* Menu */}

                  <IconButton
                    onClick={handleOpenMenu}
                    aria-label="فتح القائمة"
                    sx={{
                      width: 40,
                      height: 40,

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
                  onClick={
                    handleCloseMenu
                  }
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
            href="#contact"
            variant="contained"
            onClick={handleCloseMenu}
            sx={{
              mt: 3,

              py: 1.4,

              borderRadius: "10px",

              backgroundColor:
                "primary.main",

              color:
                mode === "dark"
                  ? "#0B0F0E"
                  : "#FFFFFF",

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
    </>
  );
}

export default Navbar;