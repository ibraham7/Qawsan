/**
 * One soft hover language for the whole site.
 *
 * - Slow, gentle ease-out: things drift into place instead of snapping.
 * - Small movement only: lift of 2–4px, no rotation, no scale jumps.
 * - Green is a tint that fades in (borders, glows, a faint wash), never a solid colour flip.
 * - Reduced motion only limits repeating loops (see index.css); transitions always play.
 */
export const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

/** "transform 420ms <ease>, box-shadow 420ms <ease>" */
export const fade = (props: string[], ms = 420) =>
  props.map((p) => `${p} ${ms}ms ${EASE}`).join(", ");

export const GREEN = "0, 208, 132";

/**
 * Card hover: rises 4px, the border takes on a soft green, a wide low-opacity glow appears.
 * Pass the card's own transition properties through `extra` if it animates others.
 */
export const cardHover = {
  transition: fade(["transform", "border-color", "box-shadow", "background-color"], 480),
  "&:hover": {
    transform: "translateY(-4px)",
    borderColor: `rgba(${GREEN}, 0.4)`,
    boxShadow: `0 24px 56px -30px rgba(${GREEN}, 0.35)`,
  },
} as const;

/** Round icon buttons in the header: the ring and a faint wash fade in. */
export const ringHover = (light: boolean) => ({
  transition: fade(["background-color", "border-color", "color", "box-shadow"], 360),
  "&:hover": {
    borderColor: light ? "rgba(255,255,255,0.7)" : `rgba(${GREEN}, 0.55)`,
    backgroundColor: light ? "rgba(255,255,255,0.16)" : `rgba(${GREEN}, 0.1)`,
    boxShadow: light ? "none" : `0 0 0 4px rgba(${GREEN}, 0.06)`,
  },
});
