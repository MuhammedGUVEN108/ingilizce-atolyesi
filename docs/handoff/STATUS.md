# Güncel durum
2026-10-28 — İlk sürüm.
- Proje merkezi bu klasördür; yayın hedefi GitHub Pages.
- 7 çalışma modu, kütüphane, telaffuz, favoriler, basit aralıklı tekrar ve ilerleme dosyası aktarımı uygulandı.
- İlk kişisel veri Oliver Twist: 70 kelime + 38 kalıp; 22 gramer notu ve 19 cümle bağlamı. 8 kelimelik demo ayrı korunuyor. Kaynak/temizleme raporu docs/analysis/oliver-twist.md.
- AGENTS.md ve kelime/geliştirme/yayın prosedürleri ortak giriş noktasıdır.
- Hedef GitHub deposu bilinmiyor; remote, push ve canlı yayın yapılmadı.
- Otomatik cihaz eşitlemesi ve AI/sınıf/çok oyunculu özellikleri yok.
- Doğrulama: veri kontrolü (1 set/8 kelime), dört Node çekirdek testi ve app.js sözdizimi kontrolü geçti. Yerel HTTP 200 doğrulandı.
- Tarayıcı erişim hostu kullanılamadı: dar/geniş ekran, gerçek ses, tarayıcı etkileşimleri ve dosya aktarımı görsel olarak doğrulanmadı.
- index.html doğrudan açılır; CMD/sunucu gerektirmez. JSON/JS değişikliklerinden sonra tools/build_local.py ile klasik script çıktıları üretilir. Eski start-preview.cmd isteğe bağlıdır.
Sonraki adım: kullanıcının Oliver Twist seti geri bildirimini al; Foryos/Convet ve bozuk cümleler için kitap bağlamı geldiğinde inceleme kayıtlarını güncelle. GitHub hedef deposu hâlâ bilinmiyor.

Doğrudan açılış düzeltmesi doğrulaması: veri kontrolü ve beş Node testi geçti. Yeni test HTML'deki klasik betikleri ağ/fetch olmadan çalıştırır, ilk kartı, kart çevirmeyi ve ilerleme kaydını doğrular (DOM benzetimi; gerçek tarayıcı testi değildir). app.bundle.js sözdizimi kontrolü geçti.

Oliver Twist aktarımı: özgün dosya ve ham kopya SHA-256 eşleşti; 135 tablo satırının tamamı sınıflandırıldı. Kaynak cümleler/düzeltmeler ayrı korundu; tahmini sözcükler puanlanan cevaplara girmedi. Veri üretimi, sözdizimi ve sekiz Node testi geçti. Gerçek tarayıcı/ses kontrolü henüz yapılmadı.
