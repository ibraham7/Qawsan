import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

import { Box, Button, Container, Drawer, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import type { Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

import { LOCALES, LOCALE_META, localizePath, useI18n } from "../../i18n";
import { EASE, fade } from "../../theme/motion";

interface NavbarProps {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

const SECTION_IDS = ["services", "projects", "about"] as const;

/*
 * The header is three floating islands: the brand, a navigation dock whose highlight slides
 * to whatever you point at, and the actions. The physical layout is the same in every
 * language (brand on the left, actions on the right), so the layout container is dir="ltr"
 * and each piece of text sets its own direction. Nothing here uses left/right CSS:
 * stylis-plugin-rtl would mirror it; positions that must be physical are inline styles.
 */

const GREEN = "0, 208, 132";

const island = (scrolled: boolean) => ({
  pointerEvents: "auto",
  display: "flex",
  alignItems: "center",
  height: { xs: 52, md: 56 },
  borderRadius: 999,
  border: "1px solid",
  borderColor: (t: Theme) => alpha(t.palette.text.primary, scrolled ? 0.14 : 0.08),
  bgcolor: (t: Theme) => alpha(t.palette.background.default, scrolled ? 0.8 : 0.5),
  backdropFilter: "blur(18px) saturate(150%)",
  WebkitBackdropFilter: "blur(18px) saturate(150%)",
  boxShadow: scrolled ? "0 20px 44px -26px rgba(0,0,0,0.65)" : "none",
  transition: fade(["background-color", "border-color", "box-shadow"], 420),
});

/* ------------------------------------------------------------------ hooks */

function useHeaderState(mobileOpen: boolean) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const bar = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 16);
      if (y < 120) setHidden(false);
      else if (y > last + 6) setHidden(true);
      else if (y < last - 6) setHidden(false);
      last = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { scrolled, hidden: hidden && !mobileOpen, bar };
}

/** which home section is in the middle of the screen */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id === "hero" ? null : entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ["hero", ...SECTION_IDS].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [enabled]);
  return active;
}

/* ------------------------------------------------------------------ pieces */

