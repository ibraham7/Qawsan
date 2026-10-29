/**
 * Build-time renderer used by scripts/prerender.mjs (never shipped to the browser).
 * Renders a route to HTML and collects the Emotion/MUI CSS it needs.
 */
import { prerender } from "react-dom/static";
import createCache from "@emotion/cache";
import createEmotionServer from "@emotion/server/create-instance";
import rtlPlugin from "stylis-plugin-rtl";

import Root from "./Root";
import { seedProjects } from "./data/projects";
import type { Project } from "./data/projects";

export { fetchProjects } from "./data/projects";

export async function render(path: string, projects: Project[]) {
  seedProjects(projects);

  const cache = createCache({ key: "muirtl", stylisPlugins: [rtlPlugin] });
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(cache);

  // prerender (unlike renderToString) waits for lazy pages such as StartProject
  const { prelude } = await prerender(<Root path={path} cache={cache} />);
  const html = await new Response(prelude).text();
  const styles = constructStyleTagsFromChunks(extractCriticalToChunks(html));

  return { html, styles };
}
