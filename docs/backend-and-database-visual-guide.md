# 📊 VESPER BODY — Görsel Backend, Veritabanı ve Stok Mimarisi Rehberi

Bu rehber; **kullanıcı hesaplarının (`users`)**, **ürün ve beden stoklarının (`products` & `variants`)**, **siparişlerin (`orders`)** ve **medya dosyalarının (`images` & `videos`)** arka planda nasıl tutulduğunu görsel diyagramlarla anlatır.

## 1. Sistem Mimarisi (3 Katmanlı Akış)

```mermaid
flowchart LR
    subgraph Client["🖥️ 1. TARAYICI (Frontend - Next.js Client)"]
        UI["Mağaza Vitrini (/)\nÖdeme (/odeme)\nÜye Girişi (/hesabim)\nAdmin Paneli (/admin)"]
        CTX["StoreContext.tsx\n(Anlık State + localStorage Yedeği)"]
    end

    subgraph Server["⚙️ 2. BACKEND API KATMANI (Next.js Route Handlers)"]
        API_STORE["/api/store\n(GET & POST İşlemleri)"]
        API_UPLOAD["/api/upload\n(Çoklu Fotoğraf & Video Yükleme)"]
    end

    subgraph Storage["🗄️ 3. VERİTABANI & DOSYA SİSTEMİ (Disk / Cloud)"]
        DB[("src/data/database.json\n• products (17 Ürün & Stok)\n• orders (Siparişler)\n• users (Üyeler & Admin)")]
        MEDIA[("public/images & videos\n• 58 Ürün Fotoğrafı\n• 3 HD Video Loop\n• 1 Marka Logosu")]
    end

    UI <-->|"Kullanıcı Tıklaması"| CTX
    CTX <-->|"JSON HTTP İstekleri (fetch)"| API_STORE
    UI -->|"FormData (Dosya Seçimi)"| API_UPLOAD
    API_STORE <-->|"Okuma / Yazma"| DB
    API_UPLOAD -->|"Kaydetme"| MEDIA
```

## 2. Veritabanı Tabloları (`src/data/database.json`)

- **`products` Tablosu:** 17 ürünün tüm başlık, fiyat, kategori, `media` (fotoğraf/video yolları) ve `variants` (`XS`, `S`, `M`, `L`, `XL` beden stokları ve SKU kodları) verilerini tutar.
- **`orders` Tablosu:** Müşterilerin üyeliksiz veya üyeli verdiği tüm siparişleri, gizli kargo onayını, ödeme yöntemini ve kargo durumunu (`paid`, `preparing`, `shipped_discreet`, `delivered`, `cancelled`) tutar.
- **`users` Tablosu:** Kayıt olan müşterilerin (`fullName`, `email`, `phone`, `password`) ve mağaza yöneticisinin (`isAdmin: true`) hesap bilgilerini tutar.

