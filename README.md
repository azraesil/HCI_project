# 🌐 Nexus — Kurumsal BT Hizmet Yönetimi (Enterprise ITSM)

> **HCI (İnsan-Bilgisayar Etkileşimi) Projesi**  
> Çok kiracılı (multi-tenant), SLA güdümlü, rol tabanlı erişim kontrolüne (RBAC) ve yüksek erişilebilirlik standartlarına sahip modern bir IT Service Management (ITSM) web platformu.

---

## 📋 İçindekiler
- [Proje Hakkında](#-proje-hakkında)
- [HCI ve Erişilebilirlik Yaklaşımı](#-hci-ve-erişilebilirlik-yaklaşımı)
- [Temel Özellikler](#-temel-özellikler)
- [Kullanıcı Rolleri ve Deneyimi (RBAC)](#-kullanıcı-rolleri-ve-deneyimi-rbac)
- [SLA (Hizmet Seviyesi Taahhüdü) Yönetimi](#-sla-hizmet-seviyesi-taahhüdü-yönetimi)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Proje Dizin Yapısı](#-proje-dizin-yapısı)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Demo Hesapları](#-demo-hesapları)

---

## 💡 Proje Hakkında

**Nexus**, kurumsal ölçekteki şirketlerin yazılım destek, bakım ve olay yönetim süreçlerini şeffaf, hızlı ve hatasız bir şekilde yürütmelerini sağlamak amacıyla geliştirilmiş bir **Kurumsal BT Hizmet Yönetim Platformudur**. 

Sistem; müşterilerden gelen çağrıların (ticket) önceliklendirilmesi, geliştirici ekiplere atanması, SLA sürelerinin gerçek zamanlı izlenmesi ve ayrıntılı analitik raporların sunulması süreçlerini tek bir çatı altında toplar.

---

## ♿ HCI ve Erişilebilirlik Yaklaşımı

Bu proje, **İnsan-Bilgisayar Etkileşimi (HCI)** prensipleri ve **WCAG 2.1 (Web Content Accessibility Guidelines)** standartları gözetilerek tasarlanmıştır:

1. **Bilişsel Yükün Azaltılması (Cognitive Load Reduction):**
   - Karmaşık ITSM veri yoğunluğu, rol bazlı filtrelenmiş görünümler ile sadeleştirilmiştir.
   - Durumlar (Open, In Progress, In Review, Resolved) ve öncelikler (Critical, High, Medium, Low) sezgisel renk kodlarıyla standartlaştırılmıştır.
   - Kritik SLA süreleri için anlık renk ve durum uyarıları ("At Risk", "Overdue") sunulur.

2. **Erişilebilirlik Tercihleri Paneli (`/settings`):**
   - 🔠 **Dinamik Metin Ölçekleme:** Varsayılan (%100), Büyük (%112.5) ve Ekstra Büyük (%125) yazı boyutları.
   - 🌓 **Yüksek Kontrast Modu (High Contrast):** Görme güçlüğü çeken kullanıcılar için kenarlıklar ve metin kontrastı güçlendirilmiş özel tema.
   - 🔕 **Hareketi Azaltma (Reduce Motion):** Vestibüler hareket hassasiyeti olan kullanıcılar için animasyon ve geçiş efektlerini devre dışı bırakma.

3. **Geri Bildirim & Hata Önleme:**
   - Form alanlarında canlı doğrulama ve açıklayıcı hata mesajları.
   - İşlem onayları, bildirim çekmecesi ve geri bildirim etiketleri.

---

## 🚀 Temel Özellikler

- 🏢 **Çok Kiracılı (Multi-Tenant) Mimari:**
  - Farklı organizasyonlar (Helios Bank, Orbit Logistics, Verdant Health, Kestrel Retail) ve bu organizasyonlara bağlı projeler (Mobil Bankacılık, Ödeme API'si, WMS vb.) tek platformdan yönetilir.
- ⏱️ **Gerçek Zamanlı SLA Geri Sayım Sayacı:**
  - Bilet önceliğine göre otomatik hesaplanan ilk yanıt ve çözüm süreleri.
  - Anlık SLA durumu takibi (`On Track`, `At Risk`, `Breached`).
- 📊 **Etkileşimli Yönetici & PM Gösterge Paneli:**
  - KPI kartları, bilet durumu donut grafikleri, öncelik dağılım çubukları ve SLA izleme listesi.
- 🎫 **Kapsamlı Bilet (Ticket) Yaşam Döngüsü:**
  - Bilet açma, durum güncelleme, geliştirici atama, dosya eki yönetimi.
  - **Denetim İzi (Audit Trail):** Yapılan her durum değişikliğinin ve işlemin zaman damgalı geçmiş kaydı.
  - **Dahili vs. Halka Açık Yorumlar:** Geliştirici ve PM'lerin kendi aralarında özel notlar alabilmesi veya müşteriye açık yanıt verebilmesi.
- 👥 **Ekip ve İş Yükü Yönetimi:**
  - Geliştiricilerin anlık aktif iş yükleri, çözdükleri bilet sayıları ve uzmanlık alanları.
- 🔍 **Global Hızlı Arama:**
  - Biletler, şirketler ve projeler arasında anahtar kelimeyle anında arama ve yönlendirme.
- 📈 **SLA Analitiği & Uyumluluk Raporları:**
  - Kurumsal %98.5 hedefiyle karşılaştırmalı SLA başarı oranları.

---

## 🎭 Kullanıcı Rolleri ve Deneyimi (RBAC)

Platform, kullanıcı profiline göre özelleştirilmiş 4 ana rol sunar:

| Rol | Temsili Kullanıcı | Yetkiler & Özelleştirilmiş Görünüm |
| :--- | :--- | :--- |
| **Platform Administrator** | Elena Marsh | Tüm organizasyonlar, projeler, sistem ayarları ve tam denetim yetkisi. |
| **Project Manager (PM)** | Daniel Okafor | Bilet triyajı, önceliklendirme, SLA izleme listesi ve şirket metrikleri. |
| **Developer** | Priya Raman | Kendisine atanan görev panosu (`/my-tickets`), kod/teknik not ekleme ve durum ilerletme. |
| **Client (Müşteri)** | Laura Fischer | Yalnızca kendi organizasyonuna ait biletleri görme, yeni bilet oluşturma ve SLA takibi. |

---

## ⏱️ SLA (Hizmet Seviyesi Taahhüdü) Yönetimi

Biletlerin öncelik seviyelerine göre uygulanan taahhüt süreleri:

| Öncelik | İlk Yanıt Hedefi | Çözüm Hedefi | Kritik Eşik ("At Risk") |
| :--- | :--- | :--- | :--- |
| **Critical** | 15 Dakika | 4 Saat | Kalan süre < 2 Saat |
| **High** | 1 Saat | 8 Saat | Kalan süre < 2 Saat |
| **Medium** | 4 Saat | 24 Saat (1 İş Günü) | Kalan süre < 2 Saat |
| **Low** | 1 İş Günü | 72 Saat (3 İş Günü) | Kalan süre < 2 Saat |

---

## 🛠️ Teknoloji Yığını

- **Çekirdek:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Stil & Tasarım:** [Tailwind CSS v4](https://tailwindcss.com/), PostCSS, CSS Variables (Design Tokens)
- **Bileşen & Primitifler:** Base UI / Radix Primitives, `clsx`, `tailwind-merge`
- **İkonografi:** [Lucide React](https://lucide.dev/)
- **Veri Görselleştirme:** [Recharts](https://recharts.org/)
- **Tipografi:** Inter & JetBrains Mono (Google Fonts)

---

## 📁 Proje Dizin Yapısı

```plaintext
HCI_project/
├── README.md                   # Proje tanıtım ve dokümantasyon dosyası
├── start-website.bat           # Windows kullanıcıları için tek tıkla çalıştırma betiği
└── nexuss/                     # Ana web uygulaması
    ├── app/
    │   ├── (app)/              # Giriş yapılmış sayfa rotaları
    │   │   ├── dashboard/      # Ana metrik gösterge paneli
    │   │   ├── tickets/        # Bilet listesi, detay ([id]) ve yeni bilet oluşturma (/new)
    │   │   ├── my-tickets/     # Geliştiricinin kişisel biletleri
    │   │   ├── companies/      # Şirketler ve proje çalışma alanları
    │   │   ├── team/           # Geliştirici iş yükü ve takım listesi
    │   │   ├── analytics/      # SLA uyumluluk ve performans analitiği
    │   │   └── settings/       # Erişilebilirlik ve sistem ayarları
    │   ├── layout.tsx          # Kök yerleşim ve erişilebilirlik başlatıcı scripti
    │   ├── page.tsx            # Giriş ekranı (Login Screen)
    │   └── globals.css         # Tema değişkenleri, dark/light ve yüksek kontrast stilleri
    ├── components/
    │   ├── nexus/              # Projeye özel bileşenler (Dashboard, Detail, Submit, Badges, vb.)
    │   └── ui/                 # Paylaşılan temel UI bileşenleri
    ├── lib/
    │   ├── a11y-prefs.ts       # Erişilebilirlik tercihleri yönetimi (LocalStorage + DOM)
    │   ├── nexus-data.ts       # Tipler, sabitler, rol tanımları ve demo veri havuzu
    │   ├── sla.ts              # SLA durum ve süre hesaplama motoru
    │   └── utils.ts            # Yardımcı yardımcı fonksiyonlar
    └── package.json            # Bağımlılıklar ve npm betikleri
```

---

## 💻 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js**: `v18.18.0` veya üzeri
- **Paket Yöneticisi**: `npm` veya `pnpm`

### 1. Windows için Hızlı Başlatma
Proje kök dizininde bulunan `start-website.bat` dosyasına çift tıklayarak otomatik olarak paketleri yükleyebilir ve projeyi başlatabilirsiniz.

### 2. Manuel Başlatma (Mac / Linux / Windows)

```bash
# 1. Uygulama dizinine geçin
cd nexuss

# 2. Bağımlılıkları yükleyin
npm install
# veya
pnpm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
# veya
pnpm dev
```

Sunucu başladığında tarayıcınızdan **`http://localhost:3000`** adresine gidin.

---

## 🔑 Demo Hesapları

Giriş ekranında yer alan **"Hızlı Demo Girişi"** kartlarına tıklayarak herhangi bir şifre girmeden doğrudan ilgili rolle giriş yapabilir ya da aşağıdaki e-posta adreslerini kullanabilirsiniz:

| Rol | İsim | E-Posta | Varsayılan Başlangıç Sayfası |
| :--- | :--- | :--- | :--- |
| **Admin** | Elena Marsh | `elena.marsh@nexus.io` | `/dashboard` |
| **Project Manager** | Daniel Okafor | `daniel.okafor@nexus.io` | `/dashboard` |
| **Developer** | Priya Raman | `priya.raman@nexus.io` | `/my-tickets` |
| **Client** | Laura Fischer | `laura.fischer@heliosbank.com` | `/tickets/new` |

> 💡 **Not:** Üst barda (TopBar) yer alan kullanıcı profil menüsünden oturumu kapatmadan dilediğiniz an roller arasında tek tıkla geçiş yapabilirsiniz.
