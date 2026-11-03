# 002 — Modern çalışma arayüzü

2026-11-04. Kaynak: Muhammed'in açık isteği; önceki görünümü yeterli bulmadı, modern ve Quizlet tarzına yakın bir site istedi. Bu karar yalnız İngilizce sitesi kapsamındadır.

## Görsel yapı

- Fildişi/sarı/serif görünümün yerine beyaz ve açık gri yüzeyler, indigo vurgu, yuvarlatılmış köşeler, ince sınırlar ve yerel Inter yazı tipi kullanılır.
- Masaüstünde sabit sol menü; üstte genel arama, tema ve veri aktarımı; içerikte set başlığı, yedi çalışma modu, büyük kart ve set ilerlemesi.
- Telefonlarda açılır yan menü, yatay kaydırılabilen mod seçimi, tek sütun kartlar ve kısaltılmış araç alanları.
- Kütüphane, favoriler ve tekrar koleksiyonları işlevsel ayrı görünümlerdir. Global arama terim, anlam ve kaynak çekimlerini bulur; bu sette arama terim listesini süzer.
- Kartta telaffuz ve yıldız, dil yönünü çevirme, karıştırma, önceki/sonraki, ilerleme ve kendini değerlendirme bulunur. Odak modu yardımcı panelleri gizler.
- Okuma notları ayrı bir sekmede kalır; her terimde kaynak biçim ve kullanım notu korunur.

## Uyumluluk ve davranış

- 116 mevcut kart ve kimlikleri değişmedi. Öğrenme geçmişi hâlâ aynı kelime-atolyesi-progress-v1 anahtarında; dışa/içe aktarım şeması version:1.
- Yeni ayarlar ka-preferences-v2 anahtarında saklanır; eski tema anahtarı ka-theme korunur. Ses aksanı/yavaş okuma kart değişiminde sıfırlanmaz.
- Kart ilerlemesi set bazında hatırlanır. Filtrelenmiş alt listelerin konumu ana set konumu olarak yazılmaz.
- Aynı kart aynı turda iki kez puanlanmaz. Eşleştirme zamanlayıcısı ilk seçimde başlar; tamamlanınca veya görünüm değişince durur.
- Yedi mod korunur. Test modunda soru sayısı seçilebilir; Öğren modunda art arda iki doğruya ulaşmış terimler yazılı soruyla sorulabilir.
- Linkedom yalnız geliştirme testlerinde kullanılan devDependency'dir. Kullanıcı arayüzü için npm/Node/Python gerekmez. Python üreticisi klasik JS dosyalarını hazırlar; index.html çift tıklamayla açılır.
- GitHub Pages ve yerel dosya açılışı aynı kaynakları kullanır. Sites hosting veya yeni veri servisi eklenmedi.

## Kontrol sınırı

Gerçek DOM üzerinde sunucu gerektirmeyen testler: ilk açılış, eski kayıtları koruma, set/favori gezintisi, arama, kart yönü, ses ayarları, öğrenme/yazma/dinleme/test, eşleştirme, not sekmeleri, klavye, içe/dışa aktarım. Bunlar ekran yerleşimini ölçmez.

Windows Computer Use, mevcut tarayıcı URL'sini güvenle tespit edemediği için görsel kontrolü durdurdu. Bu engel aşılmadı. Gerçek masaüstü/telefon görünümü ve fiziksel ses kontrolü tamamlanmış sayılmaz.
