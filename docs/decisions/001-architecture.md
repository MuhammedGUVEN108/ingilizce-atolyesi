# 001 — Statik site ve ayrı kelime verisi
2026-10-28. Kullanıcı onayı: Quizlet benzeri kişisel çalışma, mobil/masaüstü, GitHub Pages, düzenli klasörler, diğer yapay zekâlar için prosedürler.
HTML/CSS/ES modülleri ve JSON seçildi. Derleme servisine veya ücretli API'ye ihtiyaç yoktur.
Kelime verileri Git ile yayınlanır; kişisel öğrenme geçmişi localStorage'dadır, otomatik cihaz eşitlemesi değildir.
İçe aktarma mevcut kaydı koruyarak birleştirir, aynı kelimede dosyadaki kayıt önceliklidir.
Gerçek sunucu gerektiren çok oyunculu oyun, kullanıcı hesabı, bulut eşitleme ve sitede AI üretimi mevcut sürümde yoktur. Bunlar ayrı mimari karar gerektirir.

## 2026-10-28 — Kullanıcının doğrudan açılış düzeltmesi
ES modülleri ve fetch yerel dosya açılışında kısıtlanabildiğinden, kaynaklar korunarak klasik JS çıktısı ve JSON'dan üretilen ayrı veri betiği seçildi. index.html yalnız bu iki betiği yükler. CMD önizlemesi isteğe bağlıdır.
