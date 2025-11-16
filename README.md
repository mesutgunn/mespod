# MesPOD - Etsy POD Tasarım Otomasyonu

AI destekli Etsy print-on-demand tasarım otomasyonu platformu. Popüler Etsy ürünlerini analiz eder, yapay zeka ile benzer tasarımlar üretir, mockup'lar oluşturur ve SEO optimize edilmiş içerik üretir.

## 🎯 Özellikler

- **Etsy Ürün Analizi**: Popüler Etsy ürünlerinin URL'ini girerek tasarım özelliklerini çıkarın
- **AI Tasarım Üretimi**: Yapay zeka ile benzer tasarımların 4+ varyasyonunu otomatik oluşturun
- **Mockup Oluşturma**: Tasarımlarınızı profesyonel mockup şablonlarına (tshirt, sweatshirt, hoodie) otomatik uygulayın
- **SEO Optimizasyonu**: Etsy için optimize edilmiş başlık, açıklama ve tag'ler üretin
- **Kullanıcı Yönetimi**: JWT tabanlı güvenli authentication sistemi
- **Admin Paneli**: Kullanıcı yönetimi ve sistem durumu takibi

## 🏗️ Mimari

### Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL (Neon veya başka managed service)
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **AI & Image Processing**: n8n webhooks (harici)
- **Deployment**: Netlify

### Mimari Kararlar

Tüm yapay zeka ve görüntü işlemleri **n8n** üzerinde gerçekleştirilir:
- Etsy scraping
- AI tasarım üretimi
- Mockup oluşturma
- SEO içerik üretimi

Next.js backend sadece **proxy** görevi görür:
- Kullanıcıdan veri alır
- n8n webhook'larına POST eder
- Yanıtı frontend'e iletir

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- PostgreSQL database (Neon, Supabase, vb.)
- n8n instance (opsiyonel, dummy data ile de çalışır)

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repo-url>
cd mespod
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**

