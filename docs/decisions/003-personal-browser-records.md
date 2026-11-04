# 003 — Kişisel tarayıcı kaydı ve zorlanılan kelimeler

2026-11-04. Kullanıcı favorileri, kelime başına yanlış sayısını, sık yanlış yapılanlardan test üretimini ve tarayıcı verisini silme butonunu istedi. İlk önerilen 256 KB sınırını reddedip **10 MB** sınırını açıkça belirledi.

## Saklama ve sınır

- Ana kayıt IndexedDB: veritabanı `kelime-atolyesi-personal-v1`, `records` deposunda `progress` anahtarı. JSON içeriği hâlâ `version:1, words:{...}` biçiminde; içe/dışa aktarım geriye uyumludur.
- Tarayıcı yerel kaydı kullanıcı hesabına bağlı değildir. Aynı cihaz/tarayıcı profilindeki kişiler aynı kaydı kullanır. Başka profil, cihaz veya tarayıcı ayrı kayda sahiptir. Otomatik cihaz eşitlemesi yoktur.
- Bu kod favori/sayaç/ilerleme verisini sunucuya veya GitHub'a göndermez. GitHub Pages statik dosyaları dağıtır; ortak kelime setleri GitHub'da kalır, kişisel sayaçlar tarayıcıda kalır.
- Web Storage'ın sık görülen 5 MB localStorage kotası yüzünden, 10 MB hedefi için IndexedDB kullanılır. IndexedDB açılamazsa eski localStorage yöntemi; o da açılamazsa açık uyarıyla oturum içi kayıt kullanılır. Tarayıcı depolama politikası yine yazmayı reddedebilir.
- Uygulama üst sınırı `10 * 1024 * 1024` bayt. Muhafazakâr hesap: JSON karakter sayısı × 2 ve uygulamanın kendi yerel ayar/tema anahtarları. Veritabanı altyapı ek yükü ve sitenin dosya/font önbelleği bu kişisel veri ölçümünün dışındadır.
- Sınırı aşan ekleme/içe aktarım mevcut kaydı değiştirmez ve uyarı verir. Tarayıcı kotası hatası da sessizce başarılı sayılmaz. Normal kayıtlar uzun oturum günlükleri tutmaz, yalnız kelime başına sayaç tutar.
- 116 kelimenin her birinde 201 değerlendirme, doğru/yanlış, yıldız, son değerlendirme zamanı gibi alanlarla hazırlanan **sentetik örnek**: 38.264 bayt, **37,4 KB**. Gerçek kullanıcının kaydı okunarak ölçülmedi.

## Eski kaydın taşınması

- `kelime-atolyesi-progress-v1` yerel anahtarı ilk açılışta okunur.
- Geçerli veri IndexedDB'ye yazılır ve geri okunarak doğrulanır. Yalnız bundan sonra, kaynak değer hâlâ aynıysa eski ilerleme anahtarı kaldırılır. Taşıma başarısızsa özgün kayıt korunur.
- `ka-preferences-v2` ve `ka-theme` yerelde kalır. Eski JSON yedekleri hâlâ yüklenebilir.
- Her güncelleme IndexedDB okuma/yazma işlemi içinde son veriden üretilir; iki sekmenin sayaçları birbirini ezmez. BroadcastChannel yalnız yenile/silindi sinyali taşır; ağ bağlantısı değildir.

## Sayaçlar ve test

- Alanlar: `attempts`, `correct`, `wrong`, `streak`, `wrongStreak`, `lastResult`, `lastReviewedAt`, `due`, `star`.
- Eski kayıtta `wrong` yoksa `max(0, attempts - correct)` kullanılır. Kartların tekrar/biliyorum değerlendirmeleri ve soru cevapları sayılır; eşleştirme oyunu bu sayaçları değiştirmez.
- Zorlandıklarım görünümü en az bir yanlış bulunan terimleri alır. Filtreler: tüm yanlışlar, en az iki yanlış, son cevabı yanlış olanlar.
- Öncelik: `wrong * (wrong / attempts) + wrongStreak`, eşitlikte yanlış sayısı. Soru sayısı kadar üst kayıt seçilir, sonra sıranın ezberlenmemesi için karıştırılır. Yeni doğrular geçmiş yanlışı silmez; önceliği düşürebilir.
- Bu koleksiyonun testi ve yanlışları tekrar turu yalnız çoktan seçmeli olur. Tek bir zorlanılan kelime olsa bile diğer setlerden çeldiricilerle dört ayrı seçenek hazırlanır.
- Kelime listesinde ve kart altında doğru, yanlış, deneme sayıları görünür. Verilerim ekranı toplamları ve yaklaşık kullanılan alanı gösterir.

## Silme davranışı

- Verilerim → Verilerimi sil → açıklayıcı ikinci onay. Vazgeç veya kapat kayıt değiştirmez.
- Onayda yalnız bu uygulamanın `progress` veritabanı kaydı ve üç yerel anahtarı silinir: `kelime-atolyesi-progress-v1`, `ka-preferences-v2`, `ka-theme`.
- `localStorage.clear()` kullanılmaz; aynı GitHub origin'indeki diğer projelerin verilerine dokunulmaz. Çalışma setleri, indirilmiş yedek dosyalar ve başka tarayıcılardaki kayıtlar silinmez.
- Sayaçlar/favoriler, ses tercihleri, tema ve çalışma konumu sıfırlanır; açık işlemler/timer temizlenir. Diğer açık sekmeler silindi sinyaliyle kişisel ekranlarını yeniler.

## Doğrulama

- 26 Node/DOM/IndexedDB testi: eski kaydı taşıma, başarısız taşımada kaynağı koruma, 5 MB üstü kayıt/10 MB sınır reddi, iki sekme sayaçları, eski sayaç uyumluluğu, tek kelimelik yanlış testi, silmeyi iptal/onay ve ilgisiz anahtarı koruma.
- Yerel Playwright/Edge, temiz geçici bağlamlarda `file:` açılışıyla 1440×1000 ve 390×844 ekranlar; sentetik kayıtla veri özeti, silme onayı ve zorlanılan kelime listesi görüntülendi. Kullanıcının gerçek tarayıcı kaydı silinmedi. Fiziksel telefonda/ses çıkışında test yapılmadı.
- Kaynaklar: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [kotalar](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).
