# Geliştirme prosedürü
1. AGENTS.md, README.md, docs/handoff/STATUS.md ve ilgili kaynak dosyalarını oku.
2. Git varsa git status ile kullanıcı değişikliklerini kontrol et; ilgisiz dosyaları ezme.
3. Arayüzü site/css/, davranışları site/js/, içeriği data/ altında tut. Yeni bağımlılık gerekmiyorsa ekleme.
4. Veriyi innerHTML'e doğrudan ekleme; metni escape et veya textContent kullan.
5. Önce tools/build_local.py ile kaynaklardan çıktıları üret. Dev bağımlılıkları yoksa npm ci --ignore-scripts çalıştır. node --check site/js/app.bundle.js ve npm test ile veri/arayüz kontrollerini çalıştır. Linkedom testleri gerçek DOM kullanır; tarayıcı yerleşim testi yerine geçmez.
6. Yerel HTTP sunucusunda 390px ve 1440px genişlikte; klavye odağı, uzun kelime, boş filtre, tüm modlar, tema, ses, kayıt yenileme ve dışa/içe aktarmayı kontrol et.
7. Erişilemeyen tarayıcı/cihaz kontrolünü açıkça bekleyen iş olarak kaydet.
8. docs/handoff/STATUS.md ve docs/CHANGELOG.md dosyalarını sonuçlarla güncelle.

## Modern arayüzün korunacak akışları
- Aynı veri kimlikleri ve version:1 ilerleme şeması korunur. Yeni ayarlar ka-preferences-v2 içinde; veri kaydı taşınmaz.
- Yeni statik HTML denetimleri ve dinamik data-action denetimleri tek uygulamada çalışır; app.bundle.js elle düzenlenmez.
- Kartlar, öğrenme, yazma, dinleme, test kurulumu/sonucu, eşleştirme, tekrar, boş filtre, arama sonuçları, not sekmesi ve veri diyaloglarını dene.
- Gerçek font dosyası ve lisansı site/fonts/ içinde yereldir. Yeni ikonlarda index.html içindeki SVG symbol kimliklerini kullan; dekoratif ikona aria-hidden, ikonsuz metin taşımayan butona aria-label ekle.
- Mobil menü 800px altında açılır; 600px altında üst arama ayrı satırdadır. Modlar yatay kayar. Odak modu yardımcı panelleri gizler; Escape ile çıkılır.

## Doğrudan HTML açılışı — 2026-10-28
index.html çift tıklamayla açılmalıdır; çalıştırma için CMD/sunucu zorunlu değildir. JSON veya JS değişikliğinden sonra py -3 tools/build_local.py çalıştır. data/generated/sets.js ve site/js/app.bundle.js üretilen dosyalardır; elle düzenleme, kaynaklarla birlikte commit et. Yerel testte file:// açılışını da kontrol et.

## Kişisel kayıt kontrolleri
- storage.js IndexedDB işlemlerini ve 10 MB sınırını yönetir. Derleyici core/storage/app kaynaklarını birleştirir; başlangıç window.KA_READY ile beklenebilir.
- Veri değişiklikleri son kayıt üzerinde transaction ile yapılır. JSON doğrulamasını ve eski wrong=attempts-correct uyumluluğunu koru.
- Fake-indexeddb ve Linkedom yalnız devDependency. tools/personal-data.test.mjs silme/iptal, kota, taşıma, sekme eşzamanlılığı ve zorlanılan kelime testlerini kapsar.
- Gerçek kullanıcı tarayıcısında silme testi yapma. Temiz Playwright bağlamında yalnız sentetik kayıt kullan. Silme sadece bu uygulamanın verisini hedeflemeli.
