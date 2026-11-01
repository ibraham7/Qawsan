/**
 * Runs after `vite build` + the SSR build of src/entry-server.tsx.
 * Writes real HTML for every public route in every language (so search engines and AI
 * crawlers that don't run JavaScript still see the content), plus sitemap.xml, llms.txt
 * and one RSS feed per language.
 *
 *   ar (default)  /            /start-project   /blog   /blog/<slug>
 *   en            /en          /en/start-project  /en/blog  /en/blog/<slug>
 *   tr            /tr          ...
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

const { render, fetchProjects, fetchReviews, postsByLocale, translationsOf, localize, MESSAGES, LOCALES, LOCALE_META, localizePath } =
  await import(pathToFileURL(path.join(SSR, "entry-server.js")).href);

const ORG = { "@id": `${SITE}/#organization` };

let projects = [];
try {
  projects = await fetchProjects();
  console.log(`prerender: ${projects.length} projects from Supabase`);
} catch (error) {
  console.warn("prerender: could not fetch projects, using fallback list", error?.message);
}

let reviews = [];
try {
  reviews = await fetchReviews();
  console.log(`prerender: ${reviews.length} approved reviews from Supabase`);
} catch (error) {
  console.warn("prerender: could not fetch reviews (is the qawsan_reviews table created?)", error?.message);
}

const absolute = (url) => (url?.startsWith("/") ? SITE + url : url);
// safe inside <script>: no "</script>" or "<!--" can be formed
const inlineJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const today = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ routes */

const PAGES = [
  { page: "/", kind: "home", priority: "1.0" },
  { page: "/start-project", kind: "start", priority: "0.8" },
  { page: "/blog", kind: "blog", priority: "0.8" },
  // shared by link with customers: prerendered, but kept out of the sitemap and of search results
  { page: "/review", kind: "review", priority: "0.3", noindex: true },
];

const routes = [];
for (const locale of LOCALES) {
  for (const p of PAGES) routes.push({ locale, ...p });
  for (const post of postsByLocale[locale]) {
    routes.push({ locale, kind: "post", page: `/blog/${post.slug}`, priority: "0.7", post });
  }
}

const urlOf = (locale, page) => SITE + localizePath(locale, page);

function alternatesOf(route) {
  const locales = route.kind === "post" ? translationsOf(route.post.slug) : LOCALES;
  return locales.map((l) => ({ locale: l, url: urlOf(l, route.page) }));
}

/* ------------------------------------------------------------------ structured data */

function baseGraph(locale) {
  const t = MESSAGES[locale];
  const services = [
    [t.footer.identity, t.process.steps.brand],
    [t.footer.uiux, t.process.steps.uiux],
    [t.footer.development, t.process.steps.code],
    [t.footer.products, t.process.steps.launch],
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "Qawsan Studio",
        alternateName: ["قوسان", "Qawsan"],
        url: `${SITE}/`,
        logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png`, width: 512, height: 512 },
        image: `${SITE}/og-image.png`,
        slogan: `${t.hero.title1} ${t.hero.title2}`,
        description: t.about.p1,
        email: "ibrahim.dev.pr@gmail.com",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "ibrahim.dev.pr@gmail.com",
          url: urlOf(locale, "/start-project"),
          availableLanguage: ["ar", "en", "tr"],
        },
        knowsAbout: services.map(([name]) => name),
        sameAs: ["https://www.instagram.com/qawsa.n", "https://www.linkedin.com/in/ibrahimajanji/"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t.footer.services,
          itemListElement: services.map(([name, description]) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name, description },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: `${SITE}/`,
        name: t.meta.ogTitle,
        inLanguage: locale,
        publisher: ORG,
      },
    ],
  };
}

function projectsSchema(locale, rows) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: MESSAGES[locale].projects.carousel,
    itemListElement: rows.map((p, i) => {
      const text = localize(p, locale);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: text.title,
          description: text.description,
          genre: text.category,
          inLanguage: locale,
          ...(p.link && p.link !== "#" ? { url: p.link } : {}),
          ...(p.images?.length ? { image: p.images.map(absolute) } : {}),
          creator: ORG,
        },
      };
    }),
  };
}

function pageSchemas(route, locale, t) {
  const out = [];
  if (route.kind === "home" && projects.length) out.push(projectsSchema(locale, projects));
  if (route.kind === "blog") {
    out.push({
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${urlOf(locale, "/blog")}#blog`,
      name: t.meta.postSuffix,
      url: urlOf(locale, "/blog"),
      inLanguage: locale,
      publisher: ORG,
      blogPost: postsByLocale[locale].map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: urlOf(locale, `/blog/${p.slug}`),
        datePublished: p.date,
      })),
    });
  }
  if (route.kind === "post") {
    const p = route.post;
    const url = urlOf(locale, route.page);
    out.push(
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: p.title,
        description: p.description,
        url,
        mainEntityOfPage: url,
        datePublished: p.date,
        dateModified: p.date,
        inLanguage: locale,
        articleSection: p.category,
        keywords: p.tags.join(", "),
        image: `${SITE}/og-image.png`,
        author: { "@type": "Organization", name: "Qawsan Studio", url: `${SITE}/` },
        publisher: ORG,
        isPartOf: { "@id": `${urlOf(locale, "/blog")}#blog` },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.nav.home, item: urlOf(locale, "/") },
          { "@type": "ListItem", position: 2, name: t.nav.blog, item: urlOf(locale, "/blog") },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      }
    );
  }
  return out;
}

