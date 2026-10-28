# Oliver Twist — İlk veri temizliği ve analiz

28 Ekim 2026. Kaynak: `C:/Users/Muhammed/Desktop/oliver twist.txt`.

## Sonuç

| İçerik | Temiz kayıt |
| --- | ---: |
| Kelime | 70 |
| Çok sözcüklü ifade / kalıp | 38 |
| Gramer açıklaması | 22 |
| Cümle bağlamı | 19 |
| Düzeltme ve inceleme başlığı | 13 |

70 + 38 kayıt gerçek çalışma setlerine eklendi. Gramer ve cümle notları bu iki setin altında açılabilir. Örnek set ayrı tutuldu; kullanıcının kişisel verisi olarak sayılmadı. Çok sözcüklü isimler de (mess tin, walking stick gibi) kullanım kolaylığı için kalıp grubundadır; hepsi phrasal verb değildir.

## Kaynak ne kadar güvenilir?

Dosya ham kitap sayfaları veya eksiksiz sohbet dökümü değil, birkaç sohbetin AI tarafından hazırlanmış özetlerinin birleştirilmiş hâlidir. Özetler kullanıcı cümlesi, açıklayıcı örnek ve sonradan türetilmiş ek kelimeyi karıştırabiliyor. Kayıtları kesin kitap alıntısı veya kullanıcının bizzat sorduğu kelimeler olarak etiketlemedik. Dosyadan kullanıcının seviyesine ilişkin sonuç çıkarılmadı.

Özgün dosyanın 27.002 baytlık kopyası `data/inbox/2026-10-28-oliver-twist.txt` altında saklandı. SHA-256:

`8eeb037873e1c65da0aee4bc72036a16fca2cfcd5c7fad42d9ea4740f5e72493`

