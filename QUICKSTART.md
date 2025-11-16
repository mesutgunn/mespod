# MesPOD - Hızlı Başlangıç Kılavuzu

Bu kılavuz, MesPOD'u 5 dakikada çalıştırmanız için gereken minimum adımları içerir.

## 🚀 Hızlı Kurulum (5 Dakika)

### 1. Bağımlılıkları Yükleyin

```bash
cd mespod
npm install
```

### 2. Database Hazırlayın

**Seçenek A: Neon (Önerilen - Ücretsiz)**

1. https://neon.tech adresine gidin
2. Ücretsiz hesap oluşturun
3. Yeni bir PostgreSQL database oluşturun
4. Connection string'i kopyalayın

**Seçenek B: Lokal PostgreSQL**

```bash
# PostgreSQL yüklü olmalı
createdb mespod
```

### 3. Environment Variables

`.env` dosyası oluşturun:

```bash
# Neon kullanıyorsanız
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Lokal PostgreSQL kullanıyorsanız
DATABASE_URL="postgresql://localhost:5432/mespod"

# Güvenli bir secret key (herhangi bir random string)
AUTH_SECRET="mespod-secret-key-2024"

# n8n webhook'ları (şimdilik boş bırakabilirsiniz - dummy data kullanılır)
N8N_ETSY_SCRAPER_WEBHOOK_URL=""
N8N_DESIGN_GENERATE_WEBHOOK_URL=""
N8N_MOCKUP_APPLY_WEBHOOK_URL=""
N8N_SEO_GENERATE_WEBHOOK_URL=""
```

### 4. Database Migration

```bash
npx prisma migrate dev --name init
```

### 5. Başlatın!

```bash
npm run dev
```

🎉 **Tebrikler!** Uygulama http://localhost:3000 adresinde çalışıyor.

## 📝 İlk Adımlar

### 1. İlk Kullanıcı (Admin) Oluşturun

1. http://localhost:3000 adresine gidin
2. "Kayıt Ol" butonuna tıklayın
3. Email ve şifre girin
4. İlk kullanıcı otomatik olarak **ADMIN** olur

### 2. Uygulamayı Test Edin

1. Login olduktan sonra `/app` sayfasına yönlendirileceksiniz
2. Herhangi bir Etsy URL'i girin (örnek: `https://www.etsy.com/listing/123456789/...`)
3. "Analiz Et" butonuna tıklayın
4. Sistem dummy data ile çalışacaktır (n8n webhook'ları yapılandırılmadığı için)

### 3. Admin Panelini Görün

1. Header'daki kullanıcı menüsünden "Admin" seçeneğine tıklayın
2. Veya direkt `/admin` adresine gidin
3. Kullanıcı listesini ve sistem durumunu görün

## 🔧 n8n Entegrasyonu (Opsiyonel)

n8n webhook'larını yapılandırmak için:

1. n8n instance'ınızı hazırlayın (https://n8n.io)
2. Her workflow için webhook URL'i oluşturun
3. `.env` dosyasına ekleyin
4. Sunucuyu yeniden başlatın

**Not:** n8n olmadan da uygulama çalışır, sadece dummy data kullanır.

## 📦 Production'a Deploy

### Netlify (Önerilen)

1. GitHub'a push edin:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. Netlify'da:
   - "New site from Git" → Repository'nizi seçin
   - Environment variables ekleyin (DATABASE_URL, AUTH_SECRET, vb.)
   - Deploy edin

3. Database migration:
```bash
# Netlify CLI ile
netlify env:import .env
netlify build
```

## 🆘 Sorun Giderme

### "Cannot connect to database"

- `DATABASE_URL` doğru mu kontrol edin
- Database erişilebilir mi test edin
- SSL mode gerekiyorsa `?sslmode=require` ekleyin

### "Module not found" hatası

```bash
rm -rf node_modules package-lock.json
npm install
```

### Prisma hatası

```bash
npx prisma generate
npx prisma migrate reset
```

### Port zaten kullanımda

```bash
# Farklı port kullanın
PORT=3001 npm run dev
```

## 📚 Daha Fazla Bilgi

- Detaylı dokümantasyon: `README.md`
- API endpoint'leri: `README.md` → API Endpoints
- Database schema: `prisma/schema.prisma`
- Type definitions: `types/mespod.ts`

## 💡 İpuçları

1. **Development**: `npm run dev` ile hot-reload aktif
2. **Database GUI**: `npx prisma studio` ile database'i görsel olarak yönetin
3. **Type Safety**: TypeScript strict mode aktif, tüm tipler tanımlı
4. **Dummy Data**: n8n olmadan test için dummy data otomatik kullanılır
5. **First User**: İlk kayıt olan kullanıcı ADMIN olur

## 🎯 Sonraki Adımlar

- [ ] n8n workflow'larını oluşturun
- [ ] Webhook URL'lerini yapılandırın
- [ ] Production database hazırlayın
- [ ] Netlify'a deploy edin
- [ ] Custom domain ekleyin

---

**Başarılar!** 🚀

Sorularınız için GitHub Issues kullanabilirsiniz.