`.env` dosyası oluşturun (`.env.example`'dan kopyalayın):

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Database - PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"

# Auth - Güvenli bir secret key oluşturun
AUTH_SECRET="super-secret-key-change-this-in-production"

# n8n Webhook URLs (opsiyonel - yoksa dummy data kullanılır)
N8N_ETSY_SCRAPER_WEBHOOK_URL=""
N8N_DESIGN_GENERATE_WEBHOOK_URL=""
N8N_MOCKUP_APPLY_WEBHOOK_URL=""
N8N_SEO_GENERATE_WEBHOOK_URL=""
```

4. **Database migration**

```bash
npx prisma migrate dev --name init
```

Bu komut:
- Prisma schema'yı database'e uygular
- User tablosunu oluşturur
- Prisma Client'ı generate eder

5. **Development server'ı başlatın**

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 🚀 Netlify Deployment

### Hazırlık

1. **GitHub'a push edin**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Netlify'da yeni site oluşturun**
   - Netlify Dashboard → "New site from Git"
   - Repository'nizi seçin
   - Build settings otomatik algılanacaktır (`netlify.toml` sayesinde)

3. **Environment Variables ekleyin**

Netlify Dashboard → Site settings → Environment variables:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key
N8N_ETSY_SCRAPER_WEBHOOK_URL=https://...
N8N_DESIGN_GENERATE_WEBHOOK_URL=https://...
N8N_MOCKUP_APPLY_WEBHOOK_URL=https://...
N8N_SEO_GENERATE_WEBHOOK_URL=https://...
```

4. **Deploy edin**
   - "Deploy site" butonuna tıklayın
   - Build loglarını takip edin
   - Deploy tamamlandığında siteniz yayında olacaktır

### Build Ayarları

`netlify.toml` dosyası build ayarlarını içerir:
- Build command: `npm run build`
- Publish directory: `.next`
- Next.js plugin otomatik yüklenir

## 📁 Proje Yapısı

```
mespod/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── logout/
│   │   └── mespod/          # MesPOD API endpoints (n8n proxies)
│   │       ├── etsy/
│   │       ├── design/
│   │       ├── mockup/
│   │       └── seo/
│   ├── admin/               # Admin dashboard page
│   ├── app/                 # Main application page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── lib/                     # Utility libraries
│   ├── auth/               # Authentication utilities
│   │   ├── jwt.ts          # JWT token handling
│   │   └── getCurrentUser.ts
│   ├── n8n/                # n8n integration
│   │   ├── client.ts       # Generic webhook client
│   │   ├── etsy.ts
│   │   ├── design.ts
│   │   ├── mockup.ts
│   │   └── seo.ts
│   └── prisma.ts           # Prisma client singleton
├── prisma/
│   └── schema.prisma       # Database schema
├── types/
│   └── mespod.ts           # TypeScript type definitions
├── middleware.ts           # Route protection middleware
├── netlify.toml            # Netlify configuration
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🔐 Authentication

### İlk Kullanıcı (Admin)

İlk kayıt olan kullanıcı otomatik olarak **ADMIN** rolü alır. Sonraki kullanıcılar **USER** rolü ile oluşturulur.

### Route Protection

`middleware.ts` dosyası route korumasını sağlar:
- `/app` - Tüm authenticated kullanıcılar
- `/admin` - Sadece ADMIN rolündeki kullanıcılar
- `/`, `/login`, `/register` - Public

### JWT Token

- Cookie name: `mespod_session`
- HttpOnly: true
- Secure: production'da true
- Expiry: 7 gün

## 🔌 n8n Entegrasyonu

### Webhook Yapılandırması

Her n8n workflow'u için bir webhook URL'i gereklidir:

1. **Etsy Scraper Webhook**
   - Input: `{ url: string }`
   - Output: `{ title, description, tags[], imageUrls[] }`

2. **Design Generation Webhook**
   - Input: `{ baseImageUrl: string, stylePrompt?: string }`
   - Output: `{ variants: [{ id, imageUrl, prompt }] }`

3. **Mockup Webhook**
   - Input: `{ designImageUrl: string, mockupTemplateId: string }`
   - Output: `{ mockupImageUrl: string }`

4. **SEO Webhook**
   - Input: `{ baseTitle, baseDescription, baseTags[], mockupImageUrl }`
   - Output: `{ title, description, tags[] }`

### Dummy Data

n8n webhook URL'leri yapılandırılmadığında, sistem otomatik olarak dummy data kullanır. Bu sayede geliştirme ve test sırasında n8n olmadan çalışabilirsiniz.

## 🗄️ Database Schema

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

## 🎨 UI/UX

### Sayfalar

1. **Landing Page** (`/`)
   - Özellikler tanıtımı
   - Login/Register butonları
   - Authenticated kullanıcılar için "Panoya Git" butonu

2. **Login** (`/login`)
   - Email/Password form
   - Role-based redirect (ADMIN → `/admin`, USER → `/app`)

3. **Register** (`/register`)
   - Email/Password/Name form
   - Otomatik login ve redirect

4. **App** (`/app`)
   - Etsy URL input
   - 3-step progress indicator
   - Design variant grid
   - Mockup template selection
   - SEO content display with copy buttons

5. **Admin** (`/admin`)
   - User statistics
   - User list table
   - System status
   - n8n configuration info

## 🛠️ Development

### Komutlar

```bash
# Development server
npm run dev

# Build
npm run build

# Start production server
npm start

# Prisma commands
npx prisma studio          # Database GUI
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate Prisma Client
```

### TypeScript

Strict mode aktif. Tüm API request/response'lar için type definitions `types/mespod.ts` içinde tanımlı.

### Linting

Next.js built-in ESLint kullanılır:
```bash
npm run lint
```

## 🔒 Güvenlik

- Şifreler bcrypt ile hash'lenir (10 rounds)
- JWT token'lar httpOnly cookie'lerde saklanır
- CSRF koruması Next.js tarafından sağlanır
- Environment variables production'da güvenli şekilde saklanmalıdır
- Database connection SSL ile yapılmalıdır

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış

### MesPOD

- `POST /api/mespod/etsy` - Etsy ürün analizi
- `POST /api/mespod/design` - Tasarım varyantları üretimi
- `POST /api/mespod/mockup` - Mockup oluşturma
- `POST /api/mespod/seo` - SEO içerik üretimi

## 🐛 Troubleshooting

### Database Connection Hatası

```bash
# DATABASE_URL'i kontrol edin
echo $DATABASE_URL

# Prisma Client'ı yeniden generate edin
npx prisma generate
```

### Build Hatası

```bash
# node_modules ve .next'i temizleyin
rm -rf node_modules .next
npm install
npm run build
```

### n8n Webhook Hatası

n8n webhook'ları yapılandırılmadığında dummy data kullanılır. Production'da mutlaka gerçek webhook URL'leri ekleyin.

## 📄 Lisans

MIT

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

**MesPOD** - Etsy POD işinizi otomatikleştirin! 🚀
