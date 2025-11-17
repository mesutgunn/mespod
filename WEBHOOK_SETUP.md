# Webhook Entegrasyonu - Kurulum Rehberi

## Genel Bakış

MesPOD projesi artık webhook üzerinden Etsy ürün verilerini alabilir ve görüntüleyebilir.

## Webhook URL

```
POST /api/webhook
```

## Kullanım

### 1. Environment Variable Ayarı

`.env` dosyanıza aşağıdaki değişkeni ekleyin:

```env
ETSY_SCRAPER_WEBHOOK_URL=https://33crrooo.rpcld.app/webhook/MesPODScraper
```

### 2. Webhook Request Format

Panelden webhook'a gönderilecek istek formatı:

```json
{
  "direct_urls": [
    "https://www.etsy.com/listing/1710567856/its-okay-to-make-some-mistakes-shirt"
  ]
}
```

### 3. Webhook Response Format

Webhook'tan dönen yanıt formatı (örnek):

```json
{
  "product_id": "1710567856",
  "shop_id": "35055979",
  "shop_url": "https://www.etsy.com/shop/TrendyGiftShopUS",
  "shop_sales": "75.1k sales",
  "shop_name": "TrendyGiftShopUS",
  "product_url": "https://www.etsy.com/listing/1710567856/its-okay-to-make-some-mistakes-shirt",
  "image": "https://i.etsystatic.com/35055979/r/il/cfd7dd/5962184626/il_794xN.5962184626_auti.jpg",
  "images": ["..."],
  "max_quantity": 552,
  "variants": [],
  "title": "It's Okay To Make Some Mistakes Shirt...",
  "description": ["..."],
  "delivery_days_min": 9,
  "delivery_days_max": 23,
  "shop_reviews": 17016,
  "reviews": 122,
  "star": "4.8",
  "highlights_tags": ["Love it", "Fast shipping", "..."],
  "reviews_tags": [
    {
      "tag": "Quality",
      "frequency": 31
    }
  ],
  "years_on_etsy": "3 years",
  "has_ratings_badge": true,
  "has_convos_badge": false,
  "has_shipping_badge": true,
  "reviews_scores": {
    "item_quality": "5/5",
    "shipping": "5/5",
    "customer_service": "5/5"
  },
  "category": "Clothing < Gender-Neutral Adult Clothing < Tops & Tees < T-shirts",
  "price": "",
  "low_price": "9.60",
  "high_price": "32.01",
  "country_shipping_from": "US",
  "currency": "EUR"
}
```

## Özellikler

### 1. Otomatik Proje Oluşturma

- Webhook'tan gelen veriler otomatik olarak veritabanına kaydedilir
- Eğer aynı URL için proje varsa, güncellenir
- Yoksa yeni proje oluşturulur (admin kullanıcısına atanır)

### 2. Ürün Detayları Görüntüleme

Kullanıcı panelinde:

1. **Yeni Proje** sekmesinden Etsy URL'i girin
2. Sistem webhook'u çağırır ve ürün verilerini alır
3. **Projelerim** sekmesinde proje kartını görebilirsiniz
4. **Görüntüle** butonuna tıklayarak detaylı bilgileri görün

### 3. Görüntülenen Bilgiler

Modal pencerede şunlar gösterilir:

- ✅ Ürün görselleri (galeri)
- ✅ Ürün bilgileri (başlık, ID, kategori, fiyat, stok, teslimat)
- ✅ Değerlendirmeler (yıldız, yorum sayısı, puanlar)
- ✅ Mağaza bilgileri (isim, satış, yorum, süre)
- ✅ Rozetler (yüksek puan, hızlı kargo, iyi iletişim)
- ✅ Öne çıkan özellikler (highlight tags)
- ✅ Ürün açıklaması
- ✅ Yorum etiketleri (quality, comfort, appearance, vb.)

## Test Etme

### Manuel Test

1. Uygulamayı başlatın:
```bash
npm run dev
```

2. `/app` sayfasına gidin ve giriş yapın

3. **Yeni Proje** sekmesine gidin

4. Etsy URL'ini girin:
```
https://www.etsy.com/listing/1710567856/its-okay-to-make-some-mistakes-shirt
```

5. **Projeyi Başlat** butonuna tıklayın

6. **Projelerim** sekmesinde projeyi görün

7. **Görüntüle** butonuna tıklayarak detayları inceleyin

### API Test (Postman/cURL)

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "direct_urls": [
      "https://www.etsy.com/listing/1710567856/its-okay-to-make-some-mistakes-shirt"
    ]
  }'
```

## Netlify Deployment

Netlify'da environment variable'ı ekleyin:

1. Netlify Dashboard → Site Settings → Environment Variables
2. Key: `ETSY_SCRAPER_WEBHOOK_URL`
3. Value: `https://33crrooo.rpcld.app/webhook/MesPODScraper`
4. Redeploy

## Veritabanı Şeması

Yeni eklenen alanlar:

```prisma
model Project {
  // ... mevcut alanlar
  
  // Etsy Scraper Data
  productId           String?
  shopId              String?
  shopUrl             String?
  shopSales           String?
  shopName            String?
  searchPosition      String?
  image               String?
  images              String[]
  maxQuantity         Int?
  variants            Json?
  description         String[]
  deliveryDaysMin     Int?
  deliveryDaysMax     Int?
  shopReviews         Int?
  reviews             Int?
  star                String?
  highlightsTags      String[]
  reviewsTags         Json?
  yearsOnEtsy         String?
  hasRatingsBadge     Boolean?
  hasConvosBadge      Boolean?
  hasShippingBadge    Boolean?
  reviewsScores       Json?
  category            String?
  price               String?
  lowPrice            String?
  highPrice           String?
  countryShippingFrom String?
  currency            String?
  oldPrice            String?
  moreLikeUrl         String?
}
```

## Sorun Giderme

### Webhook Hatası

Eğer webhook çalışmıyorsa:

1. Environment variable'ın doğru ayarlandığından emin olun
2. Webhook URL'inin erişilebilir olduğunu kontrol edin
3. Console loglarını inceleyin

### Proje Oluşturulamıyor

Eğer proje oluşturulamıyorsa:

1. Veritabanında en az bir ADMIN kullanıcısı olmalı
2. Migration'ın çalıştırıldığından emin olun:
```bash
npx prisma migrate deploy
```

### Görsel Yüklenmiyor

Etsy görselleri harici URL'lerden gelir. CORS politikası nedeniyle bazı görseller yüklenmeyebilir.

## Gelecek Geliştirmeler

- [ ] Toplu URL import
- [ ] Ürün karşılaştırma
- [ ] Fiyat takibi
- [ ] Stok uyarıları
- [ ] Otomatik tasarım önerileri
