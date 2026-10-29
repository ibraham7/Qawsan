---
title: Why Your React Site Isn't Showing Up on Google and AI Search (And How to Fix It)
description: Your React site looks great, but search engines and AI tools can't see its content. Here's why, and how prerendering, Schema, sitemaps, and llms.txt fix it.
date: 2026-10-29
category: For Developers
tags: React SEO, React, SEO, GEO, Prerendering, Vite, llms.txt, Schema, structured data, AI search
---

You've built a site with React and Vite, and it runs beautifully in the browser. Then you open "View Source" and find only this:

```html
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
```

That's what crawlers see first: an empty page. All of the content gets built later, inside the browser, with JavaScript.

## Who Sees the Content and Who Doesn't?

- **Google** does run JavaScript, but in two phases: it crawls the HTML first, then renders the page later once resources are available. That delays indexing, and it can miss content loaded through additional requests.
- **AI crawlers** like GPTBot, ClaudeBot, and PerplexityBot usually read the HTML **without running JavaScript**. To them, your site is just a title and a description.
- **Link previews** on WhatsApp, LinkedIn, and Twitter never run JavaScript. They rely on the `meta` tags in your HTML.

And as more people ask AI tools instead of using traditional search, the term **GEO** (Generative Engine Optimization) has come to mean making your content readable, understandable, and quotable for these tools.

## Fix 1: Prerendering

The idea: at build time, run the app in Node and save the HTML output for every page. Visitors receive a page with the full content, and React takes over interactivity from there.

React 19 includes a `prerender` function that waits for lazy-loaded (`lazy`) components to finish — unlike `renderToString`:

```tsx
import { prerender } from "react-dom/static";

export async function render(path: string) {
  const { prelude } = await prerender(<Root path={path} />);
  return await new Response(prelude).text();
}
```

Then a post-build script injects the output into `index.html`:

```js
const { html } = await render("/");
const page = template.replace("<!--prerender-html-->", html);
fs.writeFileSync("dist/index.html", page);
```

### What About CSS-in-JS?

If you're using MUI or Emotion, styles are generated at runtime. Without them, your prerendered page will show up unstyled. The fix is to extract the critical styles during rendering:

```tsx
import createCache from "@emotion/cache";
import createEmotionServer from "@emotion/server/create-instance";

const cache = createCache({ key: "css" });
const { extractCriticalToChunks, constructStyleTagsFromChunks } =
  createEmotionServer(cache);
// ... render the app inside <CacheProvider value={cache}>
const styles = constructStyleTagsFromChunks(extractCriticalToChunks(html));
```

And if your app relies on a right-to-left layout through `stylis-plugin-rtl`, add the same plugin to the cache you use for prerendering.

### Data from Your Database

If a section like "Our Work" loads from an API after the page opens, it won't be in the HTML. Fetch the data at build time, render it into the page, and pass it to the browser so the first render matches what's in the HTML.

## Fix 2: Files That Help Crawlers

- **`robots.txt`:** Allow crawling, specify what shouldn't be indexed (such as the admin dashboard), and point to your sitemap.
- **`sitemap.xml`:** A list of all your pages with their last-modified dates. Generate it at build time so you never forget to update it.
- **`llms.txt`:** A Markdown text file that summarizes your site for language models: who you are, what you offer, and your most important links.

## Fix 3: Structured Data (Schema.org)

JSON-LD structured data tells search engines what your content means, not just what it says:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Article title",
  "datePublished": "2026-10-29",
  "author": { "@type": "Organization", "name": "Company name" }
}
```

Use the right types: `Organization` for your company, `Service` for services, `BlogPosting` for articles, and `BreadcrumbList` for breadcrumb navigation.

## Fix 4: Quotable Content

The technical side alone isn't enough. AI tools quote sentences that are **clear and specific**:

- Introduce yourself in one direct sentence: who you are, what you offer, and who it's for.
- Use headings phrased as the questions people actually ask.
- Give a direct answer in the first paragraph, then the details.
- Write guides that answer your customers' questions — helpful articles are what gets quoted most.

## Quick Checklist

- [ ] Your HTML contains the actual content — run `curl` on your page to check.
- [ ] Every page has its own `title`, `description`, and `canonical`.
- [ ] A 1200×630 social sharing image.
- [ ] `robots.txt`, `sitemap.xml`, and `llms.txt`.
- [ ] JSON-LD structured data that fits each page type.
- [ ] Compressed images and a reasonably sized JavaScript bundle.

We applied these exact steps to the Qawsan website itself, which is built with React, MUI, and Vite — without migrating to another framework. If your site has the same problem, [get in touch](/en/start-project).
