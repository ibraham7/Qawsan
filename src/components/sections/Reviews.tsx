import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { Box, Container, IconButton, Typography, useTheme } from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarHalfRoundedIcon from "@mui/icons-material/StarHalfRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

import ScrollReveal from "../common/ScrollReveal";
import { averageRating, pickReviews, reviewText } from "../../data/reviews";
import type { Review } from "../../data/reviews";
import { useI18n } from "../../i18n";
import { breathe, drift, shimmerText } from "../../theme/animations";
import { EASE, GREEN, cardHover, fade } from "../../theme/motion";

/*
 * Customer reviews: an overall rating and a row of cards that scrolls the way a phone does.
 * It snaps card by card, can be dragged with the mouse, moved with the arrows or the keyboard,
 * and fades at both edges. Shown only when there are reviews (see src/data/reviews.ts).
 */

const GOLD = "#FFC83D";

/** five stars, with halves; always drawn left-to-right so the row reads the same in every language */
function Stars({ value, size = 20 }: { value: number; size?: number }) {
  const halves = Math.round(value * 2);
  return (
    <Box dir="ltr" role="img" aria-label={`${value.toFixed(1)} / 5`} sx={{ display: "inline-flex", color: GOLD }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const Icon = halves >= (i + 1) * 2 ? StarRoundedIcon : halves === i * 2 + 1 ? StarHalfRoundedIcon : StarBorderRoundedIcon;
        return <Icon key={i} sx={{ fontSize: size, opacity: halves >= i * 2 + 1 ? 1 : 0.4 }} />;
      })}
    </Box>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0])
    .join("");

