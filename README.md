# Kavurma — abonelik sağlığı

Küçük bir BI dashboard demosu. Kavurma Roasters'ın (kurgusal bir İstanbul kavurmacısı) aylık kahve aboneliğini izler: büyüme churn'ü yeniyor mu, aboneler hangi planlarda, bu hafta kaç kutu kavrulacak ve kim ayrılmak üzere?

**Canlı demo:** <https://kavurma.quotic.xyz>

![Genel bakış](docs/overview.png)

## Çalıştırma

Bağımlılık, build adımı veya API yok. Depoyu indirip `index.html`'i tarayıcıda açabilirsin; yerel sunucu tercih edersen:

```bash
python3 -m http.server 4173
```

Sonra <http://localhost:4173> adresini aç.

## Neler var

- **Dört KPI** — aylık yinelenen gelir, aktif abone, yeni abone, aylık churn. Değişimler son 4 haftaya göre hesaplanır; referans dönem her etiketin yanında yazar.
- **Abone akışı** — haftalık katılan/ayrılan sütunları, 4 / 8 / 13 hafta arasında geçiş. Net değer grafiğin üstünde.
- **Plan dağılımı** — Keşif, Tek Menşe ve Ofis planlarının abone sayıları; çubuklar gerçek payı gösterir.
- **Kavurma planı** — bu haftanın kutu/kapasite oranı, atlayan abone sayısı ve bir sonraki kavurma.
- **Riskli aboneler** — risk skoruna göre sıralı liste. Her satırdaki **Mesaj** düğmesi, müşteriye özel bir taslak açar; taslağı düzenleyip panoya kopyalayabilir veya e-posta uygulamasında açabilirsin.
- **Aboneler** — 24 kişilik tam liste; arama, Tümü/Riskli/Sağlıklı filtresi ve sıralama. Mobilde tablo, tüm alanları koruyan iki satırlı kartlara dönüşür.
- **Abone detayı** — bir aboneye (tablo satırı, kart veya riskli abone satırı) tıklayınca sağdan detay çekmecesi açılır: risk skoru ve durumu, plan, üyelik süresi, son kutu, sinyal ve e-posta. Çekmeceden e-posta kopyalanabilir veya kişiye özel mesaj taslağı açılabilir.
- **CSV indir** — haftalık akışı ve abone listesini tek dosyada indirir.
- Klavye: `/` aramaya gider, `Esc` açık katmanı kapatır, tüm kontroller klavyeyle kullanılabilir.

## Veri

Bütün sayılar `assets/data.js` içinden gelir. Toplamlar satırlardan hesaplanır; dosyanın sonundaki `console.assert` kontrolleri plan toplamlarını, haftalık netleri, kanal toplamını ve riskli abone sayısını birbirine bağlar:

```js
console.assert(totalSubs === snapshot.activeSubscribers, ...);
console.assert(sum(channels, 'value') === 90, ...);
```

Demo verisi gerçek değildir. İsimler, e-posta adresleri (`@kavurma.co`), tutarlar ve tarihler örnek olarak yazıldı; gerçek kullanımda değiştirilmelidir. Para birimi TRY, tarihler 22 Kasım 2026 anlık görüntüsüdür.

## Yapı

```
index.html          tek sayfa; iki görünüm (genel bakış, aboneler)
assets/app.css      tema tokenları, kabuk, paneller, mobil düzen
assets/app.js       hesaplar, grafikler, yönlendirme, mesaj taslağı, CSV
assets/data.js      demo verisi ve tutarlılık kontrolleri
assets/charts.js    bağımlılıksız SVG grafik yardımcıları
assets/fonts/       IBM Plex Sans + Mono (self-hosted, OFL)
assets/fonts.css    @font-face tanımları
```

Tasarım: tinted L-frame + beyaz çalışma sayfası; veri rengi kavurma amberi. IBM Plex Sans metin, IBM Plex Mono yalnızca abone kimlikleri için.

## Sınırlar

- Giriş, yetkilendirme, canlı veri ve gerçek mesaj gönderimi yok. Mesaj düğmesi yalnızca panoya kopyalar veya `mailto:` açar.
- Grafik ve filtreler JavaScript gerektirir; KPI'lar ve tablo verisi JavaScript olmadan da statik olarak görünür.
- `file://` ile açılış desteklenir; yerel sunucu, tarayıcı kısıtlamalarını tamamen ortadan kaldırır.
