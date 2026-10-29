/**
 * Runs after `vite build` + the SSR build of src/entry-server.tsx.
 * Writes real HTML for each public route (so search engines and AI crawlers
 * that don't run JavaScript still see the content), plus sitemap.xml and llms.txt.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SSR = path.join(ROOT, "dist-ssr");
const SITE = "https://qawsan.website";

// production builds of React/MUI (set before the renderer is imported)
process.env.NODE_ENV ??= "production";

const { render, fetchProjects } = await import(
  pathToFileURL(path.join(SSR, "entry-server.js")).href
);

const ROUTES = [
  {
    path: "/",
    file: "index.html",
    priority: "1.0",
  },
  {
    path: "/start-project",
    file: "start-project/index.html",
    priority: "0.8",
    title: "ابدأ مشروعك | قوسان — Qawsan Studio",
    description:
      "أخبرنا عن فكرتك: نوع المشروع، الميزانية، والمدة. فريق قوسان يتواصل معك لتحويل فكرتك إلى موقع أو نظام أو منتج رقمي متكامل.",
  },
];

let projects = [];
try {
  projects = await fetchProjects();
  console.log(`prerender: ${projects.length} projects from Supabase`);
} catch (error) {
  console.warn("prerender: could not fetch projects, using fallback list", error?.message);
}

const absolute = (url) => (url?.startsWith("/") ? SITE + url : url);
// safe inside <script>: no "</script>" or "<!--" can be formed
const inlineJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

function projectsSchema(rows) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "أعمال قوسان",
    itemListElement: rows.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: p.title,
        description: p.description,
        genre: p.category,
        ...(p.link && p.link !== "#" ? { url: p.link } : {}),
        ...(p.images?.[0] ? { image: absolute(p.images[0]) } : {}),
        creator: { "@id": `${SITE}/#organization` },
      },
    })),
  };
}

const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

for (const route of ROUTES) {
  const { html, styles } = await render(route.path, projects);
  const url = SITE + route.path;

  let head = styles;
  if (projects.length) {
    head += `\n<script>window.__QAWSAN_PROJECTS__=${inlineJson(projects)}</script>`;
    if (route.path === "/") {
      head += `\n<script type="application/ld+json">${inlineJson(projectsSchema(projects))}</script>`;
    }
  }

  let page = template
    .replace("<!--prerender-head-->", head)
    .replace("<!--prerender-html-->", html);

  if (route.title) {
    page = page
      .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escapeAttr(route.title)}`)
      .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${escapeAttr(route.title)}`);
  }
  if (route.description) {
    const d = escapeAttr(route.description);
    page = page.replace(
      /(<meta\s+(?:name="description"|property="og:description"|name="twitter:description")\s+content=")[^"]*/g,
      `$1${d}`
    );
  }
  page = page
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`);

  const out = path.join(DIST, route.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page);
  console.log(`prerender: ${route.path} -> dist/${route.file} (${Math.round(page.length / 1024)} KB)`);
}

/* sitemap.xml */
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${r.priority}</priority>
  </url>`
).join("\n")}
</urlset>
`
);

/* llms.txt — a plain summary for AI assistants (https://llmstxt.org) */
const projectLines = projects.length
  ? projects
      .map((p) => `- [${p.title}](${p.link && p.link !== "#" ? p.link : SITE + "/#projects"}): ${p.category} — ${p.description}`)
      .join("\n")
  : "- راجع قسم الأعمال: " + SITE + "/#projects";

fs.writeFileSync(
  path.join(DIST, "llms.txt"),
  `# قوسان — Qawsan Studio

> قوسان استوديو رقمي يجمع بين التصميم والتقنية لبناء تجارب ومنتجات رقمية تبدأ من الفكرة وتنتهي بمنتج حقيقي: الهوية البصرية، تصميم UI/UX، تطوير المواقع والبرمجيات المخصصة، والمنتجات الرقمية.

Qawsan Studio is a digital studio that takes products from idea to launch: brand identity, UI/UX design, custom web and software development, testing and release. Clients don't need a ready design or brand — Qawsan starts from the idea.

## الخدمات

- الهوية البصرية: بناء الهوية والاتجاه البصري للمشروع.
- تصميم UI / UX: تجربة استخدام واضحة وسهلة.
- التطوير: تحويل التصميم إلى موقع أو نظام برمجي فعلي.
- المنتجات الرقمية: بناء منتج متكامل من الفكرة حتى الإطلاق.

## طريقة العمل

1. IDEA — فهم الفكرة وتحديد هدف المشروع.
2. BRAND — بناء الهوية والاتجاه البصري.
3. UI / UX — تصميم تجربة واضحة وسهلة الاستخدام.
4. CODE — تحويل التصميم إلى منتج رقمي فعلي.
5. TEST — اختبار وتحسين التفاصيل.
6. LAUNCH — إطلاق المنتج ليصل إلى مستخدميه.

## أعمال مختارة

${projectLines}

## التواصل

- [ابدأ مشروعك](${SITE}/start-project): نموذج لطلب مشروع جديد.
- البريد: ibrahim.dev.pr@gmail.com
- [Instagram](https://www.instagram.com/qawsa.n)
- [LinkedIn](https://www.linkedin.com/in/ibrahimajanji/)
`
);

fs.rmSync(SSR, { recursive: true, force: true });
console.log("prerender: sitemap.xml, llms.txt written");
