# Güncel durum
2026-11-04 — Modern çalışma arayüzü.

- Kullanıcı önceki tasarımı istediği gibi bulmadı; modern, Quizlet'e yakın bir görünüm istedi. Yeni karar docs/decisions/002-modern-study-interface.md içinde.
- Merkez: C:/Users/Muhammed/Desktop/ingilizce sitesi. Repo: https://github.com/MuhammedGUVEN108/ingilizce-atolyesi ; remote origin, dal main.
- Site: https://muhammedguven108.github.io/ingilizce-atolyesi/ . Yayın, main'e gönderimden sonra GitHub Actions/Pages ile yapılır.
- Görünüm: indigo/beyaz yüzeyler, yerel Inter, SVG ikonları, masaüstünde sol menü; telefonda açılır menü ve kaydırılabilen modlar. Eski kullanılmayan tokens/components CSS dosyaları kaldırıldı.
- Kütüphane, genel set/kelime/kaynak biçimi araması, favori/tekrar koleksiyonları, odak modu, kart yönü ve klavye kontrolleri işlevsel.
- Yedi çalışma modu korundu. Kullanıcının 2026-11-04 düzeltmesi: Test modu yalnız çoktan seçmeli sorular içerir; yanlışları tekrar ederken de yazılı soru gelmez. Testte soru sayısı seçilir. Öğren modunda iki art arda doğruya ulaşan terim yazılı sorulabilir. Aynı turda kartın iki kez puanlanması engellendi; eşleştirme zamanlayıcısı görünümden çıkınca durur.
- Ses ayarları ve ana set kart konumu hatırlanır. Terimler ve okuma notları ayrı sekmelerde; kullanım notları terimlerde korunur.
- Üç set/116 toplam kart değişmedi: Oliver Twist 70 kelime + 38 kalıp, ayrıca 8 örnek kart. Kaynak analizi ve 22 gramer/19 cümle notu korundu. Foryos/Convet kitap bağlamı olmadan kesinleştirilmez.
- Veri anahtarı kelime-atolyesi-progress-v1 ve version:1 içe/dışa aktarım şeması aynı; eski favoriler/ilerleme taşınmadan okunur. Yeni ayarlar ka-preferences-v2; tema ka-theme.
- index.html çift tıklamayla açılır. Kullanıcı için CMD/sunucu/npm gerekmez. Geliştirmede npm ci --ignore-scripts, py -3 tools/build_local.py, npm test kullanılır. Linkedom yalnız devDependency'dir.
- Doğrulama: veri üretimi, JS sözdizimi, CSS/yerel font/ikon referansları ve 17 Node testi geçti. Gerçek DOM ile açılış, eski kayıt uyumluluğu, modlar, zamanlayıcı, arama, not sekmeleri, klavye ve veri aktarımı sınandı. Ek kontrol: 20 soruluk testin tümü ve yanlışları tekrar turu, öğrenilmiş kelimelerde dahi yalnız çoktan seçmeli; Yaz/Dinle modları bağımsız olarak çalışıyor.
- Windows Computer Use mevcut tarayıcı URL'sini güvenle tespit edemediği için görsel kontrolü durdurdu. Engel aşılmadı; gerçek masaüstü/telefon görünümü ve fiziksel ses kontrolü yapılmış sayılmaz.
- İlerleme tarayıcıda yereldir; otomatik cihaz eşitlemesi yok. Yeni sunucu/AI/sınıf/çok oyunculu özellik eklenmedi.
- Ham sohbet data/inbox/ altında yerelde kalır; .preview/ ve node_modules/ Git'ten hariçtir.

Sonraki adım: kullanıcının modern tasarım geri bildirimi ve yeni kelime listeleri. Yeni bir özellik kararı olmadan veri şemasını veya kayıt anahtarını değiştirme.
