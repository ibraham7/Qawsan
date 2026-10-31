import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Box } from "@mui/material";

import { EASE } from "../../theme/motion";

type Variant = "up" | "down" | "left" | "right" | "scale" | "blur" | "tilt";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    /** `direction` kept for the existing call sites; `variant` is the richer name */
    direction?: "up" | "down" | "left" | "right";
    variant?: Variant;
}

/*
 * Appears when scrolled into view. Each variant starts from a different pose so the sections
 * don't all enter the same way. Uses `translate` / `scale` / `rotate` / `filter` (not
 * `transform`) so it combines with hover effects and isn't mirrored for Arabic.
 */
const FROM: Record<Variant, Record<string, string>> = {
    up: { translate: "0 50px" },
    down: { translate: "0 -50px" },
    left: { translate: "50px 0" },
    right: { translate: "-50px 0" },
    scale: { translate: "0 36px", scale: "0.94" },
    blur: { translate: "0 28px", filter: "blur(12px)" },
    tilt: { translate: "0 44px", rotate: "1.6deg", scale: "0.97" },
};

function ScrollReveal({
    children,
    delay = 0,
    direction = "up",
    variant,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const kind: Variant = variant ?? direction;

    useEffect(() => {
        const element = ref.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(element);
                }
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -60px 0px",
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <Box
            ref={ref}
            sx={{
                opacity: isVisible ? 1 : 0,
                ...(isVisible
                    ? { translate: "0 0", scale: "1", rotate: "0deg", filter: "blur(0px)" }
                    : { rotate: "0deg", scale: "1", filter: "blur(0px)", ...FROM[kind] }),

                transition: [
                    `opacity 900ms ${EASE}`,
                    `translate 1000ms ${EASE}`,
                    `scale 1000ms ${EASE}`,
                    `rotate 1000ms ${EASE}`,
                    `filter 900ms ${EASE}`,
                ].join(", "),

                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </Box>
    );
}

export default ScrollReveal;