function ReviewCard({ review }: { review: Review }) {
  const { locale } = useI18n();
  return (
    <Box
      component="article"
      sx={{
        position: "relative",
        flex: "0 0 auto",
        width: { xs: "84%", sm: 360, md: 380 },
        scrollSnapAlign: "start",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        p: { xs: 3, md: 3.5 },
        borderRadius: "26px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        userSelect: "none",
        ...cardHover,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stars value={review.rating} />
        <Box
          aria-hidden="true"
          dir="ltr"
          sx={{ fontFamily: "Georgia, serif", fontSize: 54, lineHeight: 0.6, height: 28, color: "primary.main", opacity: 0.55 }}
        >
          ”
        </Box>
      </Box>

      <Typography sx={{ m: 0, flex: 1, fontSize: { xs: 15.5, md: 16.5 }, lineHeight: 1.95, color: "text.primary" }}>
        {reviewText(review, locale)}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Box
          aria-hidden="true"
          sx={{
            flexShrink: 0,
            width: 46,
            height: 46,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "#04110C",
            fontWeight: 700,
            fontSize: 16,
            background: "linear-gradient(135deg, #00D084, #8CFAD3)",
            boxShadow: `0 10px 24px -10px rgba(${GREEN}, 0.8)`,
          }}
        >
          {initials(review.name)}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ m: 0, fontSize: 15.5, fontWeight: 600, color: "text.primary" }}>{review.name}</Typography>
          <Typography sx={{ m: 0, mt: 0.25, fontSize: 13.5, color: "text.secondary" }}>{review.role}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function Reviews() {
  const { t, dir } = useI18n();
  const isDark = useTheme().palette.mode === "dark";
  const rtl = dir === "rtl";

  // evaluated in the browser only: the prerendered page (and crawlers) never contain sample content
  const [{ list, demo }] = useState(pickReviews);

  const track = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [progress, setProgress] = useState(0);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  // physical scroll position, normalised so 0 is the reading start in both directions
  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setEdges({ start: pos < 8, end: pos > max - 8 });
    setProgress(max > 0 ? pos / max : 0);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, list.length]);

  const step = (forward: boolean) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("article");
    const w = (card?.getBoundingClientRect().width ?? 360) + 20;
    // in RTL, scrollLeft runs negative: "forward" is toward the left
    el.scrollBy({ left: (forward ? 1 : -1) * w * (rtl ? -1 : 1), behavior: "smooth" });
  };

  // mouse drag (touch already scrolls natively)
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !track.current) return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = track.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) {
      d.moved = true;
      el.style.scrollSnapType = "none";
      el.style.cursor = "grabbing";
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const up = () => {
    const el = track.current;
    if (el) {
      el.style.scrollSnapType = "";
      el.style.cursor = "";
    }
    drag.current = null;
  };

  if (!list.length) return null;

  const average = averageRating(list);

  return (
    <Box component="section" id="reviews" sx={{ position: "relative", py: { xs: 8, md: 13 }, bgcolor: "transparent" }}>
      <Box
        aria-hidden="true"
        style={{ top: "10%", left: "-10%" }}
        sx={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${GREEN}, 0.09) 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: `${drift} 56s ease-in-out infinite`,
        }}
      />

      <Container maxWidth={false} sx={{ position: "relative", maxWidth: 1280, px: { xs: 2.5, sm: 3, md: 4 } }}>
        {/* heading + overall rating */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "flex-end" },
            justifyContent: "space-between",
            gap: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
          }}
        >
          <Box>
            <Box sx={{ display: "flex", mb: 2 }}>
              <Typography component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 99, border: "1px solid", borderColor: `rgba(${GREEN}, 0.35)`, bgcolor: `rgba(${GREEN}, 0.08)`, color: "primary.main", fontSize: 13, fontWeight: 600 }}>
                {t.reviews.label}
              </Typography>
            </Box>
            <Typography component="h2" sx={{ m: 0, fontSize: { xs: 34, sm: 44, md: 56 }, lineHeight: 1.2, fontWeight: 700, letterSpacing: "-0.025em", color: "text.primary" }}>
              {t.reviews.title1}
              <Box component="span" sx={{ display: "block", ...(isDark ? shimmerText() : shimmerText("#00A86B", "#00D084")) }}>
                {t.reviews.title2}
              </Box>
            </Typography>
          </Box>

          <Box
            dir="ltr"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              px: 3,
              py: 2,
              borderRadius: "24px",
              border: "1px solid",
              borderColor: `rgba(${GREEN}, 0.3)`,
              bgcolor: "background.paper",
              boxShadow: `0 24px 60px -34px rgba(${GREEN}, 0.6)`,
            }}
          >
            <Typography component="div" sx={{ fontFamily: "Inter, sans-serif", fontSize: { xs: 52, md: 64 }, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: "text.primary" }}>
              {average.toFixed(1)}
            </Typography>
            <Box dir={dir}>
              <Stars value={average} size={22} />
              <Typography sx={{ m: 0, mt: 0.75, fontSize: 13.5, color: "text.secondary" }}>
                {t.reviews.overall} · {t.reviews.based(list.length)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {demo && (
          <Typography
            sx={{ m: 0, mb: 2.5, px: 2, py: 1, borderRadius: 2, border: "1px dashed", borderColor: "warning.main", color: "warning.main", fontSize: 13.5 }}
          >
            {t.reviews.demo}
          </Typography>
        )}

        {/* the scroller */}
        <ScrollReveal variant="up">
          <Box sx={{ position: "relative" }}>
            <Box
              ref={track}
              dir={dir}
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label={t.reviews.label}
              onScroll={update}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerLeave={up}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") step(!rtl);
                if (e.key === "ArrowLeft") step(rtl);
              }}
              sx={{
                display: "flex",
                gap: 2.5,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                overscrollBehaviorX: "contain",
                py: 1.5,
                px: 0.5,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                outline: "none",
                cursor: "grab",
                // a soft fade at the edges that still have more to show
                maskImage: `linear-gradient(90deg, ${edges.start ? "#000" : "transparent"} 0, #000 7%, #000 93%, ${edges.end ? "#000" : "transparent"} 100%)`,
                WebkitMaskImage: `linear-gradient(90deg, ${edges.start ? "#000" : "transparent"} 0, #000 7%, #000 93%, ${edges.end ? "#000" : "transparent"} 100%)`,
              }}
            >
              {list.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </Box>
          </Box>
        </ScrollReveal>

        {/* controls */}
        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
          <Box sx={{ display: "flex", gap: 1 }} dir={dir}>
            {[
              { forward: false, label: t.reviews.prev, Icon: rtl ? ArrowForwardRoundedIcon : ArrowBackRoundedIcon, disabled: edges.start },
              { forward: true, label: t.reviews.next, Icon: rtl ? ArrowBackRoundedIcon : ArrowForwardRoundedIcon, disabled: edges.end },
            ].map(({ forward, label, Icon, disabled }) => (
              <IconButton
                key={label}
                onClick={() => step(forward)}
                aria-label={label}
                disabled={disabled}
                sx={{ width: 50, height: 50, border: "1px solid", borderColor: "divider", color: "text.primary", "&.Mui-disabled": { opacity: 0.35 } }}
              >
                <Icon />
              </IconButton>
            ))}
          </Box>

          {/* progress along the row */}
          <Box sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: "divider", overflow: "hidden" }} dir="ltr">
            <Box
              style={{ width: `${Math.max(12, progress * 100)}%`, marginInlineStart: rtl ? "auto" : 0 }}
              sx={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #00D084, #8CFAD3)", transition: `width 500ms ${EASE}` }}
            />
          </Box>

          <Box aria-hidden="true" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", boxShadow: `0 0 12px rgba(${GREEN}, 0.9)`, animation: `${breathe} 3s ease-in-out infinite`, display: { xs: "none", md: "block" }, transition: fade(["opacity"], 300) }} />
        </Box>
      </Container>
    </Box>
  );
}

export default Reviews;
