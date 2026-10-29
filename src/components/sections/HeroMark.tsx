import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { Box } from "@mui/material";

/*
 * The animated { } in the hero.
 *
 * Horizontal motion uses the individual `translate` property and the braces
 * sit in a dir="ltr" box: stylis-plugin-rtl mirrors `transform: translateX()`
 * and `direction` on Arabic pages, but leaves these alone, so the mark looks
 * and moves the same in every language.
 */

const brace = (open: boolean, color: string, delay: number) => ({
  display: "inline-block",
  translate: open ? "-12px 0" : "12px 0",
  color,
  // light sweeps across the glyph
  background: `linear-gradient(105deg, ${color} 0%, ${color} 42%, #ffffff 50%, ${color} 58%, ${color} 100%)`,
  backgroundSize: "300% 100%",
  backgroundPosition: "100% 0",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  transition: "scale 500ms cubic-bezier(.2,.7,.2,1)",
  animation: [
    `${open ? "braceInOpen" : "braceInClose"} 1.15s cubic-bezier(.2,.9,.25,1.12) ${delay}s both`,
    `${open ? "braceBreatheOpen" : "braceBreatheClose"} 6s ease-in-out ${delay + 1.2}s infinite`,
    `braceShine 7s ease-in-out ${delay + 1.6}s infinite`,
  ].join(", "),
  "@keyframes braceInOpen": {
    from: { opacity: 0, translate: "46px 0", scale: "0.82", filter: "blur(8px)" },
    to: { opacity: 1, translate: "-12px 0", scale: "1", filter: "blur(0)" },
  },
  "@keyframes braceInClose": {
    from: { opacity: 0, translate: "-46px 0", scale: "0.82", filter: "blur(8px)" },
    to: { opacity: 1, translate: "12px 0", scale: "1", filter: "blur(0)" },
  },
  "@keyframes braceBreatheOpen": {
    "0%, 100%": { translate: "-12px 0" },
    "50%": { translate: "-21px 0" },
  },
  "@keyframes braceBreatheClose": {
    "0%, 100%": { translate: "12px 0" },
    "50%": { translate: "21px 0" },
  },
  "@keyframes braceShine": {
    "0%, 55%": { backgroundPosition: "100% 0" },
    "85%, 100%": { backgroundPosition: "0% 0" },
  },
  "@media (prefers-reduced-motion: reduce)": { animation: "none", transition: "none" },
});

interface Props {
  isDark: boolean;
  /** ring, axis, dots: drawn behind the braces */
  decorations: ReactNode;
}

function HeroMark({ isDark, decorations }: Props) {
  const stage = useRef<HTMLDivElement | null>(null);
  const mark = useRef<HTMLDivElement | null>(null);

  // gentle parallax toward the pointer; inline styles skip the RTL mirroring
  useEffect(() => {
    const el = stage.current;
    const target = mark.current;
    if (!el || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        target.style.transform = `translate3d(${x * 12}px, ${y * 9}px, 0) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      target.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <Box
      ref={stage}
      sx={{
        position: "relative",
        width: { xs: 260, sm: 340, md: 500 },
        height: { xs: 260, sm: 340, md: 500 },
        maxWidth: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "900px",
        "&:hover .hero-brace": { scale: "1.05" },
        "&:hover .hero-mark": {
          filter: isDark
            ? "drop-shadow(0 0 38px rgba(0,208,132,0.32))"
            : "drop-shadow(0 0 26px rgba(0,168,107,0.22))",
        },
      }}
    >
      {decorations}

      <Box
        ref={mark}
        className="hero-mark"
        dir="ltr"
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: { xs: "120px", sm: "165px", md: "250px", lg: "285px" },
          fontWeight: 400,
          lineHeight: 0.8,
          userSelect: "none",
          transformStyle: "preserve-3d",
          transition: "transform 600ms cubic-bezier(.2,.7,.2,1), filter 500ms ease",
          filter: isDark
            ? "drop-shadow(0 0 24px rgba(0,208,132,0.16))"
            : "drop-shadow(0 0 20px rgba(0,168,107,0.10))",
        }}
      >
        <Box component="span" className="hero-brace" sx={brace(true, isDark ? "#00D084" : "#00A86B", 0.25)}>
          {"{"}
        </Box>
        <Box component="span" sx={{ width: { xs: 22, sm: 32, md: 58 }, flexShrink: 0 }} />
        <Box component="span" className="hero-brace" sx={brace(false, isDark ? "#F8FAF9" : "#3A6B5A", 0.35)}>
          {"}"}
        </Box>
      </Box>
    </Box>
  );
}

export default HeroMark;