/* ------------------------------------------------------------------ pages */

const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

// replace the value of a tag whose opening matches `re` (group 1 = everything before the value)
const setTag = (page, re, value) => page.replace(re, (_m, before) => before + value);

for (const route of routes) {
  const { locale } = route;
  const t = MESSAGES[locale];
  const meta = LOCALE_META[locale];
  const routePath = localizePath(locale, route.page);
  const url = urlOf(locale, route.page);
  const alternates = alternatesOf(route);

  const copy = {
    home: { title: t.meta.title, description: t.meta.description, ogTitle: t.meta.ogTitle, ogDescription: t.meta.ogDescription },
    start: { title: t.meta.startTitle, description: t.meta.startDescription, ogTitle: t.meta.startTitle, ogDescription: t.meta.startDescription },
    review: { title: t.review.metaTitle, description: t.review.metaDescription, ogTitle: t.review.metaTitle, ogDescription: t.review.metaDescription },
    blog: { title: t.meta.blogTitle, description: t.meta.blogDescription, ogTitle: t.meta.blogTitle, ogDescription: t.meta.blogDescription },
    post: route.post && {
      title: `${route.post.title} | ${t.meta.postSuffix}`,
      description: route.post.description,
      ogTitle: route.post.title,
      ogDescription: route.post.description,
    },
  }[route.kind];

  const { html, styles } = await render(routePath, projects, reviews);

  let head = styles;
  if (projects.length) head += `\n<script>window.__QAWSAN_PROJECTS__=${inlineJson(projects)}</script>`;
  if (reviews.length) head += `\n<script>window.__QAWSAN_REVIEWS__=${inlineJson(reviews)}</script>`;
  head += `\n<script type="application/ld+json">${inlineJson(baseGraph(locale))}</script>`;
  for (const schema of pageSchemas(route, locale, t)) {
    head += `\n<script type="application/ld+json">${inlineJson(schema)}</script>`;
  }
  for (const alt of alternates) head += `\n<link rel="alternate" hreflang="${alt.locale}" href="${alt.url}" />`;
  const xDefault = alternates.find((a) => a.locale === "ar") ?? alternates[0];
  head += `\n<link rel="alternate" hreflang="x-default" href="${xDefault.url}" />`;
  if (postsByLocale[locale].length) {
    head += `\n<link rel="alternate" type="application/rss+xml" title="${escapeAttr(t.meta.postSuffix)}" href="${localizePath(locale, "/blog/rss.xml")}" />`;
  }
  head += `\n<meta property="og:locale" content="${meta.og}" />`;
  for (const alt of alternates.filter((a) => a.locale !== locale)) {
    head += `\n<meta property="og:locale:alternate" content="${LOCALE_META[alt.locale].og}" />`;
  }
  if (route.kind === "post") {
    head += `\n<meta property="article:published_time" content="${route.post.date}" />`;
    head += `\n<meta property="article:section" content="${escapeAttr(route.post.category)}" />`;
  }

  let page = template
    .replace("<!--prerender-head-->", () => head)
    .replace("<!--prerender-html-->", () => html)
    .replace('<html lang="ar" dir="rtl">', `<html lang="${locale}" dir="${meta.dir}">`)
    // the template's Arabic defaults (for the dev server) are replaced per language
    .replace(/<link rel="alternate" type="application\/rss\+xml"[^>]*>\s*/, "")
    .replace(/<meta property="og:locale" content="[^"]*"\s*\/>\s*/, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/, "")
    .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeAttr(copy.title)}</title>`);

  page = setTag(page, /(<meta\s+name="description"\s+content=")[^"]*/, escapeAttr(copy.description));
  page = setTag(page, /(<meta property="og:title" content=")[^"]*/, escapeAttr(copy.ogTitle));
  page = setTag(page, /(<meta\s+property="og:description"\s+content=")[^"]*/, escapeAttr(copy.ogDescription));
  page = setTag(page, /(<meta name="twitter:title" content=")[^"]*/, escapeAttr(copy.ogTitle));
  page = setTag(page, /(<meta\s+name="twitter:description"\s+content=")[^"]*/, escapeAttr(copy.ogDescription));
  page = setTag(page, /(<meta property="og:image:alt" content=")[^"]*/, escapeAttr(t.meta.ogImageAlt));
  page = setTag(page, /(<link rel="canonical" href=")[^"]*/, url);
  page = setTag(page, /(<meta property="og:url" content=")[^"]*/, url);
  if (route.noindex) page = page.replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, follow" />');
  if (route.kind === "post") {
    page = page.replace('<meta property="og:type" content="website" />', '<meta property="og:type" content="article" />');
  }

  const out = path.join(DIST, routePath === "/" ? "index.html" : `${routePath.slice(1)}/index.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page);
  console.log(`prerender: ${routePath.padEnd(40)} ${Math.round(page.length / 1024)} KB`);
}

