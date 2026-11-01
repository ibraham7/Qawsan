import { useEffect, useRef } from "react";

import { Box, useTheme } from "@mui/material";
import { keyframes } from "@mui/material/styles";

import { seeded } from "../../theme/animations";

/*
 * A quiet space-and-technology backdrop for every page: twinkling stars, a slowly turning
 * galaxy, two wireframe planets, a small constellation drawn like a network, and now and then
 * a shooting star. It is fixed to the viewport behind the content, so it carries through every
 * section without a seam, and the stars drift a little against the scroll for depth.
 *
 * Everything is deterministic (seeded) so the prerendered HTML matches the browser, and only
 * opacity / translate / rotate are animated, so it stays cheap. Colours follow the theme: white
 * stars on dark, deep green on light.
 */

const f = (n: number) => Number(n.toFixed(2));

const twinkle = keyframes`
  0%, 100% { opacity: var(--lo, 0.25); }
  50% { opacity: var(--hi, 1); }
`;
const turn = keyframes`
  from { rotate: 0deg; }
  to { rotate: 360deg; }
`;
const turnBack = keyframes`
  from { rotate: 360deg; }
  to { rotate: 0deg; }
`;
const float = keyframes`
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -16px; }
`;
const shoot = keyframes`
  0% { opacity: 0; translate: 0 0; }
  2% { opacity: 1; }
  9% { opacity: 0; translate: 520px 360px; }
  100% { opacity: 0; translate: 520px 360px; }
`;
const pulse = keyframes`
  0%, 100% { opacity: 0.35; scale: 1; }
  50% { opacity: 0.95; scale: 1.5; }
`;

/* ── data ─────────────────────────────────────────────────────────────────────────────── */

const STARS = Array.from({ length: 120 }, (_, i) => ({
  x: f(seeded(i, 3) * 1000),
  y: f(seeded(i, 5) * 1000),
  r: f(0.5 + seeded(i, 7) ** 2 * 1.3),
  delay: -f(seeded(i, 11) * 9),
  dur: f(3 + seeded(i, 13) * 6),
  lo: f(0.12 + seeded(i, 17) * 0.25),
  group: i % 3,
}));

/** two logarithmic spiral arms of tiny stars */
const ARMS = [0, Math.PI].flatMap((offset, arm) =>
  Array.from({ length: 150 }, (_, i) => {
    const t = i / 149;
    const theta = offset + t * 5.2;
    const radius = 14 + 170 * t ** 1.05;
    const spread = (seeded(i, 19 + arm) - 0.5) * (10 + 26 * t);
    return {
      x: f(200 + Math.cos(theta) * radius + Math.cos(theta + 1.57) * spread),
      y: f(200 + Math.sin(theta) * radius + Math.sin(theta + 1.57) * spread),
      r: f(0.5 + seeded(i, 23 + arm) * 1.4),
      o: f((0.85 - t * 0.55) * (0.5 + seeded(i, 29) * 0.5)),
    };
  })
);

const NODES: [number, number][] = [
  [60, 90],
  [140, 40],
  [230, 110],
  [190, 190],
  [90, 200],
  [300, 60],
];
const LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [2, 5],
];

/* ── pieces ───────────────────────────────────────────────────────────────────────────── */

function Galaxy() {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id="sp-core">
          <stop offset="0%" stopColor="rgb(var(--sp-ink))" stopOpacity="0.85" />
          <stop offset="18%" stopColor="rgb(var(--sp-accent))" stopOpacity="0.45" />
          <stop offset="60%" stopColor="rgb(var(--sp-accent))" stopOpacity="0.08" />
          <stop offset="100%" stopColor="rgb(var(--sp-accent))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#sp-core)" />
      {ARMS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="rgb(var(--sp-ink))" opacity={s.o} />
      ))}
    </svg>
  );
}

