# 🛡️ RSDVault — Personal Finance Management

<p align="center">
  <img src="./assets/icon.png" alt="RSDVault Logo" width="128" height="128" style="border-radius: 24px;" />
</p>

<p align="center">
  <strong>Aplikasi Pengelola Keuangan Pribadi yang Modern, Cepat, dan 100% Offline-First.</strong>
  <br />
  Dibangun dengan <strong>Expo SDK 58</strong>, <strong>React Native</strong>, dan <strong>SQLite</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2058-blue?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 58" />
  <img src="https://img.shields.io/badge/React%20Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SQLite-Offline--First-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Tentang RSDVault

**RSDVault** adalah aplikasi manajemen finansial pribadi yang mengutamakan **kecepatan, privasi, dan kesederhanaan**. Seluruh data finansial Anda tersimpan aman secara lokal di dalam perangkat tanpa ketergantungan pada server pihak ketiga atau komputasi cloud.

Dengan antarmuka **Light Theme Modern (Royal Blue `#1D4ED8`)** yang dirancang presisi, RSDVault memberikan visualisasi yang elegan untuk mencatat arus kas harian, memantau batas anggaran bulanan, serta mengevaluasi kesehatan finansial melalui diagram interaktif.

---

## ✨ Fitur Unggulan

### 1. ⚡ Pencatatan Arus Kas Cepat & Presisi
- Pencatatan **Pemasukan**, **Pengeluaran**, dan **Transfer Antar Rekening**.
- **Pemisah Ribuan Otomatis (*Thousand Separator*)**: Nominal uang terformat seketika saat diketik (misal: `Rp 1.500.000`).
- **Dukungan Kategori Kustom**: Selain kategori standar (*Makan & Minum, Transportasi, Belanja, Gaji, Tagihan*), pengguna bebas menambahkan kategori sendiri secara fleksibel (*Sedekah, Investasi, Renovasi, dll*).

### 2. 📊 Smart Budgeting (Batas Anggaran Bulanan)
- Tetapkan batas maksimal pengeluaran per kategori.
- Progress bar interaktif dengan indikator warna (*Aman* atau *Habis/Overbudget*).
- Kalkulasi otomatis sisa anggaran bulan berjalan yang sinkron langsung dengan transaksi nyata.

### 3. 📈 Statistik & Laporan Real-Time
- Evaluasi visual tren pengeluaran 4 minggu.
- *Category breakdown* persentase pengeluaran.
- **Ekspor Dokumen Nyata (.CSV)**: Ekspor seluruh riwayat transaksi ke format CSV dan langsung buka *Share Sheet* ponsel (kirim ke WhatsApp, Google Drive, email, atau simpan ke penyimpanan lokal).

### 4. 👤 Profil Personal & Foto Kustom
- Langkah setup awal setelah 4 slide onboarding interaktif.
- Unggah foto profil langsung dari galeri ponsel (`expo-image-picker`).
- Penyesuaian nama, email, profesi, serta target pendapatan bulanan.

### 5. 🔒 100% Offline, Privat & Aman
- Didukung oleh **SQLite Lokal** (`finance.db`) di perangkat native dengan transparansi *in-memory fallback* saat dijalankan di web browser.
- **Fitur Backup & Restore Lengkap**:
  - **Cadangkan Data**: Ekspor database ke file `.json`.
  - **Pulihkan Data**: Impor kembali file cadangan kapan saja menggunakan *Document Picker*.

---

## 📱 Tampilan Antarmuka (UI/UX)

- **Mobile Viewport Locked**: Dirancang khusus dengan navigasi tab bar dinamis yang tidak akan terpotong oleh bilah navigasi bawaan Android (3 tombol / gesture bar) maupun home indicator iOS (`useSafeAreaInsets`).
- **Sticky / Fixed Headers**: Header tetap berada di bagian atas saat halaman di-scroll ke bawah.
- **Tipografi Premium**: Menggunakan Google Font **Onest** untuk kenyamanan membaca angka dan label nominal.