/* ------------------------------------------------------------------ sitemap.xml */

const lastBlogDate = (locale) => postsByLocale[locale][0]?.date;
fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes
  .filter((r) => !r.noindex)
  .map((r) => {
    const lastmod = r.kind === "post" ? r.post.date : r.kind === "blog" ? lastBlogDate(r.locale) ?? today : today;
    const alts = alternatesOf(r);
    const xDefault = alts.find((a) => a.locale === "ar") ?? alts[0];
    return `  <url>
    <loc>${urlOf(r.locale, r.page)}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${r.priority}</priority>
${alts.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.locale}" href="${a.url}" />`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefault.url}" />
  </url>`;
  })
  .join("\n")}
</urlset>
`
);

/* ------------------------------------------------------------------ llms.txt */

const projectLines = (locale) =>
  projects
    .map((p) => {
      const text = localize(p, locale);
      return `- [${text.title}](${p.link && p.link !== "#" ? p.link : SITE + "/#projects"}): ${text.category} — ${text.description}`;
    })
    .join("\n");

const blogLines = (locale) =>
  postsByLocale[locale]
    .map((p) => `- [${p.title}](${urlOf(locale, `/blog/${p.slug}`)}): ${p.description}`)
    .join("\n");

fs.writeFileSync(
  path.join(DIST, "llms.txt"),
  `# Qawsan Studio — قوسان

> Qawsan is a digital studio that brings design and technology together to build digital experiences and products, from the first idea to a real launch: brand identity, UI/UX design, custom websites and software, testing and release. Clients don't need a finished design or brand — Qawsan starts from the idea.

> قوسان استوديو رقمي يجمع بين التصميم والتقنية لبناء تجارب ومنتجات رقمية تبدأ من الفكرة وتنتهي بمنتج حقيقي: الهوية البصرية، تصميم UI/UX، تطوير المواقع والبرمجيات المخصصة، والمنتجات الرقمية.

> Qawsan; fikirden gerçek bir ürüne uzanan dijital deneyimler geliştiren bir dijital stüdyodur: marka kimliği, UI/UX tasarımı, web siteleri ve özel yazılım geliştirme.

The site is available in three languages: Arabic (${SITE}/), English (${SITE}/en) and Turkish (${SITE}/tr).

## Services

- Brand identity: ${MESSAGES.en.process.steps.brand}
- UI / UX design: ${MESSAGES.en.process.steps.uiux}
- Development: ${MESSAGES.en.process.steps.code}
- Digital products: ${MESSAGES.en.process.steps.launch}

## Process

1. IDEA — ${MESSAGES.en.process.steps.idea}
2. BRAND — ${MESSAGES.en.process.steps.brand}
3. UI / UX — ${MESSAGES.en.process.steps.uiux}
4. CODE — ${MESSAGES.en.process.steps.code}
5. TEST — ${MESSAGES.en.process.steps.test}
6. LAUNCH — ${MESSAGES.en.process.steps.launch}

## Selected work

${projectLines("en")}

## Blog (English)

${blogLines("en")}

## المدونة (العربية)

${blogLines("ar")}

## Blog (Türkçe)

${blogLines("tr")}

## Contact

- [Start a project](${SITE}/en/start-project): project request form
- Email: ibrahim.dev.pr@gmail.com
- [Instagram](https://www.instagram.com/qawsa.n)
- [LinkedIn](https://www.linkedin.com/in/ibrahimajanji/)
`
);

/* ------------------------------------------------------------------ RSS (one per language) */

for (const locale of LOCALES) {
  const posts = postsByLocale[locale];
  if (!posts.length) continue;
  const t = MESSAGES[locale];
  const feed = localizePath(locale, "/blog/rss.xml");
  const file = path.join(DIST, feed.slice(1));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(t.meta.postSuffix)}</title>
    <link>${urlOf(locale, "/blog")}</link>
    <atom:link href="${SITE}${feed}" rel="self" type="application/rss+xml" />
    <description>${xml(t.meta.blogDescription)}</description>
    <language>${locale}</language>
${posts
  .map(
    (p) => `    <item>
      <title>${xml(p.title)}</title>
      <link>${urlOf(locale, `/blog/${p.slug}`)}</link>
      <guid>${urlOf(locale, `/blog/${p.slug}`)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <category>${xml(p.category)}</category>
      <description>${xml(p.description)}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`
  );
}

fs.rmSync(SSR, { recursive: true, force: true });
console.log(`prerender: ${routes.length} pages, sitemap.xml, llms.txt and RSS feeds written`);
