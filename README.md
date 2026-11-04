# Kelime Atölyesi

[Siteyi aç](https://muhammedguven108.github.io/ingilizce-atolyesi/) · [GitHub deposu](https://github.com/MuhammedGUVEN108/ingilizce-atolyesi)
Telefon ve bilgisayar için Türkçe arayüzlü kişisel İngilizce çalışma sitesi. Derleme ve paket kurulumu gerektirmez.

## Açma
Kök klasördeki **index.html** dosyasına çift tıkla. CMD, Python veya yerel sunucu gerekmez.
Dosya taşınırken site/ ve data/ klasörlerini index.html ile birlikte koru.
GitHub Pages üzerinden de aynı dosyalar çalışır.
Yerel dosya ve GitHub Pages kayıtları farklı tarayıcı alanlarında tutulabilir; geçişten önce ilerlemeyi dışa aktar.

## Kelime veya kod değişikliği (geliştiriciler)
JSON dosyaları ana veri kaynağıdır. Değişikliklerden sonra:
```powershell
py -3 tools/build_local.py
```
Bu işlem data/generated/sets.js ve site/js/app.bundle.js dosyalarını üretir. Bunları elle düzenleme; kaynaklarla birlikte Git'e ekle.
Python yalnız geliştirme sırasında gerekir; siteyi kullanmak için gerekmez.

## Özellikler
Kartlar, çoktan seçmeli öğrenme, yazarak cevaplama, dinlediğini yazma, yalnız çoktan seçmeli test, altı çift eşleştirme, zamanlı tekrar, favoriler, arama, açık/koyu tema, JSON ilerleme aktarımı.
Öğrenilen sayacı: art arda en az üç doğru. Tekrar aralıkları: 1, 3, 7, 14, 30, 60 gün; yanlışta 10 dakika. Bu basit bir tekrar algoritmasıdır.
Telaffuz: cihazın speechSynthesis sesleri. İngiliz/Amerikan ve yavaş seçenekleri; ses bulunabilirliği cihaza bağlıdır. IPA ve Türkçe yaklaşık okunuş gerçek sesin yerine geçmez.
Çalışma kayıtları localStorage ile tarayıcıda saklanır. Otomatik cihaz eşitlemesi yoktur; ilerleme dosyasını dışa/içe aktar. Aynı kimlikli kayıtta içe aktarılan sürüm önceliklidir.
Örnek set kullanıcıdan gelmemiştir; yalnızca deneme içindir. Örnek IPA/seviye alanları bağımsız sözlük kontrolünden geçirilmemiştir.

## Düzen
- site/: CSS ve JavaScript
- data/inbox/: ham kelime girdileri
- data/sets/: temiz kelime setleri
- data/schemas/: şema
- docs/procedures/: tekrarlanabilir işlemler
- docs/decisions/: mimari kararlar
- docs/handoff/: diğer yapay zekâlar için güncel durum
- tools/: kontrol araçları
- .github/workflows/: GitHub Pages dağıtımı

## Kontrol
Geliştirici için: Node.js ile önce `npm ci --ignore-scripts` çalıştır. Bu bağımlılıklar siteyi açan kullanıcı için gerekli değildir.
```powershell
py -3 tools/build_local.py
npm test
```

Diğer yapay zekâlar önce AGENTS.md dosyasını okumalıdır.

## İlk kişisel veri: Oliver Twist
70 kelime ve 38 kalıp iki ayrı sette; ayrıca açılabilir 22 gramer notu ve 19 cümle bağlamı bulunur. Temizleme raporu docs/analysis/oliver-twist.md. Ham kaynak data/inbox/ altında korunur.

## Modern çalışma alanı
2026-11-04: set kütüphanesi, tüm setlerde arama, favori/tekrar koleksiyonları, büyük çalışma kartı ve odak modu eklendi. Testte soru sayısı seçilebilir. Telaffuz ayarları ve kart konumu hatırlanır. Terimler ve okuma notları ayrı sekmelerdedir. Eski favoriler/ilerleme aynı kayıtta korunur.

Kısayollar: Boşluk kartı çevirir; sol/sağ ok kart değiştirir; F favoriyi değiştirir; 1/2, kart çevrildikten sonra tekrar/biliyorum seçer. Escape odak modundan çıkar; / aramayı açar. Yazı alanlarında kart kısayolları işlemez.

Tasarım ve doğrulama rehberi: docs/decisions/002-modern-study-interface.md. Yazı tipi Inter yerel dosyadan yüklenir; lisansı site/fonts/LICENSE-Inter.txt içindedir.