function WirePlanet() {
  const lat = [-3, -2, -1, 0, 1, 2, 3].map((k) => {
    const y = k * 28;
    const rx = Math.sqrt(110 * 110 - y * y);
    return { y: f(150 + y), rx: f(rx), ry: f(rx * 0.2) };
  });
  const lon = [0, 30, 60, 90, 120, 150].map((deg) => f(Math.abs(Math.cos((deg * Math.PI) / 180)) * 110));
  const orbit = "M 330 150 a 180 46 0 1 1 -360 0 a 180 46 0 1 1 360 0";
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%" overflow="visible" aria-hidden="true">
      <defs>
        <radialGradient id="sp-sphere" cx="35%" cy="32%" r="75%">
          <stop offset="0%" stopColor="rgb(var(--sp-accent))" stopOpacity="0.22" />
          <stop offset="70%" stopColor="rgb(var(--sp-accent))" stopOpacity="0.04" />
          <stop offset="100%" stopColor="rgb(var(--sp-accent))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="110" fill="url(#sp-sphere)" />
      <g fill="none" stroke="rgb(var(--sp-accent))" strokeWidth="0.7" opacity="0.5">
        <circle cx="150" cy="150" r="110" />
        {lat.map((l) => (
          <ellipse key={l.y} cx="150" cy={l.y} rx={l.rx} ry={l.ry} opacity="0.7" />
        ))}
        {lon.map((rx) => (
          <ellipse key={rx} cx="150" cy="150" rx={rx} ry="110" opacity="0.55" />
        ))}
      </g>
      <g transform="rotate(-22 150 150)">
        <path d={orbit} fill="none" stroke="rgb(var(--sp-accent))" strokeWidth="0.8" strokeDasharray="3 7" opacity="0.55" />
        <circle r="5" fill="rgb(var(--sp-ink))" opacity="0.9">
          <animateMotion dur="38s" repeatCount="indefinite" path={orbit} />
        </circle>
      </g>
    </svg>
  );
}

function RingedPlanet() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" overflow="visible" aria-hidden="true">
      <defs>
        <radialGradient id="sp-ringed" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="rgb(var(--sp-violet))" stopOpacity="0.5" />
          <stop offset="100%" stopColor="rgb(var(--sp-violet))" stopOpacity="0.05" />
        </radialGradient>
      </defs>
      <g transform="rotate(-24 100 100)">
        <ellipse cx="100" cy="100" rx="92" ry="22" fill="none" stroke="rgb(var(--sp-violet))" strokeWidth="1.2" opacity="0.35" />
        <circle cx="100" cy="100" r="46" fill="url(#sp-ringed)" stroke="rgb(var(--sp-violet))" strokeWidth="0.6" strokeOpacity="0.5" />
        <path d="M 8 100 A 92 22 0 0 0 192 100" fill="none" stroke="rgb(var(--sp-violet))" strokeWidth="1.6" opacity="0.5" />
      </g>
    </svg>
  );
}

