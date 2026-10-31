import { useEffect, useRef } from "react";

import { Box } from "@mui/material";

/**
 * A soft green light that follows the pointer across the whole page (it is fixed to the
 * viewport, so it carries over every section without a seam). The light eases toward the
 * pointer instead of snapping to it. Position is written as inline custom properties, so it
 * is not mirrored for Arabic. Does nothing on touch screens.
 */
function PointerGlow({ size = 640, strength = 0.12 }: { size?: number; strength?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let frame = 0;

    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.setProperty("--gx", `${x.toFixed(1)}px`);
      el.style.setProperty("--gy", `${y.toFixed(1)}px`);
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const leave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Box
      ref={ref}
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 700ms ease",
        background: `radial-gradient(${size}px circle at var(--gx, 50%) var(--gy, 50%), rgba(0, 208, 132, ${strength}), transparent 62%)`,
      }}
    />
  );
}

export default PointerGlow;
