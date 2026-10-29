---
title: React Siteniz Neden Google'da ve Yapay Zekâ Aramalarında Görünmüyor? Nasıl Düzeltilir?
description: React siteniz harika ama arama motorları ve yapay zekâ araçları içeriğini görmüyor mu? React SEO sorunu ve çözümleri: prerendering, Schema, sitemap ve llms.txt.
date: 2026-10-29
category: Geliştiriciler İçin
tags: React SEO, arama motoru optimizasyonu, GEO, Prerendering, Vite, llms.txt, Schema, yapılandırılmış veri
---

React ve Vite ile bir site geliştirdiniz ve tarayıcıdaki deneyim mükemmel. Sonra "Sayfa kaynağını görüntüle" seçeneğini açıyorsunuz ve yalnızca şunu görüyorsunuz:

```html
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
```

Arama botlarının (crawler'ların) ilk gördüğü şey budur: boş bir sayfa. Tüm içerik daha sonra tarayıcının içinde JavaScript ile oluşturulur.

## İçeriği kim görüyor, kim görmüyor?

- **Google** JavaScript'i çalıştırır, ancak iki aşamada: Önce HTML'yi tarar, kaynaklar hazır olduğunda da sayfayı render eder. Bu, dizine eklenmeyi geciktirir ve ek isteklerle yüklenen içeriğin gözden kaçmasına yol açabilir.
- GPTBot, ClaudeBot ve PerplexityBot gibi **yapay zekâ crawler'ları**, HTML'yi genellikle **JavaScript çalıştırmadan** okur. Onlar için siteniz yalnızca başlık ve açıklamadan ibarettir.
- WhatsApp, LinkedIn ve Twitter'daki **paylaşım önizlemeleri** JavaScript'i hiçbir zaman çalıştırmaz; HTML'deki `meta` etiketlerine dayanır.

Geleneksel arama yerine yapay zekâ araçlarına soru soranların sayısı arttıkça **GEO** (Generative Engine Optimization – Üretken Motor Optimizasyonu) kavramı da şu anlama gelmeye başladı: İçeriğinizin bu araçlar tarafından okunabilir, anlaşılabilir ve alıntılanabilir olması.

## Birinci çözüm: Önceden render etme (Prerendering)

Fikir şu: Derleme (build) sırasında uygulamayı Node'da çalıştırır ve her sayfanın HTML çıktısını kaydederiz. Ziyaretçi, içeriğin tamamını barındıran bir sayfa alır; ardından etkileşimi React devralır.

React 19'daki `prerender` fonksiyonu, `renderToString` fonksiyonunun aksine, tembel yüklenen (`lazy`) bileşenlerin tamamlanmasını bekler:

```tsx
import { prerender } from "react-dom/static";

export async function render(path: string) {
  const { prelude } = await prerender(<Root path={path} />);
  return await new Response(prelude).text();
}
```

Ardından build sonrasında çalışan bir script, çıktıyı `index.html` dosyasına yerleştirir:

```js
const { html } = await render("/");
const page = template.replace("<!--prerender-html-->", html);
fs.writeFileSync("dist/index.html", page);
```

### Peki ya CSS-in-JS?

MUI veya Emotion kullanıyorsanız stiller çalışma zamanında (runtime) üretilir. Bunun için önlem almazsanız önceden render edilen sayfa stilsiz görünür. Çözüm, render sırasında kritik stilleri çıkarmaktır:

```tsx
import createCache from "@emotion/cache";
import createEmotionServer from "@emotion/server/create-instance";

const cache = createCache({ key: "css" });
const { extractCriticalToChunks, constructStyleTagsFromChunks } =
  createEmotionServer(cache);
// ... uygulamayı <CacheProvider value={cache}> içinde render edin
const styles = constructStyleTagsFromChunks(extractCriticalToChunks(html));
```

Uygulamanız `stylis-plugin-rtl` ile sağdan sola (RTL) bir tasarım kullanıyorsa aynı eklentiyi prerender önbelleğinde (cache) de kullanın.

### Veritabanından gelen veriler

"Projelerimiz" gibi bir bölüm, sayfa açıldıktan sonra bir API'den yükleniyorsa HTML'de görünmez. Verileri build sırasında çekin, sayfada gösterin ve tarayıcıya da aktarın; böylece ilk render, HTML'dekiyle birebir eşleşir.

## İkinci çözüm: Crawler'lara yol gösteren dosyalar

- **`robots.txt`:** Taramaya izin verin, yönetim paneli gibi dizine eklenmemesi gereken alanları belirtin ve site haritasının adresini gösterin.
- **`sitemap.xml`:** Tüm sayfalarınızın ve son güncelleme tarihlerinin listesi. Güncellemeyi unutmamak için build sırasında otomatik olarak oluşturun.
- **`llms.txt`:** Sitenizi dil modelleri için özetleyen, Markdown formatında bir metin dosyası: kim olduğunuz, ne sunduğunuz ve en önemli bağlantılarınız.

## Üçüncü çözüm: Yapılandırılmış veriler (Schema.org)

JSON-LD formatındaki yapılandırılmış veriler, arama motorlarına içeriğin yalnızca metnini değil, anlamını da anlatır:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Makale başlığı",
  "datePublished": "2026-10-29",
  "author": { "@type": "Organization", "name": "Şirket adı" }
}
```

Uygun türleri kullanın: şirket için `Organization`, hizmetler için `Service`, makaleler için `BlogPosting`, gezinme yolu (breadcrumb) için `BreadcrumbList`.

## Dördüncü çözüm: Alıntılanabilir içerik

Teknik taraf tek başına yeterli değildir. Yapay zekâ araçları **net ve somut** cümleleri alıntılar:

- Kendinizi açık bir cümleyle tanıtın: kim olduğunuz, ne sunduğunuz ve kime hitap ettiğiniz.
- İnsanların gerçekten sorduğu sorular biçiminde başlıklar kullanın.
- İlk paragrafta doğrudan yanıt verin, ayrıntıları sonra ekleyin.
- Müşterilerinizin sorularını yanıtlayan rehberler yazın; en çok alıntılanan içerikler faydalı makalelerdir.

## Hızlı kontrol listesi

- [ ] HTML gerçek içeriği barındırıyor; sayfanızı `curl` ile test edin.
- [ ] Her sayfanın kendine ait `title`, `description` ve `canonical` etiketleri var.
- [ ] 1200×630 boyutunda bir paylaşım görseli.
- [ ] `robots.txt`, `sitemap.xml` ve `llms.txt`.
- [ ] Her sayfa türüne uygun JSON-LD yapılandırılmış veriler.
- [ ] Sıkıştırılmış görseller ve makul boyutta bir JavaScript paketi (bundle).

Bu adımları, React, MUI ve Vite ile geliştirilen Qawsan'ın kendi web sitesinde, başka bir framework'e geçmeden uyguladık. Siteniz de aynı sorunu yaşıyorsa [bizimle iletişime geçin](/tr/start-project).
