# GitHub Pages yayın prosedürü
1. Kullanıcının hedef GitHub deposunu öğren. Depo belirlenmeden uzak repo oluşturma/push yapma.
2. Veri ve çekirdek testlerini çalıştır; kişisel ilerleme yedeklerini, sırları ve ham girdileri depoya ekleme.
3. Depoda Settings → Pages → Source: GitHub Actions seç.
4. Kod main dalına gönderildiğinde .github/workflows/pages.yml çalışır. Kullanıcı açıkça yayına izin verdiyse push yap.
5. Workflow sadece index.html, site/ ve data/catalog.json + data/sets/ içeriklerini dağıtır; prosedürler ve inbox yayın çıktısına girmez.
6. Actions sonucunu ve Pages adresini doğrula; depo alt yolunda CSS/JS/JSON yüklenmesini test et.
7. Gerçek URL'yi ve doğrulama sınırını STATUS.md içine yaz. Yayın başarısını yalnız yerel dosya oluşmasına dayanarak ilan etme.
Not: GitHub deposu herkese açıksa commit edilen dosyalar da herkese açıktır; site dağıtımından hariç tutmak depoyu özel yapmaz.

## Doğrudan HTML açılışı — 2026-10-28
index.html çift tıklamayla açılmalıdır; çalıştırma için CMD/sunucu zorunlu değildir. JSON veya JS değişikliğinden sonra py -3 tools/build_local.py çalıştır. data/generated/sets.js ve site/js/app.bundle.js üretilen dosyalardır; elle düzenleme, kaynaklarla birlikte commit et. Yerel testte file:// açılışını da kontrol et.
