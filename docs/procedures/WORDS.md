# Kelime ekleme prosedürü
Sohbet veya AI özeti geldiyse önce IMPORTING_CHAT_LOGS.md prosedürünü uygula. Kaynak biçimler, özgün cümleler, düzeltme türü ve belirsizlikler korunmalıdır. Kullanım/gramer notları siteye studyNotes ve notes alanlarıyla yansıtılabilir.
1. Kullanıcının gönderdiği listeyi data/inbox/YYYY-MM-DD-konu.txt altında değiştirmeden sakla. Çalışılmış kişisel kelimeleri uydurma.
2. data/catalog.json ve mevcut setleri oku; tekrarları ve aynı sözcüğün farklı anlamlarını kontrol et.
3. data/schemas/word-set.schema.json biçimine göre set oluştur. Kimlikler küçük ASCII harf, rakam ve tire; tüm setlerde kelime kimlikleri benzersiz olmalı.
4. Anlam, IPA, kelime türü ve örnekleri kontrol et. Sözlük kaynağını sources listesine URL olarak ekle. Kaynak yoksa verification: unverified; teyit edilirse verified. Örnek/demo verisi illustrative.
5. Her kelimede term, meaning, ipa, pronunciationTr, partOfSpeech, level, examples, acceptedAnswers, tags ve verification bulunmalı. Belirsiz IPA/okunuşu boş bırakmak uydurmaktan iyidir; seviye belirsizse unknown.
6. acceptedAnswers yalnız doğru İngilizce eşdeğer yazımları içerir; Türkçe cevap veya yanlış yazım ekleme. Örneklerde en/tr çiftini doldur.
7. catalog.json içine set yolunu kaydet; ardından py -3 tools/validate_data.py çalıştır.
8. Arayüzde kelime ve telaffuzu kontrol et. Ham girdiye, yeni kayda ve varsa kaynaklara STATUS/CHANGELOG içinde atıf yap.
Mevcut ID'yi yeniden kullanma veya silip yeni ID verme: çalışma geçmişi kaybolur.

## Doğrudan HTML açılışı — 2026-10-28
index.html çift tıklamayla açılmalıdır; çalıştırma için CMD/sunucu zorunlu değildir. JSON veya JS değişikliğinden sonra py -3 tools/build_local.py çalıştır. data/generated/sets.js ve site/js/app.bundle.js üretilen dosyalardır; elle düzenleme, kaynaklarla birlikte commit et. Yerel testte file:// açılışını da kontrol et.
