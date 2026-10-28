# Proje başlangıç talimatı
Bu dosya tüm yapay zekâlar ve geliştiriciler içindir. Önce README.md, docs/handoff/STATUS.md ve ilgili prosedürü oku.
- Kullanıcı: Muhammed. Arayüz Türkçe; mobil ve bilgisayar eşit öncelikli.
- Bu klasör proje merkezidir. Kök dizine geçici dosya, sohbet dökümü veya yedek yığma.
- Onaylı kapsam: kartlar, öğrenme, yazma, dinleme, test, eşleştirme, tekrar, kelime verisi, ilerleme aktarımı.
- Yayın hedefi GitHub Pages. Sites hosting oluşturma. Anahtar veya gizli bilgi istemci koduna yazma.
- Veri kaynağı data/sets/*.json; site koduna kelime gömme.
- Sohbet verisi temizliği: docs/procedures/IMPORTING_CHAT_LOGS.md. İlk örnek veri kümesinin analizi docs/analysis/oliver-twist.md içindedir. data/analysis/ altındaki kaynak izlerini ve belirsizlikleri koru; importer set dosyalarını yeniden yazabileceğinden elle değişiklikleri kontrol etmeden çalıştırma.
- Kelime ekleme: docs/procedures/WORDS.md. Geliştirme: DEVELOPMENT.md. Yayın: RELEASE.md.
- Mevcut kelime kimliğini değiştirme; ilerleme bu kimlikle saklanır. Aynı sözcüğün farklı anlamlarını ayrı kayıtla yönet.
- Kullanıcının ham kelimelerini data/inbox/ altında koru; doğrulanmamış IPA/seviye/açıklamayı kesin bilgi gibi sunma.
- Kullanıcı verisini silme; içe aktarmada çakışma politikasını koru veya açıkça belgele.
- İş sonunda anlamlı doğrulama çalıştır; STATUS.md ve CHANGELOG.md dosyalarını güncelle. Yapılmayan kontrolü yapılmış sayma.
- GitHub deposu belirlenmeden remote ekleme/yayın yapma. Gelecek iş önerisini tamamlandı olarak kaydetme.

## Doğrudan HTML açılışı — 2026-10-28
index.html çift tıklamayla açılmalıdır; çalıştırma için CMD/sunucu zorunlu değildir. JSON veya JS değişikliğinden sonra py -3 tools/build_local.py çalıştır. data/generated/sets.js ve site/js/app.bundle.js üretilen dosyalardır; elle düzenleme, kaynaklarla birlikte commit et. Yerel testte file:// açılışını da kontrol et.
