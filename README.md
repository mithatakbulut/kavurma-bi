# Kavurma — abonelik sağlığı

Küçük bir BI dashboard demosu. Kavurma Roasters'ın (kurgusal bir İstanbul kavurmacısı) aylık kahve aboneliğini izler: büyüme churn'ü yeniyor mu, aboneler hangi planlarda, bu hafta kaç kutu kavrulacak ve kim ayrılmak üzere?

**Canlı demo:** <https://kavurma.quotic.xyz>

![Genel bakış](docs/overview.png)

## Çalıştırma

Vite + React uygulaması. Node 20 veya üstü gerekir.

```bash
npm install
npm run dev       # http://localhost:5173
```

Üretim derlemesi ve önizlemesi:

```bash
npm run build
npm run preview   # http://localhost:4173
```

`npm run build` çıktısı `dist/` altındadır. Uygulama `BrowserRouter` kullanır; sunucunun bilinmeyen yolları `index.html`'e düşürmesi gerekir. Vite dev ve preview bunu kendiliğinden yapar, Vercel'de `vercel.json` içindeki SPA rewrite aynı işi görür.

## Rotalar

| Yol | Görünüm | Erişim |
| --- | --- | --- |
| `/giris` | Demo giriş kapısı | Herkes; oturum açıksa `/genel-bakis`'e döner |
| `/genel-bakis` | Genel bakış | `admin`, `operations`, `viewer` |
| `/aboneler` | Aboneler; `?filter=all\|risk\|healthy`, `?q=<arama>` | `admin`, `operations`, `viewer` |
| `/aksiyonlar` | Aksiyon kuyruğu | `admin`, `operations`; `viewer` `/genel-bakis`'e yönlenir |
| `/partiler` | Kavurma partileri | `admin`, `operations`, `viewer` |
| `/` ve bilinmeyen yollar | Oturum varsa `/genel-bakis`, yoksa `/giris` | — |

- Adresler artık hash değil, gerçek yollardır: `#aboneler` yerine `/aboneler`.
- `/aboneler` filtre ve arama durumunu sorgu parametrelerinde tutar; bağlantı paylaşılabilir ve yenilemede korunur. Sıralama yalnızca arayüz durumudur.
- Oturum yokken korumalı bir yola girilirse `/giris`'e yönlenir; başarılı girişten sonra istendiği yola döner.
- `viewer` rolü `/aksiyonlar` adresine doğrudan girdiğinde `/genel-bakis`'e yönlendirilir ve kısa bir bilgi gösterilir.
- Her görünümün kendi `document.title` değeri, aktif kenar çubuğu bağlantısı ve breadcrumb etiketi vardır.

## Giriş ve roller

Bu demo, gerçek bir müşteri uygulaması gibi davranması için istemci tarafında çalışan **sahte bir giriş** ve rol modeli içerir. Sunucu, çerez veya gerçek şifre doğrulaması yoktur; hesaplar ve şifreler bilerek giriş kartında gösterilir. Bu bir güvenlik kontrolü değildir, yalnızca demo/QA içindir.

| E-posta | Şifre | Rol | Ad |
| --- | --- | --- | --- |
| `admin@kavurma.co` | `Kavurma!Admin1` | `admin` (Yönetici) | Elif Demir |
| `ops@kavurma.co` | `Kavurma!Ops1` | `operations` (Operasyon) | Deniz Acar |
| `viewer@kavurma.co` | `Kavurma!Viewer1` | `viewer` (İzleyici) | Ece Yılmaz |

Giriş kartındaki bir demo hesabına tıklamak e-posta ve şifre alanlarını doldurur; form klavyeyle de gönderilebilir.

| Yetki | `admin` | `operations` | `viewer` |
| --- | --- | --- | --- |
| Genel bakış | ✓ | ✓ | ✓ |
| Aboneler, arama/filtre/sıralama | ✓ | ✓ | ✓ |
| Abone detayı | ✓ | ✓ | ✓ (salt okunur) |
| Aksiyonlar görünümü | ✓ | ✓ | — |
| CSV indir | ✓ | ✓ | — |
| Mesaj taslağı | ✓ | ✓ | — |
| Aksiyon çöz / yeniden aç | ✓ | ✓ | — |

Davranış:

- Giriş başarılı olduğunda `{email, role, name, title}` kaydı `sessionStorage` içinde `kavurma.session` anahtarıyla tutulur ve `/genel-bakis` açılır. `localStorage` kullanılmaz.
- Aynı sekmede sayfa yenilenirse oturum korunur; yeni tarayıcı oturumu kapalı başlar.
- Kenar çubuğundaki **Çıkış yap** düğmesi kaydı siler ve `/giris` adresine döner.
- Oturum yokken `/giris` dışındaki bütün adresler `/giris`'e yönlenir. Girişten sonra kullanıcı ilk istediği korumalı adrese geri döner.
- Kenar çubuğundaki kullanıcı kartı oturum açan kişinin adını ve unvanını gösterir; `viewer` için Aksiyonlar bağlantısı, CSV, mesaj ve aksiyon düğmeleri gizlenir.

## Neler var