function Constellation() {
  return (
    <svg viewBox="0 0 340 240" width="100%" height="100%" overflow="visible" aria-hidden="true">
      <g stroke="rgb(var(--sp-accent))" strokeWidth="0.7" opacity="0.4">
        {LINKS.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      {NODES.map(([x, y], i) => (
        <circle
          key={i}
          className="node"
          cx={x}
          cy={y}
          r="3"
          fill="rgb(var(--sp-accent))"
          style={{ animationDelay: `${-i * 1.3}s`, transformOrigin: `${x}px ${y}px` }}
        />
      ))}
    </svg>
  );
}

/* ── the backdrop ─────────────────────────────────────────────────────────────────────── */

function SpaceBackdrop() {
  const dark = useTheme().palette.mode === "dark";
  const root = useRef<HTMLDivElement | null>(null);

  // stars drift against the scroll: two layers at different speeds
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      el.style.setProperty("--sy", String(Math.round(window.scrollY)));
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

  return (
    <Box
      ref={root}
      aria-hidden="true"
      sx={{
        "--sp-ink": dark ? "255, 255, 255" : "11, 60, 42",
        "--sp-accent": dark ? "0, 208, 132" : "0, 140, 92",
        "--sp-violet": dark ? "140, 150, 255" : "90, 100, 200",
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: dark ? 1 : 0.55,

        // stars (two parallax layers)
        "& .stars": { position: "absolute", inset: "-4% 0", width: "100%", height: "108%" },
        "& .stars-far": { translate: "0 calc(var(--sy, 0) * -0.012px)" },
        "& .stars-near": { translate: "0 calc(var(--sy, 0) * -0.035px)" },
        "& .star": {
          fill: "rgb(var(--sp-ink))",
          animation: `${twinkle} var(--d, 5s) ease-in-out infinite`,
          "--hi": dark ? "0.95" : "0.7",
        },
        "& .node": { animation: `${pulse} 5s ease-in-out infinite` },
      }}
    >
      {/* soft nebula washes */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: dark
            ? "radial-gradient(60% 45% at 85% 12%, rgba(120,110,255,0.10), transparent 70%), radial-gradient(55% 45% at 8% 88%, rgba(0,208,132,0.08), transparent 70%)"
            : "radial-gradient(60% 45% at 85% 12%, rgba(120,110,255,0.07), transparent 70%)",
        }}
      />

      {[0, 1].map((layer) => (
        <Box key={layer} className={`stars ${layer ? "stars-near" : "stars-far"}`}>
          <svg viewBox="0 0 1000 1000" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            {STARS.filter((s) => (layer ? s.group === 2 || s.group === 1 : s.group === 0)).map((s, i) => (
              <circle
                key={i}
                className="star"
                cx={s.x}
                cy={s.y}
                r={layer ? s.r * 1.25 : s.r}
                style={{ animationDelay: `${s.delay}s`, ["--d" as string]: `${s.dur}s`, ["--lo" as string]: s.lo }}
              />
            ))}
          </svg>
        </Box>
      ))}

      {/* galaxy, top right, turning once in about six minutes */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 360, md: 580 },
          height: { xs: 360, md: 580 },
          top: { xs: -170, md: -230 },
          insetInlineEnd: { xs: -190, md: -210 },
          rotate: "-24deg",
          scale: "1 0.62",
          opacity: 0.6,
        }}
      >
        <Box sx={{ width: "100%", height: "100%", animation: `${turn} 360s linear infinite` }}>
          <Galaxy />
        </Box>
      </Box>

      {/* wireframe planet with a moon, bottom left */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 240, md: 360 },
          height: { xs: 240, md: 360 },
          bottom: { xs: -90, md: -110 },
          insetInlineStart: { xs: -110, md: -150 },
          opacity: 0.8,
          animation: `${float} 18s ease-in-out infinite`,
        }}
      >
        <WirePlanet />
      </Box>

      {/* small ringed planet, mid right */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 90, md: 140 },
          height: { xs: 90, md: 140 },
          top: { xs: "70%", md: "72%" },
          insetInlineEnd: { xs: -40, md: -60 },
          animation: `${float} 22s ease-in-out -6s infinite`,
        }}
      >
        <RingedPlanet />
      </Box>

      {/* a little network of stars, mid left */}
      <Box
        sx={{
          position: "absolute",
          display: { xs: "none", md: "block" },
          width: 300,
          height: 210,
          top: "26%",
          insetInlineStart: "-3%",
          opacity: 0.5,
        }}
      >
        <Box sx={{ width: "100%", height: "100%", animation: `${turnBack} 900s linear infinite` }}>
          <Constellation />
        </Box>
      </Box>

      {/* shooting stars */}
      {[
        { top: "14%", left: "18%", delay: "2s", dur: "17s" },
        { top: "58%", left: "46%", delay: "9s", dur: "23s" },
      ].map((s, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: 120,
            height: 1.5,
            rotate: "35deg",
            borderRadius: 2,
            background: "linear-gradient(90deg, transparent, rgb(var(--sp-ink)))",
            opacity: 0,
            animation: `${shoot} ${s.dur} ease-out ${s.delay} infinite`,
          }}
          // physical position and origin: inline, so the Arabic mirroring leaves them alone
          style={{ top: s.top, left: s.left, transformOrigin: "left center" }}
        />
      ))}
    </Box>
  );
}

export default SpaceBackdrop;
