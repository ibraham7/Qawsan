import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import { Box } from "@mui/material";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
}

function ScrollReveal({
    children,
    delay = 0,
    direction = "up",
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

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

    const transforms = {
        up: "translateY(50px)",
        down: "translateY(-50px)",
        left: "translateX(50px)",
        right: "translateX(-50px)",
    };

    return (
        <Box
            ref={ref}
            sx={{
                opacity: isVisible ? 1 : 0,

                transform: isVisible
                    ? "translate3d(0, 0, 0)"
                    : transforms[direction],

                transition: `
          opacity 800ms cubic-bezier(0.22, 1, 0.36, 1),
          transform 800ms cubic-bezier(0.22, 1, 0.36, 1)
        `,

                transitionDelay: `${delay}ms`,

                willChange: "opacity, transform",
            }}
        >
            {children}
        </Box>
    );
}

export default ScrollReveal;