135 içerik tablo satırının tamamı sınıflandırıldı: 118 çalışma kartı kanıt satırı (bunların 4'ü yalnız örnek cümle tablosundan), 10 gramer satırı, 5 cümle satırı ve 2 belirsiz yazım. Diğer cümleler tablo dışındaki metinden de alındı. 114 kelime/kalıp satırı 108 başlığa indirildi; örnek tablosunun 4 satırı yeni kelime sayılmadı. Satır envanteri ve her kartın kaynak satırları makine tarafından okunabilir dosyalarda korunuyor.

## Temizleme kararları

- Tekrarlar: conversely, collapsed/collapse, narrow ve otherwise tekrarları birleştirildi. Coffin/coffins ve grasp/grasped aynı başlıkta toplandı.
- Çekimler: bleeding → bleed; taught → teach; kidnapped → kidnap; bent → bend; embraced → embrace; dragged → drag; rang → ring; compelled → compel; squeezing → squeeze; panted → pant. Kaynak biçimleri silinmedi, kartın kullanım notlarında gösteriliyor.
- Geese, çoğul biçimin kendisi öğrenme hedefi olduğundan korundu; goose doğru cevap yerine kabul edilmedi.
- Karşılaştırmalar: accept/except ayrı; ring fiili ile yüzük ismi ve shot ismi ile shoot çekimi karıştırılmadı. Mug ve permit için kartın hangi anlamı sorduğu daraltıldı.
- Cümle düzeltmeleri, özgün kaydın yerine geçirilmedi. `original`, `studyVersion` ve düzeltmenin türü ayrı alanlarda saklandı.
- Kartlardaki örnekler bu çalışma için oluşturuldu ve Türkçeye çevrildi. Kaynak özetin örnekleri ayrıca kanıt kayıtlarında korundu; kitap alıntısı olarak sunulmadı.
- CEFR seviyeleri sözlük bazında kontrol edilmediği için `unknown` bırakıldı. Kaynakla kontrol edilen birkaç IPA dışındaki IPA ve Türkçe yaklaşık okunuş alanları uydurulmadı; cihazın sesli telaffuz özelliği kullanılabilir.

## Önemli düzeltmeler

| Kayıt | Karar |
| --- | --- |
| Foryos | Furious olduğu varsayılmadı; kartlara eklenmedi. |
| Convet | Convert/convict/convent arasında seçim yapılmadı; kartlara eklenmedi. |
| House they finished… | House → how sessizce düzeltilmedi; kitap bağlamı gerekli. |
| Rose … longig lasting step | Metin bozuk. Önceki before önerisi kesin kitap metni kabul edilmedi. |
| The policeman involved Oliver… | Involve sürüklemek değildir. Dragged ancak öğretici bir alternatif. |
| He was shut. | Açık bir hapsedilme cümlesi için bağlam eksik; in a room ilavesi kaynak metin değildir. |
| admitted Oliver's working | Bir şeyi yaptığını kabul etmek ile çalışmasına izin vermeyi kabul etmek ayrıldı. |
| hanged handkerchiefs | Eşya asma bağlamında standart hung; hanging de durum bildiren doğal alternatif. |
| dragged | Tek başına zorunlu edilgen değil; was dragged ile sürüklendi denir. |
| chaunt | Chant'in tarihî yazımı; yanlış sözcük diye atılmadı. |
| whom | Nesne zamiri; tek bir Türkçe ekle açıklanmadı. |
| the olds / he young | Topluluk yapısı the old / the young; kaynak ile düzeltme ayrı tutuldu. |
| Başlıklardaki sayılar | 13 denip 14 satır ve 4 denip 5 cümle gibi tutarsızlıklar yeniden sayıldı. |

Seçili kullanım kontrolleri: [Cambridge — admit](https://dictionary.cambridge.org/us/dictionary/english/admit), [drag](https://dictionary.cambridge.org/dictionary/english/drag), [who/whom](https://dictionary.cambridge.org/us/grammar/british-grammar/who-whom), [enterprise](https://dictionary.cambridge.org/dictionary/english/enterprise), [Merriam-Webster — hung/hanged](https://www.merriam-webster.com/grammar/hung-or-hanged), [chaunt](https://www.merriam-webster.com/dictionary/chaunt). Bunlar bütün kartların tüm alanlarının sözlükten doğrulandığı anlamına gelmez.

## Çalışma açısından içerik

Verideki başlıca çalışma alanları: geçmiş zaman/üçüncü fiil biçimleri; etken–edilgen ayrımı; if, what ve whom ile kurulan cümlecikler; ardından to veya -ing gelen fiil kalıpları; çok anlamlı ve benzer yazılan sözcükler. Bunlar bu dosyanın içerik özellikleridir; kalıcı bir öğrenme profili çıkarımı değildir.

Önerilen sıra: kelimeleri küçük gruplarda çalış; ardından kalıplar setine geç; cümle ve gramer notlarını ihtiyaç oldukça aç. Foryos/Convet ile bozuk cümleler için kitaptaki tam cümle veya sayfa görüldüğünde inceleme kayıtları güncellenebilir.

## Dosyalar

- `data/sets/oliver-twist-words.json`: 70 kelime.
- `data/sets/oliver-twist-phrases.json`: 38 kalıp.
- `data/analysis/oliver-twist/curated.json`: temizleme girdisi.
- `grammar.json`, `sentences.json`, `review.json`: açıklamalar, özgün/düzeltilmiş cümleler ve belirsizlikler.
- `source-rows.json`, `source-evidence.json`, `manifest.json`: satır kapsamı, kaynak bağları ve sayımlar.
- `tools/import_oliver.py`: bu veri kümesine özel tekrar üretim aracı. Çıktı setinde elle değişiklik yapılmışsa incelemeden tekrar çalıştırma.

Veri kontrolü, sekiz Node testi ve derlenmiş klasik betik sözdizimi kontrolü geçti. Açılış testi yeni ilk Oliver Twist kartını, kart çevirmeyi ve ilerleme kaydını DOM benzetimiyle doğruladı. Gerçek tarayıcı, telefon görünümü ve sesli okuma testi yapılmadı.
