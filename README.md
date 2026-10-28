# Kelime Atölyesi
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
Kartlar, çoktan seçmeli öğrenme, yazarak cevaplama, dinlediğini yazma, karma test, altı çift eşleştirme, zamanlı tekrar, favoriler, arama, açık/koyu tema, JSON ilerleme aktarımı.
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
```powershell
py -3 tools/validate_data.py
& 'C:\Users\Muhammed\AppData\Local\KitapPDF-Araclari\node\node.exe' --test tools/core.test.mjs tools/direct-open.test.mjs tools/oliver-data.test.mjs
```

Diğer yapay zekâlar önce AGENTS.md dosyasını okumalıdır.

## İlk kişisel veri: Oliver Twist
70 kelime ve 38 kalıp iki ayrı sette; ayrıca açılabilir 22 gramer notu ve 19 cümle bağlamı bulunur. Temizleme raporu docs/analysis/oliver-twist.md. Ham kaynak data/inbox/ altında korunur.