- **Giriş** — `/giris` adresindeki demo giriş kapısı; üç hesap, satır içi hata ve şifre göster/gizle. Oturum yokken diğer adresler buraya yönlenir.
- **Dört KPI** — aylık yinelenen gelir, aktif abone, yeni abone, aylık churn. Değişimler son 4 haftaya göre hesaplanır; referans dönem her etiketin yanında yazar.
- **Abone akışı** — haftalık katılan/ayrılan sütunları, 4 / 8 / 13 hafta arasında geçiş. Net değer grafiğin üstünde.
- **Plan dağılımı** — Keşif, Tek Menşe ve Ofis planlarının abone sayıları; çubuklar gerçek payı gösterir.
- **Kavurma planı** — bu haftanın kutu/kapasite oranı, atlayan abone sayısı ve bir sonraki kavurma.
- **Riskli aboneler** — risk skoruna göre sıralı liste. Her satırdaki **Mesaj** düğmesi, müşteriye özel bir taslak açar; taslağı düzenleyip panoya kopyalayabilir veya e-posta uygulamasında açabilirsin.
- **Aboneler** — 24 kişilik tam liste; arama, Tümü/Riskli/Sağlıklı filtresi ve sıralama. Mobilde tablo, tüm alanları koruyan iki satırlı kartlara dönüşür.
- **Abone detayı** — bir aboneye (tablo satırı, kart veya riskli abone satırı) tıklayınca sağdan detay çekmecesi açılır: risk skoru ve durumu, plan, üyelik süresi, son kutu, sinyal ve e-posta. Çekmeceden e-posta kopyalanabilir veya kişiye özel mesaj taslağı açılabilir.
- **Aksiyonlar** — teslimat, ödeme ve geri kazanım kuyruğu; kategori/durum filtresi, telafi veya çözüm kaydı, çözüldü/yeniden aç ve mesaj taslağına geçiş. Yalnızca `admin` ve `operations` rolleri görür.
- **Kavurma partileri** — haftalık parti listesi, menşe, kavrum seviyesi, kutu/kg, durum ve not; durum filtresi.
- **CSV indir** — haftalık akışı ve abone listesini tek dosyada indirir. `viewer` rolünde gizlidir.
- Klavye: `/` aramaya gider, `Esc` açık katmanı kapatır, tüm kontroller klavyeyle kullanılabilir.

## Veri

Bütün sayılar `src/data.js` içinden gelir. Toplamlar satırlardan hesaplanır; dosyanın sonundaki `console.assert` kontrolleri plan toplamlarını, haftalık netleri, kanal toplamını ve riskli abone sayısını birbirine bağlar:

```js
console.assert(totalSubs === snapshot.activeSubscribers, ...);
console.assert(sum(channels, 'value') === 90, ...);
```

Demo verisi gerçek değildir. İsimler, e-posta adresleri (`@kavurma.co`), tutarlar ve tarihler örnek olarak yazıldı; gerçek kullanımda değiştirilmelidir. Para birimi TRY, tarihler 22 Kasım 2026 anlık görüntüsüdür.

## Yapı

```
index.html                 Vite giriş belgesi (#root)
vite.config.js             Vite + React eklentisi
vercel.json                SPA deep-link rewrite
src/main.jsx               React kökü ve global CSS
src/App.jsx                BrowserRouter ve rota tablosu
src/data.js                demo verisi, demo hesapları ve tutarlılık kontrolleri
src/lib/charts.js          bağımlılıksız SVG grafik yardımcıları
src/lib/format.js          sayı/tarih biçimleri, risk seviyesi, CSV, pano kopyalama
src/context/               oturum/rol ve toast sağlayıcıları
src/components/            kabuk, korumalı rota kapıları, diyaloglar, grafik
src/views/                 Giriş, Genel bakış, Aboneler, Aksiyonlar, Partiler
src/styles/app.css         tema tokenları, kabuk, paneller, giriş kartı, mobil düzen
public/fonts/              IBM Plex Sans + Mono (self-hosted, OFL)
public/fonts.css           @font-face tanımları
```

Tasarım: tinted L-frame + beyaz çalışma sayfası; veri rengi kavurma amberi. IBM Plex Sans metin, IBM Plex Mono yalnızca kimlikler, anahtarlar ve demo giriş bilgileri için.

## Sınırlar

- Giriş ve roller **sahtedir**: istemci tarafında çalışır, sunucuda doğrulanmaz ve bir güvenlik sınırı oluşturmaz. Şifreler herkese açık demo değerleridir; gerçek kullanıcı veya müşteri verisiyle kullanılmamalıdır.
- Canlı veri, API, gerçek mesaj gönderimi ve kalıcı aksiyon kaydı yok. Mesaj düğmesi yalnızca panoya kopyalar veya `mailto:` açar; çözülen aksiyonlar sayfa yenilenince sıfırlanır.
- Uygulama JavaScript ve bir build adımı gerektirir. `file://` ile açılış desteklenmez; istemci yönlendirmesi için sunucu tarafında SPA fallback gerekir.
- Depoda otomatik test paketi yoktur; doğrulama `npm run build` ve tarayıcıda rota/rol kontrolleriyle yapılır.
