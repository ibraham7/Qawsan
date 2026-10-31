import { useEffect, useRef } from "react";

import { Box } from "@mui/material";

/**
 * A soft green light that follows the pointer inside its parent section.
 * Position is written as inline custom properties, so it is not mirrored for Arabic.
 * Does nothing on touch screens.
 */
function PointerGlow({ size = 560, strength = 0.14 }: { size?: number; strength?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      el.style.setProperty("--gx", `${x}px`);
      el.style.setProperty("--gy", `${y}px`);
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      el.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = () => {
      el.style.opacity = "0";
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
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
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 600ms ease",
        background: `radial-gradient(${size}px circle at var(--gx, 50%) var(--gy, 50%), rgba(0, 208, 132, ${strength}), transparent 62%)`,
      }}
    />
  );
}

export default PointerGlow;
