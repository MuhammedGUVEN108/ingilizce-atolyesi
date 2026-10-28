# Geliştirme prosedürü
1. AGENTS.md, README.md, docs/handoff/STATUS.md ve ilgili kaynak dosyalarını oku.
2. Git varsa git status ile kullanıcı değişikliklerini kontrol et; ilgisiz dosyaları ezme.
3. Arayüzü site/css/, davranışları site/js/, içeriği data/ altında tut. Yeni bağımlılık gerekmiyorsa ekleme.
4. Veriyi innerHTML'e doğrudan ekleme; metni escape et veya textContent kullan.
5. Veri kontrolünü, node --check site/js/app.js ve core testlerini çalıştır.
6. Yerel HTTP sunucusunda 390px ve 1440px genişlikte; klavye odağı, uzun kelime, boş filtre, tüm modlar, tema, ses, kayıt yenileme ve dışa/içe aktarmayı kontrol et.
7. Erişilemeyen tarayıcı/cihaz kontrolünü açıkça bekleyen iş olarak kaydet.
8. docs/handoff/STATUS.md ve docs/CHANGELOG.md dosyalarını sonuçlarla güncelle.

## Doğrudan HTML açılışı — 2026-10-28
index.html çift tıklamayla açılmalıdır; çalıştırma için CMD/sunucu zorunlu değildir. JSON veya JS değişikliğinden sonra py -3 tools/build_local.py çalıştır. data/generated/sets.js ve site/js/app.bundle.js üretilen dosyalardır; elle düzenleme, kaynaklarla birlikte commit et. Yerel testte file:// açılışını da kontrol et.