---

## 🛠️ Tech Stack & Dependensi Utama

| Teknologi / Pustaka | Versi | Peran |
| :--- | :--- | :--- |
| **Expo SDK** | `~58.0.13` | Framework Universal Mobile App |
| **React Native** | `0.88.0` | Mobile Core Engine |
| **Expo Router** | `~58.0.22` | File-based Routing & Navigation |
| **Expo SQLite** | `~58.0.13` | Penyimpanan Database Lokal Offline |
| **Expo Image Picker** | `~58.0.10` | Pemilihan & Pemangkasan Foto Galeri |
| **Expo File System & Sharing** | `~58.0.9` / `~58.0.18` | Generate & Berbagi Dokumen CSV/JSON |
| **Expo Document Picker** | `~58.0.4` | Pemilihan File Cadangan untuk Restore |
| **Moti & Reanimated** | `^0.30.0` / `4.7.1` | Animasi Halus 60 FPS |
| **Lucide React Native** | `^1.58.0` | Ikon Vektor Modern & Minimalis |

---

## 🚀 Panduan Memulai (Instalasi Lokal)

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 atau 20+ disarankan)
- Package manager `npm`

### 1. Kloning Repositori
```bash
git clone https://github.com/rezadesky/RSDVault.git
cd RSDVault
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Aplikasi

#### A. Menjalankan di Web Browser
```bash
npx expo start --web
```

#### B. Menjalankan di Expo Go (Perangkat Fisik)
```bash
npx expo start -c
```
> **Catatan**: Proyek ini menggunakan Expo SDK 58. Pastikan aplikasi Expo Go di Android Anda adalah versi yang mendukung SDK 58 ([Download APK Expo Go SDK 58](https://github.com/expo/expo-go-releases/releases/download/Expo-Go-58.0.4/Expo-Go-58.0.4.apk)).

#### C. Menjalankan Debugging Native (USB)
```bash
npx expo run:android
```

---

## 📦 Build APK Mandiri (EAS Build)

Untuk menghasilkan file installer `.apk` mandiri yang siap dibagikan dan diinstall di Android:

```bash
# 1. Login ke akun Expo
npx eas-cli login

# 2. Build APK Android
npx eas-cli build -p android --profile preview
```

---

## 📂 Struktur Direktori Proyek

```
aplikasimanajemenkeuangan/
├── assets/                  # Icon, Favicon, dan Aset Grafis
├── src/
│   ├── app/                 # Layar & Rute Aplikasi (Expo Router)
│   │   ├── (tabs)/          # Halaman Tab Navigasi
│   │   │   ├── _layout.tsx  # Bottom Navigation Bar dengan Safe Area
│   │   │   ├── index.tsx    # Dashboard / Beranda Utama
│   │   │   ├── transactions.tsx # Riwayat & Manajemen Transaksi
│   │   │   ├── budget.tsx   # Perencanaan Anggaran Bulanan
│   │   │   ├── reports.tsx  # Laporan & Statistik Evaluasi
│   │   │   └── profile.tsx  # Profil, Backup, Restore, & Pengaturan
│   │   ├── _layout.tsx      # Root Stack Layout
│   │   ├── index.tsx        # Splash Screen Interaktif
│   │   ├── onboarding.tsx   # 4 Slide Onboarding Perkenalan
│   │   └── setup-profile.tsx # Layar Setup Identitas & Foto Pengguna
│   └── database/
│       └── db.ts            # Schema, SQLite Engine & Model CRUD
├── app.json                 # Konfigurasi Native Expo & Manifest
└── package.json             # Manifest Dependensi Proyek
```

---

## 👨‍💻 Pengembang

Dibuat dengan dedikasi oleh **[Reza Saputra](https://github.com/rezadesky)**.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi **MIT**. Silakan gunakan dan kembangkan secara bebas untuk kebutuhan edukasi maupun pribadi.
