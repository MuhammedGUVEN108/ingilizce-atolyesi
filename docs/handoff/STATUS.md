# Güncel durum
2026-10-29 — GitHub deposu ve Pages yayını.

- Merkez: C:/Users/Muhammed/Desktop/ingilizce sitesi.
- Repo: https://github.com/MuhammedGUVEN108/ingilizce-atolyesi (herkese açık).
- Remote: origin; ana dal main. Kullanıcı repo oluşturma ve projeyi yüklemeyi açıkça istedi.
- Pages adresi: https://muhammedguven108.github.io/ingilizce-atolyesi/ ; GitHub Actions workflow ile dağıtılır. Dağıtım sonucu Actions ekranından doğrulanmalı.
- İlk kişisel veri: Oliver Twist, 70 kelime + 38 kalıp; 22 gramer ve 19 cümle notu. Sekiz kelimelik demo ayrıdır.
- Yedi çalışma modu, telaffuz, favoriler, arama, tema, basit aralıklı tekrar ve ilerleme dışa/içe aktarımı mevcut.
- index.html çift tıklamayla açılır; kullanıcı için CMD/sunucu gerekmez. Veri/kod değişikliğinde tools/build_local.py çalıştırılır.
- JSON ana kaynaktır; data/generated/sets.js ve site/js/app.bundle.js çıktıları kaynaklarla birlikte commit edilir.
- Ham sohbet data/inbox/ altında yerelde korunur ve Git'e dahil edilmez. Yerel yardımcılar .preview/ altında Git'ten hariçtir.
- Doğrulama: üç set/116 toplam kart, sekiz Node testi ve JS sözdizimi geçti. Gerçek tarayıcı/telefon görünümü ve ses kontrolü henüz yapılmadı.
- İlerleme tarayıcı içinde; otomatik cihaz eşitlemesi yok. AI/sınıf/çok oyunculu özellikler mevcut sürümde yok.
- Foryos/Convet ve bozuk cümleler, kitap bağlamı gelmeden kesinleştirilmez; docs/analysis/oliver-twist.md ve data/analysis/oliver-twist/ kaynak izlerini korur.
- Ortak başlangıç AGENTS.md; veri temizliği docs/procedures/IMPORTING_CHAT_LOGS.md.

Sonraki adım: kullanıcı geri bildirimi, yeni kelimeler ve gerekirse belirsiz ifadelerin kitap bağlamıyla düzeltilmesi.
