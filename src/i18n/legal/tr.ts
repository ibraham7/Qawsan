import type { LegalText } from "./ar";

const tr: LegalText = {
  ui: {
    privacy: "Gizlilik Politikası",
    terms: "Kullanım Şartları",
    cookies: "Çerez Politikası",
    updatedLabel: "Son güncelleme",
    updatedDate: "6 Kasım 2026",
    contents: "İçindekiler",
    note: "Bu metin sitenin bugün fiilen yaptıklarını anlatır ve hukuki danışmanlık değildir. Sorunuz varsa {email} adresine yazın.",
    openCookieSettings: "Çerez ayarları",
    crumb: "Qawsan",
  },

  privacy: {
    metaTitle: "Gizlilik Politikası | Qawsan Studio",
    metaDescription: "Qawsan web sitesinin verilerinizi nasıl topladığı, kullandığı ve koruduğu; haklarınız ve bunları nasıl kullanacağınız.",
    title: "Gizlilik Politikası",
    intro: "Bu sayfa, qawsan.website üzerinden hangi verileri neden topladığımızı, kimlerle paylaştığımızı ve bunları nasıl kontrol edebileceğinizi açıklar.",
    sections: [
      {
        id: "who",
        title: "Biz kimiz",
        paragraphs: [
          "Qawsan Studio, kurucusu tarafından Türkiye’den yürütülen bireysel bir projedir; web siteleri ve özel sistemler geliştirir, kullanıcı arayüzü ve dijital kimlik tasarlar. Henüz bir şirket olarak tescil edilmemiştir ve bu politikadaki verilerden sorumlu taraftır.",
          "Gizlilik iletişimi: {email}",
        ],
      },
      {
        id: "data",
        title: "Topladığımız veriler",
        paragraphs: ["Yalnızca aşağıdaki amaçların her biri için gerekeni topluyoruz:"],
        list: [
          "“Projenizi başlatın” formu: adınız, şirketiniz (isteğe bağlı), e-postanız, WhatsApp numaranız, proje türü, yazdığınız açıklama, özellikler ve referanslar, bütçe ve süre aralığı, tercih ettiğiniz iletişim yöntemi ve verilerin işlenmesine onayınız.",
          "Değerlendirme formu: adınız, unvanınız veya kurumunuz (isteğe bağlı), yıldız puanı, yorum metni, sayfa dili ve yayımlanmasına onayınız.",
          "Formları kötüye kullanımdan korumak: gizli bir alan, formun doldurulma süresi ve denemeleri sınırlamak için kısa süre kullandığımız, kayıtlarımızda saklamadığımız IP adresiniz.",
          "Barındırma sağlayıcısının her ziyarette aldığı teknik veriler: IP adresi, tarayıcı türü ve istenen sayfa gibi. Siteyi çalıştırmak ve korumak içindir.",
          "İsteğe bağlı ve yalnızca onayınızla toplanan ölçüm verileri: ziyaret ettiğiniz sayfalar, yaklaşık ülkeniz, cihaz ve tarayıcı, siteyle etkileşiminiz ve form alanlarının gizlendiği gezinme kayıtları. Ayrıntılar Çerez Politikası’ndadır.",
        ],
        after: ["Sitede ziyaretçi hesabı yoktur, ödeme alınmaz; kart veya kimlik belgesi bilgisi istemeyiz."],
      },
      {
        id: "use",
        title: "Verilerinizi nasıl kullanıyoruz",
        list: [
          "Proje talebinize yanıt vermek, seçtiğiniz yöntemle size ulaşmak ve uygun bir teklif hazırlamak.",
          "Değerlendirmenizi gönderdiğiniz anda, yazdığınız ad, unvan ve metinle sitede yayımlamak. Gizleyebilir veya silebiliriz; siz de bunu isteyebilirsiniz.",
          "Sitenin nasıl kullanıldığını anlamak ve geliştirmek (onayınızla).",
          "Facebook ve Instagram reklamlarımızın sonuçlarını ölçmek (onayınızla).",
          "Siteyi ve formları spam ve kötüye kullanımdan korumak.",
        ],
      },
      {
        id: "basis",
        title: "İşleme dayanağı",
        paragraphs: [
          "Form verilerini talebiniz ve göndermeden önce onay kutusunu işaretleyerek verdiğiniz açık rızanız üzerine işleriz. Ölçüm ve pazarlama verilerini çerez penceresindeki, istediğiniz zaman geri alabileceğiniz onayınıza dayanarak işleriz. Temel teknik veriler siteyi çalıştırmak ve korumak için işlenir.",
        ],
      },
      {
        id: "providers",
        title: "Yararlandığımız hizmetler",
        paragraphs: ["Aşağıdaki sağlayıcıları kullanıyoruz. Verileriniz onlara yalnızca işlerini yapmaları için gerektiği kadar ulaşır:"],
        list: [
          "Vercel: siteyi barındırır ve formları alan fonksiyonları çalıştırır.",
          "Google Sheets (Google API’si üzerinden): formdan gönderilen proje taleplerini saklar.",
          "Resend: talebinizin veya değerlendirmenizin içeriğini de içeren bir bildirim e-postası gönderir.",
          "Supabase: değerlendirmeleri ve gösterilen projeleri tutan, yönetici girişini sağlayan veritabanı.",
          "Google Fonts: site yazı tiplerini Google sunucularından yükler; sayfa yüklenirken IP adresiniz Google’a ulaşır.",
          "Google Analytics, Microsoft Clarity ve Meta Pixel: yalnızca onayınızla çalışan isteğe bağlı araçlar.",
        ],
        after: ["Instagram, LinkedIn vb. bağlantılar kendi politikaları olan bağımsız hizmetlere gider."],
      },
      {
        id: "sharing",
        title: "Paylaşım",
        paragraphs: [
          "Verilerinizi satmıyoruz. Yalnızca siteyi çalıştırmak ve talebinizi işlemek için yukarıdaki sağlayıcılarla veya yasaların gerektirdiği hallerde paylaşırız. Gönderdiğiniz değerlendirme sitede herkese açık olur.",
        ],
      },
      {
        id: "retention",
        title: "Saklama süresi",
        paragraphs: [
          "Verileri gerekenden uzun süre saklamayız. Proje taleplerini, size yanıt vermek, projeyi teslim etmek ve sizinle ilişkimizi sürdürmek için gerektiği kadar saklar, sonra sileriz veya anonim hale getiririz. Değerlendirme, kaldırmamızı isteyene ya da gizlemeye karar verene kadar yayında kalır. Ölçüm verileri her aracın saklama ayarlarına tabidir. Verilerinizin silinmesini istediğiniz zaman talep edebilirsiniz.",
        ],
      },
      {
        id: "security",
        title: "Güvenlik",
        paragraphs: [
          "Site şifreli bağlantı (HTTPS) üzerinden sunulur, hizmet anahtarları tarayıcıda değil sunucuda kalır ve talepler ile değerlendirmelere erişim yalnızca yöneticiyle sınırlıdır. Yine de hiçbir aktarım veya saklama yöntemi tamamen güvenli değildir; mutlak güvenlik garanti edemeyiz.",
        ],
      },
      {
        id: "rights",
        title: "Haklarınız",
        paragraphs: ["Size uygulanan hukuka göre genellikle şu haklara sahipsiniz:"],
        list: [
          "Verilerinizin işlenip işlenmediğini öğrenmek ve bunlara erişmek.",
          "Hatalı verilerin düzeltilmesini istemek.",
          "Verilerinizin silinmesini veya yok edilmesini istemek.",
          "Onayınızı istediğiniz zaman geri çekmek; bu, öncesini etkilemez.",
          "İlgili olduğu hallerde işlemeye itiraz etmek veya sınırlanmasını istemek.",
          "Ülkenizdeki veri koruma otoritesine, Türkiye’de Kişisel Verileri Koruma Kurumu’na (KVKK) şikâyette bulunmak.",
        ],
      },
      {
        id: "request",
        title: "Talep nasıl iletilir",
        paragraphs: [
          "{email} adresine ne istediğinizi ve verilerinizi bulabilmemiz için formda kullandığınız e-postayı veya WhatsApp numarasını yazın. Önce kimliğinizi doğrulamanızı isteyebiliriz; en kısa sürede yanıt veririz.",
        ],
      },
      {
        id: "transfers",
        title: "Sınır ötesi aktarım",
        paragraphs: [
          "Yukarıdaki sağlayıcıların sunucuları sizin ülkenizin veya Türkiye’nin dışında olabilir. Siteyi kullanmanız, formları göndermeniz veya çerezleri kabul etmeniz halinde verileriniz oraya aktarılıp işlenebilir; bu konuda söz konusu sağlayıcıların güvencelerine dayanırız.",
        ],
      },
      {
        id: "updates",
        title: "Politikanın güncellenmesi",
        paragraphs: [
          "Sitenin uygulamaları veya araçlar değiştiğinde bu politikayı güncelleyebiliriz. Son güncelleme tarihi sayfanın üstündedir, yeni sürüm burada yayımlanır. Değişiklik önemliyse bunu sitede belirtiriz.",
        ],
      },
    ],
  },

  terms: {
    metaTitle: "Kullanım Şartları | Qawsan Studio",
    metaDescription: "Qawsan Studio web sitesinin, içeriğinin ve sunduğu hizmetlerin kullanımını düzenleyen şartlar.",
    title: "Kullanım Şartları",
    intro: "qawsan.website’i kullanarak bu şartları kabul etmiş olursunuz. Kabul etmiyorsanız lütfen siteyi kullanmayın.",
    sections: [
      {
        id: "about",
        title: "Site ve hizmetler hakkında",
        paragraphs: [
          "Site, henüz şirket olarak tescil edilmemiş bireysel bir proje olan Qawsan Studio’nun tanıtım yüzüdür; web sitesi geliştirme, özel sistem ve platform geliştirme ile arayüz (UI/UX) ve dijital kimlik tasarımı sunar.",
          "Site işlerimizi ve blogumuzu gösterir; proje talebi veya değerlendirme göndermenizi sağlar.",
        ],
      },
      {
        id: "scope",
        title: "Bu şartlar ve proje sözleşmeleri",
        paragraphs: [
          "Bunlar yalnızca web sitesinin kullanım şartlarıdır; bir müşteriyle imzaladığımız proje sözleşmesinin yerine geçmez. Proje talebi göndermek ne bizim ne sizin için bir yükümlülük doğurur; iş, kapsamı, fiyatı ve süreyi belirleyen yazılı bir anlaşmayla başlar.",
        ],
      },
      {
        id: "use",
        title: "İzin verilen kullanım",
        list: [
          "Siteyi gezmek ve içeriğini kişisel veya meşru ticari amaçlarla okumak.",
          "Gerçek bir proje için bizimle iletişime geçmek.",
          "Bizimle yaşadığınız gerçek bir deneyim hakkında dürüst görüş bildirmek.",
        ],
      },
      {
        id: "prohibited",
        title: "Yasak kullanım",
        list: [
          "Yanlış veya başkası adına bilgi, spam ya da otomatik mesaj göndermek.",
          "Siteyi hacklemeye, aksatmaya, korumasını aşmaya çalışmak veya izinsiz yönetim paneline erişmek.",
          "Siteyi ya da tasarım ve kodunun bölümlerini kopyalayıp kendinizinmiş gibi sunmak.",
          "Saldırgan, yanıltıcı veya başkalarının haklarını ihlal eden değerlendirmeler yazmak.",
          "Yasalara aykırı her türlü kullanım.",
        ],
      },
      {
        id: "ip",
        title: "Fikri mülkiyet",
        paragraphs: [
          "Sitenin tasarımı, kodu, metinleri, logosu ve görsel kimliği Qawsan Studio’ya aittir ve fikri mülkiyet haklarıyla korunur; yazılı izin olmadan kopyalanamaz veya yeniden kullanılamaz. Makaleler ve yayımlanan içerik okumak içindir; kaynak ve bağlantı belirtilerek alıntılanabilir.",
        ],
      },
      {
        id: "work",
        title: "Sitede gösterilen işler",
        paragraphs: [
          "Gösterilen işler ve görseller geliştirdiğimiz projelerdir. Bazılarının markaları ve verileri müşterilerimize ait olabilir ve yalnızca deneyimimizi göstermek için sergilenir. Görselleri düzenleyebilir veya içlerindeki hassas verileri gizleyebiliriz. Burada gösterilen bir projenin sahibiyseniz ve değiştirilmesini ya da kaldırılmasını istiyorsanız bize yazın.",
        ],
      },
      {
        id: "info",
        title: "Bilgilerin ve fiyatların niteliği",
        paragraphs: [
          "Sitedeki bilgiler geneldir. Formdaki bütçe veya süre aralıkları yol göstericidir, bağlayıcı bir teklif değildir. Gerçek fiyat ve süre, projenizi inceledikten sonra yazılı bir anlaşmada belirlenir.",
        ],
      },
      {
        id: "reviews",
        title: "Değerlendirmeler",
        paragraphs: [
          "Değerlendirme göndererek, adınız, unvanınız ve metninizle sitede yayımlanmasına izin verirsiniz ve bunun gerçek görüşünüz olduğunu onaylarsınız. Gönderilir gönderilmez görünür; bu şartlara aykırıysa gizleyebilir veya silebiliriz.",
        ],
      },
      {
        id: "disclaimer",
        title: "Sorumluluk reddi",
        paragraphs: [
          "Site “olduğu gibi” sunulur; kesintisiz veya hatasız çalışacağına dair söz verilmez. Bilgilerin doğru olması için çaba gösteririz ancak eksiksiz olduklarını garanti etmeyiz. Hukukun izin verdiği ölçüde, siteyi kullanmaktan veya içeriğine güvenmekten doğan dolaylı zararlardan sorumlu değiliz. Bu, hukuken vazgeçilemeyecek hiçbir hakkı etkilemez.",
        ],
      },
      {
        id: "links",
        title: "Bağlantılar ve harici hizmetler",
        paragraphs: [
          "Site, Instagram ve LinkedIn gibi diğer sitelere ve hizmetlere bağlantılar içerebilir. Bunlar kontrolümüz dışındadır; içeriklerinden veya politikalarından sorumlu değiliz.",
        ],
      },
      {
        id: "changes",
        title: "Değişiklikler",
        paragraphs: [
          "Siteyi değiştirebilir, bir bölümünü durdurabilir veya bu şartları her zaman güncelleyebiliriz. Güncel sürüm tarihiyle burada yayımlanır; sonrasında siteyi kullanmaya devam etmeniz kabul ettiğiniz anlamına gelir.",
        ],
      },
      {
        id: "contact",
        title: "İletişim",
        paragraphs: ["Bu şartlarla ilgili her soru için {email} adresine yazın."],
      },
    ],
  },

  cookies: {
    metaTitle: "Çerez Politikası | Qawsan Studio",
    metaDescription: "Qawsan’ın tarayıcınızda neleri sakladığı, hangi ölçüm ve pazarlama araçlarının yalnızca onayınızla çalıştığı ve tercihinizi nasıl değiştireceğiniz.",
    title: "Çerez Politikası",
    intro: "Bu sayfa, siteyi ziyaret ettiğinizde tarayıcınızda nelerin saklandığını, hangilerinin yalnızca onayınızla çalıştığını ve tercihinizi istediğiniz zaman nasıl değiştireceğinizi açıklar.",
    sections: [
      {
        id: "what",
        title: "Çerez nedir?",
        paragraphs: [
          "Çerezler, web sitelerinin tarayıcınıza kaydettiği küçük dosyalardır. Burada ayrıca Local Storage ve Session Storage gibi benzer teknolojileri de kullanıyoruz.",
        ],
      },
      {
        id: "why",
        title: "Neden kullanıyoruz",
        paragraphs: [
          "Siteyi çalıştırmak ve tercihlerinizi hatırlamak, ziyaretçilerin siteyi nasıl kullandığını anlayıp geliştirmek ve reklamlarımızın sonuçlarını ölçmek için. Üç kategoriye ayrılır: gerekli, analitik ve pazarlama.",
        ],
      },
      {
        id: "necessary",
        title: "Gerekli",
        paragraphs: ["Her zaman açıktır, onay gerektirmez ve izleme için kullanılmaz. Sitenin kendisi tarayıcınızda şunları saklar:"],
        list: [
          "qawsan-mode: açık veya koyu tema tercihiniz.",
          "qawsan-consent: çerez tercihiniz; hatırlayalım ve pencereyi her seferinde göstermeyelim diye.",
          "qawsan-lead-…: aynı talebin iki kez sayılmasını önleyen, oturum depolamasındaki geçici bir işaret.",
        ],
        after: ["Site dili sayfa adresinden (/en ve /tr) belirlenir ve çerezde saklanmaz."],
      },
      {
        id: "analytics",
        title: "Analitik (isteğe bağlı)",
        paragraphs: ["Yalnızca kabul ederseniz çalışır; en çok ziyaret edilen sayfaları ve insanların siteyi nasıl gezdiğini görmemize yardım eder:"],
        list: [
          "Google Analytics 4 (Google): ziyaretleri, sayfaları ve proje talebi gönderme ya da iletişim yöntemine tıklama gibi olayları ölçer. Kişiselleştirilmiş reklam özelliklerini kapattık; ona ad, e-posta veya formlara yazdıklarınızı göndermeyiz.",
          "Microsoft Clarity (Microsoft): ziyaretçilerin nerede zorlandığını görmek için gezinmeyi oturum kayıtları ve ısı haritaları olarak kaydeder. Form alanları kayıtlarda gizlenir.",
        ],
        after: ["Bu araçlar, adlarını ve sürelerini kendilerinin belirlediği çerezler bırakabilir; bunlar aşağıda listelenen politikalarında yer alır."],
      },
      {
        id: "marketing",
        title: "Pazarlama (isteğe bağlı)",
        paragraphs: [
          "Meta Pixel (Meta): ziyaretinizi ve gönderdiğiniz proje talebini Meta’ya bildirir; böylece Facebook ve Instagram reklamlarımızın sonuçlarını ölçeriz. Yalnızca pazarlama kategorisini kabul ederseniz çalışır; ona form verisi göndermeyiz.",
        ],
      },
      {
        id: "thirdparty",
        title: "Üçüncü taraf araçlar",
        paragraphs: ["Her aracın kendi gizlilik politikası vardır:"],
        list: [
          "Google: https://policies.google.com/privacy",
          "Microsoft: https://privacy.microsoft.com/privacystatement",
          "Meta: https://www.facebook.com/privacy/policy",
        ],
        after: [
          "Not: Site yazı tipleri Google Fonts’tan yüklenir; bu yüzden çerez tercihiniz ne olursa olsun sayfa yüklenirken IP adresiniz Google’a ulaşır. Ayrıntılar Gizlilik Politikası’ndadır.",
        ],
      },
      {
        id: "duration",
        title: "Süre",
        paragraphs: [
          "Her araç kendi dosyalarının süresini kendi ayarlarıyla belirler. Tercihiniz, siz değiştirene veya tarayıcı verilerini silene kadar tarayıcınızda tutulur. Doğrulamadığımız çerez adlarını ve sürelerini listelemiyoruz; ayrıntılı bir tablo, araçlar çalışırken canlı sitede doğrulandıktan sonra eklenecektir.",
        ],
      },
      {
        id: "consent",
        title: "Onay nasıl çalışır",
        list: [
          "İlk ziyarette şunları sunan bir pencere görünür: tümünü kabul et, gerekli olmayanları reddet ve özelleştir.",
          "Analitik ve pazarlama araçları siz kabul etmeden çalışmaz; pencereyi kapatmak kabul sayılmaz.",
          "İsteğe bağlı kategoriler önceden işaretli değildir.",
          "Reddetmeniz siteyi gezmenizi veya kullanmanızı engellemez.",
        ],
      },
      {
        id: "change",
        title: "Tercihi değiştirme veya geri çekme",
        paragraphs: [
          "Tercihinizi değiştirmek için herhangi bir sayfanın altındaki “Çerez ayarları”na veya aşağıdaki düğmeye basın. Onayı geri çektiğinizde araç göndermeyi durdurur ve çerezleri mümkün olduğunca silinir. Ayrıca tarayıcı ayarlarınızdan da silebilirsiniz.",
        ],
      },
    ],
  },
};

export default tr;
