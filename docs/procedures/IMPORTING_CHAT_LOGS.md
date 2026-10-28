# Sohbet özetinden çalışma verisi hazırlama

1. Ham dosyayı değiştirme. data/inbox/ altında bayt düzeyinde kopyasını sakla ve SHA-256 eşleşmesini doğrula.
2. Kaynağın türünü belirle: kitap metni, ham sohbet veya AI özeti. AI özetindeki alıntıları kitabın doğrulanmış metni sayma.
3. Tüm kelime/kalıp satırlarını envantere al; her satırı çalışma kaydı, gramer notu, örnek kanıtı veya inceleme olarak sınıflandır. Atlanan satır kalmadığını kontrol et.
4. Tekrarları ve çekimli biçimleri birleştirirken sourceForms ve satır referanslarını koru. Öğrenme hedefi çekimli/çoğul biçimin kendisiyse otomatik köke indirgeme.
5. Bir sözcüğün farklı anlamlarını soru sormayı belirsizleştirecek şekilde birleştirme. Kupa ile gasp etmek aynı sözcüğün farklı kullanımlarıdır.
6. Bozuk yazımı tahminle kesinleştirme. İnceleme listesine adayları ve eksik bağlamı yaz; belirsiz ifadeyi doğru cevap yapma.
7. Özgün cümle, önerilen düzeltme, çeviri ve düzeltmenin türünü ayrı alanlarda sakla. Öğretici örneği kitaptan alıntı diye sunma.
8. Doğrulanan alanları ve kaynaklarını belirt; bir kullanım notu kontrol edildi diye tüm kartı verified yapma. Belirsiz IPA ve seviyeyi uydurma.
9. Kullanıcıya okunabilir kısa analiz raporu ve makine tarafından okunabilir kayıtlar üret. Açıklamaların sitedeki kullanım notlarına yansımasını sağla.
10. Veri kontrolünü, tools/build_local.py üretimini ve Node testlerini çalıştır. Doğrudan index.html açılışı korunmalı.

Oliver Twist örneği: docs/analysis/oliver-twist.md. Onun importer'ını başka dosyada körlemesine kullanma; satır kuralları ve eşlemeler veri kümesine özeldir. Ham girdiler .gitignore ile Git'ten hariçtir; paylaşım/yayın öncesi izlenen dosyaları ayrıca kontrol et.
