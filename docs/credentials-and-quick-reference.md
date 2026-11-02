# 🔑 VESPER BODY — Giriş Bilgileri, Hesaplar & Hızlı Referans Kılavuzu

Bu belge, **VESPER BODY** platformundaki hazır yönetici (admin), test müşterisi hesapları ve sisteme dair kritik erişim bilgilerini içerir.

---

## 1. Hazır Giriş Bilgileri (Giriş Ekranı & Admin Paneli)

### 👑 1. Yönetici (Admin) Hesabı
Tüm mağaza yönetimi, ürün ekleme/çıkarma, fotoğraf/video yükleme, fiyat değiştirme, beden stokları güncelleme ve gizli kargo fişi yazdırma yetkisine sahiptir.

- **E-Posta:** `admin@vesperbody.com`
- **Şifre:** `vesper2026` *(Alternatif acil durum şifresi: `admin123`)*
- **Erişim Adresleri:**
  - Giriş Sayfası: [http://localhost:3000/hesabim](http://localhost:3000/hesabim) *(Giriş yaptıktan sonra üst menüde "Yönetici Paneli" butonu açılır)*
  - Doğrudan Admin Paneli: [http://localhost:3000/admin](http://localhost:3000/admin)

---

### 🛍️ 2. Hazır Müşteri (Üye) Test Hesabı
Sipariş geçmişi bulunan, teslimat adresi tanımlı normal müşteri hesabıdır.

- **E-Posta:** `ece.demir@example.com`
- **Şifre:** `123456`
- **Ad Soyad:** Ece Demir
- **Telefon:** `0544 219 30 11`
- **Tanımlı Sipariş No:** `#VSP-84915` (Sipariş Durumu: *Gizli Kargoya Verildi*)
- **Erişim Adresi:** [http://localhost:3000/hesabim](http://localhost:3000/hesabim)

---

### ⚡ 3. Üyeliksiz (Guest) Alışveriş
Müşterilerin sisteme kayıt olmadan veya şifre girmeden sipariş verebildiği akıştır.

- Sipariş vermek için üyelik **zorunlu değildir**. Sepete ürün ekleyip `/odeme` sayfasında doğrudan sipariş oluşturulabilir.
- Üyeliksiz siparişleri sorgulamak için Sipariş Takip sayfası: [http://localhost:3000/siparis-takip](http://localhost:3000/siparis-takip)
- Örnek Hazır Üyeliksiz Sipariş: `#VSP-84920` (Müşteri: Selin Kaya - *Hazırlanıyor*)

---

## 2. Sistem ve Dağıtım Bilgileri

| Servis / Alan | Değer / Açıklama |
| :--- | :--- |
| **Marka Adı** | **VESPER BODY** (Lingerie & Boudoir) |
| **Lokal Geliştirme Portu** | `http://localhost:3000` |
| **Kalıcı Veritabanı Dosyası** | `src/data/database.json` |
| **GitHub Kullanıcı / Repo** | `https://github.com/sahanoi/vesper-body.git` |
| **Ücretsiz Kargo Limiti** | 1.500 TL |
| **Standart Kargo Ücreti** | 89 TL |
| **Ödeme Simülasyonu** | iyzico & PayTR (3D Secure + Taksit Seçenekleri) |

---

## 3. GitHub & Vercel Dağıtım Komutları (Tekrarlama İçin)

GitHub reposu oluşturulduktan sonra bilgisayarınızdan projeyi göndermek için:
```powershell
git push -u origin main
```
Vercel üzerine bağlandığında site otomatik olarak derlenip canlı test linki oluşturulacaktır.

