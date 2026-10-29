---
title: لماذا لا يظهر موقع React في جوجل ومحركات الذكاء الاصطناعي؟ وكيف تصلحه
description: موقعك مبني بـ React ويبدو رائعًا، لكن محركات البحث وأدوات الذكاء الاصطناعي لا ترى محتواه. شرح تقني للمشكلة وحلولها؛ العرض المسبق، البيانات المنظمة، sitemap وllms.txt.
date: 2026-10-29
category: للمطورين
tags: React, SEO, GEO, Prerendering, Vite, llms.txt, Schema
---

بنيت موقعًا بـ React وVite، والتجربة في المتصفح ممتازة. ثم تفتح "عرض المصدر" فتجد هذا فقط:

```html
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
```

هذا ما تراه الزواحف (Crawlers) أولًا: صفحة فارغة. كل المحتوى يُبنى لاحقًا داخل المتصفح بـ JavaScript.

## من يرى المحتوى ومن لا يراه؟

- **جوجل** تشغّل JavaScript، لكن على مرحلتين: تزحف إلى HTML أولًا، ثم تعرض الصفحة لاحقًا عندما تتوفر الموارد. هذا يؤخر الفهرسة، وقد يفوّت محتوى يُحمّل بطلبات إضافية.
- **زواحف الذكاء الاصطناعي** مثل GPTBot وClaudeBot وPerplexityBot تقرأ HTML غالبًا **دون تشغيل JavaScript**. بالنسبة لها، موقعك هو العنوان والوصف فقط.
- **معاينات المشاركة** في واتساب ولينكدإن وتويتر لا تشغّل JavaScript أبدًا، وتعتمد على وسوم `meta` في HTML.

ومع تزايد من يسأل أدوات الذكاء الاصطناعي بدل البحث التقليدي، صار مصطلح **GEO** (Generative Engine Optimization) يعني: أن يكون محتواك مقروءًا ومفهومًا وقابلًا للاقتباس من هذه الأدوات.

## الحل الأول: العرض المسبق (Prerendering)

الفكرة: أثناء البناء (Build)، نشغّل التطبيق في Node ونحفظ ناتج HTML لكل صفحة. الزائر يستلم صفحة فيها المحتوى الكامل، ثم يتولى React التفاعل.

في React 19 توجد دالة `prerender` التي تنتظر حتى تكتمل المكونات المحمّلة بكسل (`lazy`)، بخلاف `renderToString`:

```tsx
import { prerender } from "react-dom/static";

export async function render(path: string) {
  const { prelude } = await prerender(<Root path={path} />);
  return await new Response(prelude).text();
}
```

ثم سكربت بعد البناء يحقن الناتج في `index.html`:

```js
const { html } = await render("/");
const page = template.replace("<!--prerender-html-->", html);
fs.writeFileSync("dist/index.html", page);
```

### ماذا عن CSS-in-JS؟

إن كنت تستخدم MUI أو Emotion، فالأنماط تُولَّد وقت التشغيل. بدونها ستظهر الصفحة المعروضة مسبقًا بلا تنسيق. الحل استخراج الأنماط الحرجة أثناء العرض:

```tsx
import createCache from "@emotion/cache";
import createEmotionServer from "@emotion/server/create-instance";

const cache = createCache({ key: "css" });
const { extractCriticalToChunks, constructStyleTagsFromChunks } =
  createEmotionServer(cache);
// ... اعرض التطبيق داخل <CacheProvider value={cache}>
const styles = constructStyleTagsFromChunks(extractCriticalToChunks(html));
```

وإن كان التطبيق يعتمد على تصميم من اليمين لليسار عبر `stylis-plugin-rtl`، فاستخدم نفس الإضافة في ذاكرة العرض المسبق.

### البيانات القادمة من قاعدة البيانات

إذا كان قسم مثل "أعمالنا" يُحمّل من API بعد فتح الصفحة، فلن يظهر في HTML. اجلب البيانات وقت البناء، واعرضها في الصفحة، ومرّرها للمتصفح حتى يطابق العرض الأول ما في HTML.

## الحل الثاني: ملفات تساعد الزواحف

- **`robots.txt`:** اسمح بالزحف وحدد ما لا يجب فهرسته، مثل لوحة الإدارة، وأشر إلى خريطة الموقع.
- **`sitemap.xml`:** قائمة بكل صفحاتك وتاريخ آخر تعديل. ولّدها أثناء البناء حتى لا تنسى تحديثها.
- **`llms.txt`:** ملف نصي بصيغة Markdown يلخّص موقعك لنماذج اللغة: من أنت، ماذا تقدم، وأهم الروابط.

## الحل الثالث: البيانات المنظمة (Schema.org)

البيانات المنظمة بصيغة JSON-LD تخبر المحركات بمعنى المحتوى، لا بنصه فقط:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "عنوان المقال",
  "datePublished": "2026-10-29",
  "author": { "@type": "Organization", "name": "اسم الشركة" }
}
```

استخدم الأنواع المناسبة: `Organization` للشركة، `Service` للخدمات، `BlogPosting` للمقالات، `BreadcrumbList` لمسار التنقل.

## الحل الرابع: محتوى قابل للاقتباس

الجانب التقني وحده لا يكفي. أدوات الذكاء الاصطناعي تقتبس الجمل **الواضحة والمحددة**:

- عرّف نفسك بجملة صريحة: من أنت، ماذا تقدم، ولمن.
- استخدم عناوين على شكل أسئلة يطرحها الناس فعلًا.
- قدّم إجابات مباشرة في أول فقرة، ثم التفاصيل.
- اكتب أدلة تجيب عن أسئلة عملائك، فالمقالات المفيدة أكثر ما يُقتبس.

## قائمة تحقق سريعة

- [ ] HTML يحتوي على المحتوى الفعلي، جرّب `curl` على صفحتك.
- [ ] لكل صفحة `title` و`description` و`canonical` خاصة بها.
- [ ] صورة مشاركة بمقاس 1200×630.
- [ ] `robots.txt` و`sitemap.xml` و`llms.txt`.
- [ ] بيانات منظمة JSON-LD مناسبة لكل نوع صفحة.
- [ ] صور مضغوطة وحزمة JavaScript معقولة الحجم.

طبّقنا هذه الخطوات على موقع قوسان نفسه، وهو مبني بـ React وMUI وVite، دون الانتقال إلى إطار عمل آخر. إن كان موقعك يعاني من نفس المشكلة، [تواصل معنا](/start-project).
