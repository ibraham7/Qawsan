import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { LOCALES, LOCALE_META, localizePath, useI18n } from "../../i18n";

interface NavbarProps {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

const SECTION_IDS = ["services", "projects", "about"] as const;

/* Styles below are written LTR-style; stylis-plugin-rtl mirrors them on Arabic pages. */

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

/** which home section is in the middle of the screen */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    const hero = document.getElementById("hero");
    const watched = [hero, ...SECTION_IDS.map((id) => document.getElementById(id))];
    watched.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
  return active;
}

function BrandLockup({ onClick }: { onClick?: () => void }) {
  const { t, to, dir } = useI18n();
  return (
    <Box
      component="a"
      href={to("/")}
      aria-label={t.nav.logoAlt}
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        color: "text.primary",
        textDecoration: "none",
        borderRadius: "12px",
        "& .brand-mark": {
          transition: "transform 450ms cubic-bezier(.2,.7,.2,1), filter 450ms ease",
        },
        "&:hover .brand-mark": {
          transform: "rotate(-8deg) scale(1.06)",
          filter: "drop-shadow(0 0 10px rgba(0,208,132,0.55))",
        },
        "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 4 },
        "@media (prefers-reduced-motion: reduce)": {
          "&:hover .brand-mark": { transform: "none" },
        },
      }}
    >
      <Box
        component="img"
        className="brand-mark"
        src="/logo/mark.png"
        alt=""
        width={203}
        height={161}
        sx={{ width: { xs: 34, md: 38 }, height: "auto", display: "block" }}
      />
      <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <Typography
          component="span"
          sx={{
            fontSize: dir === "rtl" ? { xs: 20, md: 22 } : { xs: 18, md: 19 },
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: dir === "rtl" ? 0 : "-0.01em",
          }}
        >
          {dir === "rtl" ? "قوسان" : "Qawsan"}
        </Typography>
        <Typography
          component="span"
          sx={{
            mt: 0.4,
            fontFamily: "Inter, sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.32em",
            color: "text.secondary",
          }}
        >
          {dir === "rtl" ? "QAWSAN" : "STUDIO"}
        </Typography>
      </Box>
    </Box>
  );
}

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, path, t, dir } = useI18n();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);
  // Popover works in physical sides: open toward the page, away from the screen edge
  const side = dir === "rtl" ? "left" : "right";

  return (
    <>
      <Button
        id="lang-button"
        aria-label={`${t.nav.language}: ${LOCALE_META[locale].name}`}
        aria-haspopup="menu"
        aria-controls={open ? "lang-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        onClick={(e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
        startIcon={<LanguageRoundedIcon sx={{ fontSize: "18px !important" }} />}
        endIcon={
          compact ? undefined : (
            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: "18px !important",
                transition: "transform 250ms ease",
                transform: open ? "rotate(180deg)" : "none",
              }}
            />
          )
        }
        sx={{
          minWidth: 0,
          height: 40,
          px: compact ? 1.25 : 1.5,
          borderRadius: "12px",
          color: "text.primary",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.04em",
          border: "1px solid",
          borderColor: "divider",
          "& .MuiButton-startIcon": { mr: compact ? 0.5 : 0.75, ml: 0 },
          "& .MuiButton-endIcon": { ml: 0.25, mr: 0 },
          "&:hover": {
            borderColor: "primary.main",
            color: "primary.main",
            bgcolor: "rgba(0, 208, 132, 0.06)",
          },
        }}
      >
        {LOCALE_META[locale].short}
      </Button>

      <Menu
        id="lang-menu"
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: side }}
        transformOrigin={{ vertical: "top", horizontal: side }}
        slotProps={{
          list: { "aria-labelledby": "lang-button", dense: true },
          paper: {
            sx: {
              mt: 1,
              minWidth: 180,
              borderRadius: "14px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              backgroundImage: "none",
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.45)",
              p: 0.5,
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
              borderRadius: "10px",
              py: 1.1,
              gap: 1.5,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: l === "ar" ? '"IBM Plex Sans Arabic", sans-serif' : "Inter, sans-serif",
              fontWeight: l === locale ? 600 : 400,
              "&.Mui-selected": { bgcolor: "rgba(0, 208, 132, 0.10)" },
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <span>{LOCALE_META[l].name}</span>
            {l === locale ? (
              <CheckRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
            ) : (
              <Box
                component="span"
                sx={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "text.secondary", letterSpacing: "0.08em" }}
              >
                {LOCALE_META[l].short}
              </Box>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function ThemeToggle({ mode, onToggleTheme }: NavbarProps) {
  const { t } = useI18n();
  const isLight = mode === "light";
  return (
    <IconButton
      onClick={onToggleTheme}
      aria-label={isLight ? t.nav.toDark : t.nav.toLight}
      sx={{
        width: 40,
        height: 40,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        color: "primary.main",
        "& svg": { transition: "transform 500ms cubic-bezier(.2,.7,.2,1)" },
        "&:hover": { borderColor: "primary.main", bgcolor: "rgba(0, 208, 132, 0.08)" },
        "&:hover svg": { transform: "rotate(40deg) scale(1.08)" },
      }}
    >
      {isLight ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}
    </IconButton>
  );
}

function Navbar({ mode, onToggleTheme }: NavbarProps) {
  const { t, to, path, dir, locale } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrolled();
  const isHome = path === "/";
  const active = useActiveSection(isHome);
  const isLight = mode === "light";
  const Arrow = dir === "rtl" ? ArrowBackRoundedIcon : ArrowForwardRoundedIcon;

  const links = [
    { id: "services", label: t.nav.services, href: to("/#services") },
    { id: "projects", label: t.nav.projects, href: to("/#projects") },
    { id: "about", label: t.nav.about, href: to("/#about") },
    { id: "blog", label: t.nav.blog, href: to("/blog") },
  ];
  const isActive = (id: string) =>
    id === "blog" ? path.startsWith("/blog") : isHome && active === id;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          bgcolor: "transparent",
          backgroundImage: "none",
          color: "text.primary",
          pt: { xs: 1, md: 1.5 },
          pointerEvents: "none",
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 1.5, sm: 2.5, md: 4 } }}>
          <Box
            sx={{
              pointerEvents: "auto",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              height: { xs: 60, md: 64 },
              pl: { xs: 1.75, md: 2.25 },
              pr: { xs: 1, md: 1.25 },
              borderRadius: { xs: "18px", md: "20px" },
              border: "1px solid",
              borderColor: scrolled
                ? isLight
                  ? "rgba(11,23,19,0.10)"
                  : "rgba(255,255,255,0.08)"
                : isLight
                  ? "rgba(11,23,19,0.06)"
                  : "rgba(255,255,255,0.05)",
              bgcolor: scrolled
                ? isLight
                  ? "rgba(248,250,249,0.86)"
                  : "rgba(14,19,17,0.78)"
                : isLight
                  ? "rgba(248,250,249,0.55)"
                  : "rgba(14,19,17,0.40)",
              backdropFilter: "blur(18px) saturate(140%)",
              WebkitBackdropFilter: "blur(18px) saturate(140%)",
              boxShadow: scrolled
                ? isLight
                  ? "0 18px 40px -24px rgba(11,23,19,0.35)"
                  : "0 18px 50px -24px rgba(0,0,0,0.85)"
                : "none",
              transition:
                "background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease",
              // hairline of brand light along the top edge
              "&::before": {
                content: '""',
                position: "absolute",
                top: -1,
                left: "18%",
                right: "18%",
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(0,208,132,0.55), transparent)",
                opacity: scrolled ? 1 : 0.55,
                transition: "opacity 300ms ease",
              },
            }}
          >
            <BrandLockup />

            {/* desktop links */}
            <Box
              component="nav"
              aria-label={t.nav.mainNav}
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 0.5,
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {links.map((link) => {
                const on = isActive(link.id);
                return (
                  <Box
                    key={link.id}
                    component="a"
                    href={link.href}
                    aria-current={on ? (link.id === "blog" ? "page" : "location") : undefined}
                    sx={{
                      position: "relative",
                      px: 2,
                      py: 1,
                      borderRadius: "11px",
                      fontSize: 15,
                      fontWeight: on ? 600 : 500,
                      color: on ? "primary.main" : "text.secondary",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      transition: "color 220ms ease, background-color 220ms ease",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        left: "50%",
                        bottom: 3,
                        width: 18,
                        height: 2,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        transform: `translateX(-50%) scaleX(${on ? 1 : 0})`,
                        transition: "transform 300ms cubic-bezier(.2,.7,.2,1)",
                      },
                      "&:hover": {
                        color: "text.primary",
                        bgcolor: isLight ? "rgba(11,23,19,0.05)" : "rgba(255,255,255,0.05)",
                      },
                      "&:hover::after": { transform: "translateX(-50%) scaleX(1)" },
                      "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
                    }}
                  >
                    {link.label}
                  </Box>
                );
              })}
            </Box>

            {/* actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
                <LanguageSwitcher />
                <ThemeToggle mode={mode} onToggleTheme={onToggleTheme} />
              </Box>

              <Button
                href={to("/start-project")}
                variant="contained"
                endIcon={<Arrow />}
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  height: 42,
                  px: 2.25,
                  borderRadius: "12px",
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "#04110C",
                  whiteSpace: "nowrap",
                  "& .MuiButton-endIcon": { ml: 0.75, mr: 0 },
                  "& .MuiButton-endIcon svg": { fontSize: 18, transition: "transform 250ms ease" },
                  "&:hover .MuiButton-endIcon svg": { transform: "translateX(3px)" },
                }}
              >
                {t.nav.start}
              </Button>

              <IconButton
                onClick={() => setMobileOpen(true)}
                aria-label={t.nav.openMenu}
                aria-expanded={mobileOpen}
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "divider",
                  color: "text.primary",
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </AppBar>

      {/* mobile sheet */}
      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: {
              height: "100dvh",
              bgcolor: "background.default",
              backgroundImage:
                "radial-gradient(circle at 85% 0%, rgba(0,208,132,0.14), transparent 45%)",
              px: 2.5,
              pt: 2,
              pb: 3,
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
          <BrandLockup onClick={() => setMobileOpen(false)} />
          <IconButton
            onClick={() => setMobileOpen(false)}
            aria-label={t.nav.closeMenu}
            sx={{ width: 42, height: 42, borderRadius: "12px", border: "1px solid", borderColor: "divider" }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box component="nav" aria-label={t.nav.mainNav} sx={{ display: "grid", gap: 0.5 }}>
          {[{ id: "home", label: t.nav.home, href: to("/") }, ...links].map((link, i) => (
            <Box
              key={link.id}
              component="a"
              href={link.href}
              onClick={() => setMobileOpen(false)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1.75,
                px: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                color: isActive(link.id) ? "primary.main" : "text.primary",
                textDecoration: "none",
                fontSize: 26,
                fontWeight: 600,
                opacity: 0,
                animation: mobileOpen
                  ? `navItemIn 500ms cubic-bezier(.2,.7,.2,1) ${80 + i * 55}ms forwards`
                  : "none",
                "@keyframes navItemIn": {
                  from: { opacity: 0, transform: "translateY(14px)" },
                  to: { opacity: 1, transform: "none" },
                },
                "& svg": { color: "text.secondary", transition: "transform 250ms ease, color 250ms ease" },
                "&:hover svg, &:active svg": { color: "primary.main", transform: "translateX(4px)" },
                "@media (prefers-reduced-motion: reduce)": { animation: "none", opacity: 1 },
              }}
            >
              {link.label}
              <Arrow fontSize="small" />
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: "auto", display: "grid", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {LOCALES.map((l) => (
              <Box
                key={l}
                component="a"
                href={localizePath(l, path)}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                sx={{
                  flex: 1,
                  py: 1.25,
                  textAlign: "center",
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: l === locale ? "primary.main" : "divider",
                  color: l === locale ? "primary.main" : "text.secondary",
                  bgcolor: l === locale ? "rgba(0,208,132,0.08)" : "transparent",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {LOCALE_META[l].name}
              </Box>
            ))}
            <ThemeToggle mode={mode} onToggleTheme={onToggleTheme} />
          </Box>

          <Button
            href={to("/start-project")}
            variant="contained"
            size="large"
            endIcon={<Arrow />}
            onClick={() => setMobileOpen(false)}
            sx={{ height: 54, borderRadius: "14px", fontSize: 16, fontWeight: 600, color: "#04110C" }}
          >
            {t.nav.start}
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;
