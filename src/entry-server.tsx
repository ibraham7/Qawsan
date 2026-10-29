/* eslint-disable react-refresh/only-export-components -- build-time entry, not hot-reloaded */
/**
 * Build-time renderer used by scripts/prerender.mjs (never shipped to the browser).
 * Renders a route to HTML and collects the Emotion/MUI CSS it needs.
 */
import { prerender } from "react-dom/static";
import createEmotionServer from "@emotion/server/create-instance";

import Root from "./Root";
import { seedProjects } from "./data/projects";
import type { Project } from "./data/projects";
import { LOCALE_META, splitLocale } from "./i18n/locales";
import { createDirectionCache } from "./theme/rtl";

export { fetchProjects, localize } from "./data/projects";
export { postsByLocale, translationsOf } from "./data/blog";
export { MESSAGES } from "./i18n";
export { LOCALES, LOCALE_META, localizePath } from "./i18n/locales";

export async function render(path: string, projects: Project[]) {
  seedProjects(projects);

  // same cache keys as the browser (muirtl / muiltr) so the inlined CSS matches
  const cache = createDirectionCache(LOCALE_META[splitLocale(path).locale].dir);
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(cache);

  // prerender (unlike renderToString) waits for lazy pages such as StartProject
  const { prelude } = await prerender(<Root path={path} cache={cache} />);
  const html = await new Response(prelude).text();
  const styles = constructStyleTagsFromChunks(extractCriticalToChunks(html));

  return { html, styles };
}
