import { useState } from "react";
import type { MouseEvent } from "react";

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
  Menu,
  MenuItem,
  Toolbar,
  useMediaQuery,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { LOCALES, LOCALE_META, localizePath, useI18n } from "../../i18n";


interface NavbarProps {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

/* Language menu: same round-button look as the theme toggle */
function LanguageButton({ size, isLightMode }: { size: number; isLightMode: boolean }) {
  const { locale, path, t, dir } = useI18n();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);
  const side = dir === "rtl" ? "left" : "right";

  return (
    <>
      <IconButton
        id={`lang-button-${size}`}
        aria-label={`${t.nav.language}: ${LOCALE_META[locale].name}`}
        aria-haspopup="menu"
        aria-controls={open ? `lang-menu-${size}` : undefined}
        aria-expanded={open ? "true" : undefined}
        onClick={(e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
        sx={{
          width: size,
          height: size,
          border: "1px solid",
          borderColor: isLightMode ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 208, 132, 0.18)",
          borderRadius: "50%",
          color: isLightMode ? "#FFFFFF" : "#00D084",
          backgroundColor: isLightMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 208, 132, 0.04)",
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          transition: "all 250ms ease",
          "&:hover": {
            color: isLightMode ? "#00B878" : "#0B0F0E",
            backgroundColor: isLightMode ? "#FFFFFF" : "#00D084",
            borderColor: isLightMode ? "#FFFFFF" : "#00D084",
          },
        }}
      >
        {LOCALE_META[locale].short}
      </IconButton>

      <Menu
        id={`lang-menu-${size}`}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: side }}
        transformOrigin={{ vertical: "top", horizontal: side }}
        slotProps={{
          list: { "aria-labelledby": `lang-button-${size}`, dense: true },
          paper: {
            sx: {
              mt: 1,
              minWidth: 170,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              backgroundImage: "none",
            },
          },
        }}
      >
        {LOCALES.map((l) => (
          <MenuItem
            key={l}
            component="a"
            href={localizePath(l, path)}
            hrefLang={l}
            lang={l}
            selected={l === locale}
            onClick={() => setAnchor(null)}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              fontFamily: l === "ar" ? '"IBM Plex Sans Arabic", sans-serif' : "Inter, sans-serif",
            }}
          >
            <span>{LOCALE_META[l].name}</span>
            {l === locale && <CheckRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function Navbar({
  mode,
  onToggleTheme,
}: NavbarProps) {
  const { t, to, dir } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t.nav.services, href: to("/#services") },
    { label: t.nav.projects, href: to("/#projects") },
    { label: t.nav.about, href: to("/#about") },
    { label: t.nav.blog, href: to("/blog") },
  ];

  const isMobile = useMediaQuery("(max-width:900px)");
  const isLightMode = mode === "light";

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
          backgroundColor: isLightMode
            ? "#00B878"
            : "rgba(11, 15, 14, 0.82)",

          backdropFilter: "blur(16px)",

          borderBottom: "1px solid",

          borderColor: isLightMode
            ? "rgba(255, 255, 255, 0.18)"
            : "divider",

          color: isLightMode
            ? "#FFFFFF"
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

              // Arabic reads right-to-left, which puts the first child on the right;
              // flip for English/Turkish so the logo stays on the left everywhere
              flexDirection: dir === "ltr" ? "row-reverse" : "row",
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
                        ? t.nav.toDark
                        : t.nav.toLight
                    }
                    sx={{
                      width: 48,
                      height: 48,

                      border: "1px solid",

                      borderColor: isLightMode
                        ? "rgba(255, 255, 255, 0.25)"
                        : "rgba(0, 208, 132, 0.18)",

                      borderRadius: "50%",

                      color: isLightMode
                        ? "#FFFFFF"
                        : "#00D084",

                      backgroundColor: isLightMode
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 208, 132, 0.04)",

                      transition:
                        "all 250ms ease",

                      "&:hover": {
                        color: isLightMode
                          ? "#00B878"
                          : "#0B0F0E",

                        backgroundColor:
                          isLightMode
                            ? "#FFFFFF"
                            : "#00D084",

                        borderColor:
                          isLightMode
                            ? "#FFFFFF"
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

                  <LanguageButton size={48} isLightMode={isLightMode} />

                  {/* CTA */}

                  <Button
                    component="a"
                    href={to("/start-project")}
                    variant="contained"
                    sx={{
                      minHeight: 40,

                      px: 2.5,

                      borderRadius: "10px",

                      backgroundColor: isLightMode
                        ? "#FFFFFF"
                        : "primary.main",

                      color: isLightMode
                        ? "#00A86B"
                        : "#0B0F0E",

                      fontSize: "14px",

                      fontWeight: 500,

                      transition:
                        "transform 200ms ease, background-color 200ms ease",

                      "&:hover": {
                        backgroundColor:
                          isLightMode
                            ? "#FFFFFF"
                            : "primary.main",

                        transform:
                          "translateY(-2px)",
                      },
                    }}
                  >
                    {t.nav.start}
                  </Button>
                </Box>

                {/* CENTER NAVIGATION */}

                <Box
                  component="nav"
                  aria-label={t.nav.mainNav}
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
                          ? "#FFFFFF"
                          : "text.secondary",

                        fontSize: "15px",

                        fontWeight: 500,

                        whiteSpace: "nowrap",

                        transition:
                          "color 200ms ease",

                        "&:hover": {
                          color: isLightMode
                            ? "#FFFFFF"
                            : "primary.main",

                          backgroundColor:
                            "transparent",

                          opacity: isLightMode
                            ? 0.8
                            : 1,
                        },
                      }}
                    >
                      {link.label}
                    </Button>
                  ))}
                </Box>

                {/* RIGHT SIDE — LOGO */}

                <Box
                  sx={{
                    display: "flex",

                    alignItems: "center",

                    ...(isLightMode && {
                      color: "#FFFFFF",

                      "& *": {
                        color:
                          "#FFFFFF !important",
                      },
                    }),
                  }}
                >
                  <Box
                    component="img"
                    src="/logo/logo.png"
                    alt={t.nav.logoAlt}
                    sx={{
                      width: {
                        xs: 90,
                        md: 80,
                      },
                      height: "auto",
                      display: "block",
                      objectFit: "contain",
                    }}
                  />
                </Box>
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
                  <LanguageButton size={40} isLightMode={isLightMode} />

                  {/* Theme Toggle */}

                  <IconButton
                    onClick={onToggleTheme}
                    aria-label={
                      isLightMode
                        ? t.nav.toDark
                        : t.nav.toLight
                    }
                    sx={{
                      width: 40,
                      height: 40,

                      border: "1px solid",

                      borderColor: isLightMode
                        ? "rgba(255, 255, 255, 0.25)"
                        : "rgba(0, 208, 132, 0.18)",

                      borderRadius: "50%",

                      color: isLightMode
                        ? "#FFFFFF"
                        : "#00D084",

                      backgroundColor: isLightMode
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 208, 132, 0.04)",

                      transition:
                        "all 250ms ease",

                      "&:hover": {
                        color: isLightMode
                          ? "#00B878"
                          : "#0B0F0E",

                        backgroundColor:
                          isLightMode
                            ? "#FFFFFF"
                            : "#00D084",

                        borderColor:
                          isLightMode
                            ? "#FFFFFF"
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
                    aria-label={t.nav.openMenu}
                    sx={{
                      width: 40,
                      height: 40,

                      color: isLightMode
                        ? "#FFFFFF"
                        : "text.primary",

                      "&:hover": {
                        color: isLightMode
                          ? "#FFFFFF"
                          : "primary.main",

                        backgroundColor:
                          "transparent",
                      },
                    }}
                  >
                    <MenuRoundedIcon />
                  </IconButton>
                </Box>

                {/* RIGHT SIDE — LOGO */}

                <Box
                  sx={{
                    display: "flex",

                    alignItems: "center",

                    ...(isLightMode && {
                      color: "#FFFFFF",

                      "& *": {
                        color:
                          "#FFFFFF !important",
                      },
                    }),
                  }}
                >
                  <Box
                    component="img"
                    src="/logo/logo.png"
                    alt={t.nav.logoAlt}
                    sx={{
                      width: {
                        xs: 110,
                        md: 135,
                      },
                      height: "auto",
                      display: "block",
                      objectFit: "contain",
                    }}
                  />
                </Box>
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
        slotProps={{
          paper: {
            sx: {
              width: "min(320px, 85vw)",
              backgroundColor: "background.default",
              color: "text.primary",
              borderLeft: "1px solid",
              borderColor: "divider",
            },
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
              justifyContent: "space-between",
              mb: 4,
            }}
          >



            <IconButton
              onClick={handleCloseMenu}
              aria-label={t.nav.closeMenu}
              sx={{
                color: "text.primary",

                "&:hover": {
                  color: "primary.main",
                  backgroundColor: "transparent",
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
                    color: "text.primary",

                    transition:
                      "color 200ms ease, background-color 200ms ease",

                    "&:hover": {
                      color: "primary.main",
                      backgroundColor: "action.hover",
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
            component="a"
            href={to("/start-project")}
            onClick={handleCloseMenu}
            variant="contained"
            sx={{
              mt: 3,
              py: 1.4,
              borderRadius: "10px",
              backgroundColor: "primary.main",
              color: isLightMode
                ? "#FFFFFF"
                : "#0B0F0E",
              fontWeight: 500,

              "&:hover": {
                backgroundColor: "primary.main",
              },
            }}
          >
            {t.nav.start}
          </Button>
        </Box>
      </Drawer>

    </>
  );
}

export default Navbar;