function Brand({ onClick }: { onClick?: () => void }) {
  const { t, to, dir } = useI18n();
  return (
    <Box
      component="a"
      href={to("/")}
      aria-label={t.nav.logoAlt}
      onClick={onClick}
      dir={dir}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        color: "text.primary",
        textDecoration: "none",
        "& .brand-mark": { transition: fade(["translate", "scale", "filter"], 600) },
        "&:hover .brand-mark": {
          translate: "0 -2px",
          scale: "1.07",
          filter: `drop-shadow(0 0 10px rgba(${GREEN}, 0.6))`,
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
        sx={{ width: { xs: 32, md: 36 }, height: "auto", display: "block" }}
      />
      <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <Typography
          component="span"
          sx={{
            fontSize: dir === "rtl" ? { xs: 19, md: 21 } : { xs: 17, md: 18 },
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
            mt: 0.35,
            fontFamily: "Inter, sans-serif",
            fontSize: 8.5,
            fontWeight: 600,
            letterSpacing: "0.34em",
            color: "text.secondary",
          }}
        >
          {dir === "rtl" ? "QAWSAN" : "STUDIO"}
        </Typography>
      </Box>
    </Box>
  );
}

interface DockLink {
  id: string;
  label: string;
  href: string;
}

function NavDock({ links, activeId, scrolled }: { links: DockLink[]; activeId: string | null; scrolled: boolean }) {
  const { t, dir, locale } = useI18n();
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  const activeIndex = links.findIndex((l) => l.id === activeId);
  const target = hover ?? (activeIndex >= 0 ? activeIndex : null);

  const measure = useCallback(() => {
    const el = target === null ? null : refs.current[target];
    setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
  }, [target]);

  useLayoutEffect(() => {
    measure();
  }, [measure, locale]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <Box
      component="nav"
      aria-label={t.nav.mainNav}
      dir={dir}
      onPointerLeave={() => setHover(null)}
      sx={{
        ...island(scrolled),
        position: "relative",
        display: { xs: "none", md: "flex" },
        p: 0.5,
        gap: 0.25,
      }}
    >
      {/* sliding highlight (inline left/width: physical, not mirrored) */}
      <Box
        aria-hidden="true"
        style={{
          left: 0,
          width: pill?.w ?? 0,
          transform: `translateX(${pill?.x ?? 0}px)`,
          opacity: pill ? 1 : 0,
        }}
        sx={{
          position: "absolute",
          top: 4,
          bottom: 4,
          borderRadius: 999,
          border: "1px solid",
          borderColor: `rgba(${GREEN}, 0.32)`,
          background: `linear-gradient(180deg, rgba(${GREEN}, 0.18), rgba(${GREEN}, 0.07))`,
          boxShadow: `0 8px 22px -12px rgba(${GREEN}, 0.55)`,
          transition: `transform 520ms ${EASE}, width 520ms ${EASE}, opacity 300ms ease`,
          pointerEvents: "none",
        }}
      />

      {links.map((link, i) => {
        const on = i === activeIndex;
        return (
          <Box
            key={link.id}
            ref={(el: HTMLAnchorElement | null) => {
              refs.current[i] = el;
            }}
            component="a"
            href={link.href}
            dir={dir}
            aria-current={on ? (link.id === "blog" ? "page" : "location") : undefined}
            onPointerEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            sx={{
              position: "relative",
              zIndex: 1,
              px: 2.25,
              py: 1,
              borderRadius: 999,
              fontSize: 14.5,
              fontWeight: on ? 600 : 500,
              whiteSpace: "nowrap",
              textDecoration: "none",
              color: on || hover === i ? "primary.main" : "text.secondary",
              transition: fade(["color"], 380),
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
            }}
          >
            {link.label}
          </Box>
        );
      })}
    </Box>
  );
}

function LanguageMenu({ scrolled }: { scrolled: boolean }) {
  const { locale, path, t, dir } = useI18n();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);
  const side = dir === "rtl" ? "left" : "right";

  return (
    <>
      <Button
        id="lang-pill"
        aria-label={`${t.nav.language}: ${LOCALE_META[locale].name}`}
        aria-haspopup="menu"
        aria-controls={open ? "lang-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        onClick={(e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
        startIcon={<LanguageRoundedIcon sx={{ fontSize: "18px !important" }} />}
        endIcon={
          <KeyboardArrowDownRoundedIcon
            sx={{
              fontSize: "17px !important",
              transition: fade(["rotate"], 380),
              rotate: open ? "180deg" : "0deg",
            }}
          />
        }
        sx={{
          ...island(scrolled),
          px: 1.75,
          minWidth: 0,
          color: "text.primary",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.06em",
          "& .MuiButton-startIcon": { m: 0, mr: 0.75 },
          "& .MuiButton-endIcon": { m: 0, ml: 0.25 },
          "&:hover": { borderColor: `rgba(${GREEN}, 0.5)`, bgcolor: `rgba(${GREEN}, 0.1)` },
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
          list: { "aria-labelledby": "lang-pill", dense: true },
          paper: {
            sx: {
              mt: 1.25,
              minWidth: 190,
              p: 0.5,
              borderRadius: "18px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              backgroundImage: "none",
              boxShadow: "0 28px 64px -24px rgba(0,0,0,0.6)",
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
              borderRadius: "12px",
              py: 1.1,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              fontFamily: l === "ar" ? '"IBM Plex Sans Arabic", sans-serif' : "Inter, sans-serif",
              fontWeight: l === locale ? 600 : 400,
              "&.Mui-selected": { bgcolor: `rgba(${GREEN}, 0.12)` },
            }}
          >
            <span>{LOCALE_META[l].name}</span>
            {l === locale ? (
              <CheckRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
            ) : (
              <Box component="span" sx={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "text.secondary", letterSpacing: "0.08em" }}>
                {LOCALE_META[l].short}
              </Box>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function ThemeSwitch({ mode, onToggleTheme, size = 40 }: NavbarProps & { size?: number }) {
  const { t } = useI18n();
  const light = mode === "light";
  const icon = {
    position: "absolute",
    fontSize: 20,
    transition: `opacity 420ms ease, rotate 600ms ${EASE}, scale 600ms ${EASE}`,
  } as const;
  return (
    <IconButton
      onClick={onToggleTheme}
      aria-label={light ? t.nav.toDark : t.nav.toLight}
      sx={{
        position: "relative",
        width: size,
        height: size,
        color: "primary.main",
        overflow: "hidden",
        "&:hover": { bgcolor: `rgba(${GREEN}, 0.12)` },
      }}
    >
      <LightModeRoundedIcon sx={{ ...icon, opacity: light ? 0 : 1, rotate: light ? "-90deg" : "0deg", scale: light ? "0.4" : "1" }} />
      <DarkModeRoundedIcon sx={{ ...icon, opacity: light ? 1 : 0, rotate: light ? "0deg" : "90deg", scale: light ? "1" : "0.4" }} />
    </IconButton>
  );
}

function StartButton({ onClick, full = false }: { onClick?: () => void; full?: boolean }) {
  const { t, to, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowBackRoundedIcon : ArrowForwardRoundedIcon;
  const nudge = dir === "rtl" ? "-4px 0" : "4px 0";
  return (
    <Button
      href={to("/start-project")}
      onClick={onClick}
      endIcon={<Arrow />}
      sx={{
        // the header ignores the pointer so the page stays clickable around the islands
        pointerEvents: "auto",
        position: "relative",
        overflow: "hidden",
        height: full ? 56 : { xs: 52, md: 56 },
        width: full ? "100%" : "auto",
        px: full ? 3 : 3.25,
        borderRadius: 999,
        color: "#04110C",
        fontSize: 15,
        fontWeight: 700,
        whiteSpace: "nowrap",
        background: "linear-gradient(135deg, #00D084 0%, #1CE9A4 100%)",
        boxShadow: `0 14px 34px -16px rgba(${GREEN}, 0.75), inset 0 1px 0 rgba(255,255,255,0.35)`,
        "& .MuiButton-endIcon": { m: 0, ml: 1 },
        "& .MuiButton-endIcon svg": { fontSize: 19, transition: fade(["translate"], 420) },
        // a band of light crosses the button on hover
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "linear-gradient(110deg, transparent 32%, rgba(255,255,255,0.55) 50%, transparent 68%)",
          translate: "-130% 0",
          transition: `translate 900ms ${EASE}`,
          pointerEvents: "none",
        },
        "&:hover": {
          background: "linear-gradient(135deg, #00D084 0%, #1CE9A4 100%)",
          boxShadow: `0 18px 40px -16px rgba(${GREEN}, 0.9), inset 0 1px 0 rgba(255,255,255,0.4)`,
        },
        "&:hover::after": { translate: "130% 0" },
        "&:hover .MuiButton-endIcon svg": { translate: nudge },
      }}
    >
      {t.nav.start}
    </Button>
  );
}

/* ------------------------------------------------------------------ header */

function Navbar({ mode, onToggleTheme }: NavbarProps) {
  const { t, to, path, dir, locale } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrolled, hidden, bar } = useHeaderState(mobileOpen);
  const isHome = path === "/";
  const active = useActiveSection(isHome);

  const links: DockLink[] = [
    { id: "services", label: t.nav.services, href: to("/#services") },
    { id: "projects", label: t.nav.projects, href: to("/#projects") },
    { id: "about", label: t.nav.about, href: to("/#about") },
    { id: "blog", label: t.nav.blog, href: to("/blog") },
  ];
  const activeId = path.startsWith("/blog") ? "blog" : isHome ? active : null;
  const Arrow = dir === "rtl" ? ArrowBackRoundedIcon : ArrowForwardRoundedIcon;

  return (
    <>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          pt: { xs: 1, md: 1.5 },
          pointerEvents: "none",
          translate: hidden ? "0 -140%" : "0 0",
          transition: `translate 560ms ${EASE}`,
        }}
      >
        {/* reading progress */}
        <Box
          aria-hidden="true"
          ref={bar}
          style={{ transformOrigin: dir === "rtl" ? "100% 50%" : "0% 50%" }}
          sx={{
            position: "absolute",
            top: 0,
            insetInline: 0,
            height: "2px",
            transform: "scaleX(0)",
            background: `linear-gradient(90deg, rgba(${GREEN}, 0), #00D084 40%, #7CF5C8)`,
            opacity: scrolled ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        />

        <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 1.5, sm: 2.5, md: 4 } }}>
          <Box
            dir="ltr"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "auto 1fr auto", md: "1fr auto 1fr" },
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* brand island */}
            <Box sx={{ ...island(scrolled), justifySelf: "start", px: { xs: 2, md: 2.5 } }}>
              <Brand />
            </Box>

            {/* navigation dock (desktop) */}
            <NavDock links={links} activeId={activeId} scrolled={scrolled} />
            <Box sx={{ display: { xs: "block", md: "none" } }} />

            {/* actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifySelf: "end" }}>
              <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1 }}>
                <LanguageMenu scrolled={scrolled} />
                <Box sx={{ ...island(scrolled), px: 0.75 }}>
                  <ThemeSwitch mode={mode} onToggleTheme={onToggleTheme} />
                </Box>
              </Box>

              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <StartButton />
              </Box>

              <IconButton
                onClick={() => setMobileOpen(true)}
                aria-label={t.nav.openMenu}
                aria-expanded={mobileOpen}
                sx={{
                  ...island(scrolled),
                  display: { xs: "inline-flex", md: "none" },
                  width: 52,
                  color: "text.primary",
                  "&:hover": { borderColor: `rgba(${GREEN}, 0.5)`, bgcolor: `rgba(${GREEN}, 0.1)` },
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* full-screen menu (mobile) */}
      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          backdrop: { sx: { backdropFilter: "blur(6px)" } },
          paper: {
            sx: {
              height: "100dvh",
              bgcolor: "background.default",
              backgroundImage: `radial-gradient(circle at 85% 0%, rgba(${GREEN}, 0.16), transparent 46%), radial-gradient(circle at 0% 100%, rgba(${GREEN}, 0.1), transparent 45%)`,
              px: 2.5,
              pt: 2,
              pb: 3,
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <Box dir="ltr" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 5 }}>
          <Brand onClick={() => setMobileOpen(false)} />
          <IconButton
            onClick={() => setMobileOpen(false)}
            aria-label={t.nav.closeMenu}
            sx={{ width: 48, height: 48, border: "1px solid", borderColor: "divider" }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box component="nav" aria-label={t.nav.mainNav} dir={dir} sx={{ display: "grid" }}>
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
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                color: link.id === activeId ? "primary.main" : "text.primary",
                textDecoration: "none",
                fontSize: 28,
                fontWeight: 600,
                opacity: 0,
                translate: "0 18px",
                animation: `menuIn 650ms ${EASE} ${120 + i * 70}ms forwards`,
                "@keyframes menuIn": { to: { opacity: 1, translate: "0 0" } },
                "& svg": { color: "text.secondary", transition: fade(["translate", "color"], 380) },
                "&:hover svg": { color: "primary.main", translate: dir === "rtl" ? "-5px 0" : "5px 0" },
              }}
            >
              {link.label}
              <Arrow fontSize="small" />
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: "auto", display: "grid", gap: 2 }}>
          <Box dir="ltr" sx={{ display: "flex", gap: 1 }}>
            {LOCALES.map((l) => (
              <Box
                key={l}
                component="a"
                href={localizePath(l, path)}
                hrefLang={l}
                lang={l}
                sx={{
                  flex: 1,
                  py: 1.3,
                  textAlign: "center",
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: l === locale ? "primary.main" : "divider",
                  bgcolor: l === locale ? `rgba(${GREEN}, 0.1)` : "transparent",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "text.primary",
                  transition: fade(["border-color", "background-color"], 320),
                  "&:hover": { borderColor: `rgba(${GREEN}, 0.6)`, bgcolor: `rgba(${GREEN}, 0.08)` },
                }}
              >
                {LOCALE_META[l].name}
              </Box>
            ))}
            <Box sx={{ ...island(false), px: 0.75 }}>
              <ThemeSwitch mode={mode} onToggleTheme={onToggleTheme} size={44} />
            </Box>
          </Box>
          <StartButton full onClick={() => setMobileOpen(false)} />
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;
