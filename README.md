<p align="center">
  <a href="#">
    <!-- Logo berfokus pada charts -->
    <img src="https://www.chartjs.org/img/chartjs-logo.svg" alt="Charts Logo" width="120" />
  </a>
</p>

<h2 align="center">NYC Property Sales Dashboard</h2>

<p align="center">
  Dashboard interaktif untuk mengeksplorasi transaksi penjualan properti di New York City
  dari September 2016 hingga Agustus 2017.
  <br/>
  <a href="#penggunaan"><strong>Lihat cara penggunaan »</strong></a>
  <br/>
  <br/>
  <a href="#instalasi">Instalasi</a>
  ·
  <a href="#kontribusi">Kontribusi</a>
  ·
  <a href="#lisensi">Lisensi</a>
</p>

---

## Daftar Isi
- [Deskripsi](#deskripsi)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Instalasi](#instalasi)
  - [Prasyarat](#1-prasyarat)
  - [Clone](#2-clone)
  - [Jalankan Lokal](#3-jalankan-lokal)
- [Penggunaan](#penggunaan)
- [Tangkapan Layar](#tangkapan-layar)
- [Struktur Proyek](#struktur-proyek)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## Deskripsi
<p align="center">
  <!-- Ganti dengan screenshot jika ada -->
  <img src="https://img.icons8.com/?size=600&id=K1E2kqZyXwA2&format=png&color=0b5ed7" alt="Screenshot" width="720" />
  <br/>
</p>

NYC Property Sales Dashboard adalah aplikasi web statis yang menampilkan ringkasan dan eksplorasi data penjualan properti di New York City selama periode 1 tahun (Sep 2016 – Agu 2017). Data divisualisasikan dalam bentuk kartu metrik, bagan interaktif (Chart.js), peta (Leaflet), serta tabel (DataTables) dengan filter tanggal, borough, dan kode pos.

Sumber data: `nyc_dataset.json` (diambil dari GitHub Raw).

## Fitur
- Metrik ringkas: **Total Sales**, **Total Units**, **Residential Units**, **Commercial Units**
- Filter interaktif: **rentang tanggal**, **BOROUGH**, **ZIP CODE**
- Grafik:
  - Total Monthly Sales (line chart, per borough)
  - Distribusi Year Built (doughnut)
  - Top 5 Building Classes (bar)
  - Top 5 Neighborhoods (bar)
  - Perbandingan Residential vs Commercial Units per Borough (bar)
- Peta Leaflet untuk meninjau sebaran titik/area (lihat `map.js`)
- Tabel data dengan pencarian, sort, dan pagination menggunakan DataTables

## Tech Stack
<p>
  <a href="https://www.chartjs.org/"><img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js"/></a>
  <a href="https://d3js.org/"><img src="https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3dotjs&logoColor=white" alt="D3.js"/></a>
</p>

## Instalasi
### 1) Prasyarat
- Browser modern (Chrome/Edge/Firefox/Safari)
- Opsi server statis lokal:
  - Python 3 (`python -m http.server`), atau
  - Node.js (`npx serve`), atau
  - Ekstensi VS Code Live Server

### 2) Clone
```bash
git clone https://github.com/<kamu>/nyc-property-sales-dashboard.git
cd nyc-property-sales-dashboard
```

### 3) Jalankan Lokal
Pilih salah satu cara berikut:
```bash
# Python 3
python3 -m http.server 5500
# lalu buka http://localhost:5500/index.html

# Node (serve)
npx --yes serve -l 5500 .
# lalu buka http://localhost:5500
```

Catatan: `script.js` mengambil data dari GitHub Raw:
```text
https://raw.githubusercontent.com/rdsarjito/nyc_dataset/main/nyc_dataset.json
```
Anda dapat mengubahnya untuk memakai file lokal `nyc_dataset.json` jika perlu offline.

## Penggunaan
- Pilih rentang tanggal pada bagian filter.
- Klik pemilih `Borough` dan `Zip Code`, centang opsi untuk memfilter data.
- Bagan dan tabel akan otomatis terbarui sesuai filter.
- Gunakan tabel "Data Review" untuk pencarian dan pengurutan cepat.

Tip: Jika grafik tidak tampil setelah mengubah filter, halaman akan merender ulang canvas secara dinamis—tunggu sejenak atau periksa konsol browser jika ada error.

## Tangkapan Layar
- Tambahkan gambar UI (dashboard, peta, grafik) ke repo lalu sematkan di bagian ini.

## Struktur Proyek
```
.
├─ index.html          # Halaman utama dashboard
├─ style.css           # Gaya tampilan
├─ script.js           # Logika filter, metrik, tabel, dan chart
├─ map.js              # Inisialisasi dan logika peta Leaflet
└─ nyc_dataset.json    # (Opsional) dataset lokal; default mengambil dari GitHub Raw
```

## Kontribusi
1. Fork repository dan buat branch fitur.
2. Lakukan perubahan dengan commit message yang jelas.
3. Pastikan tidak ada secret yang ter-commit.
4. Buka Pull Request dengan deskripsi singkat dan lampirkan screenshot bila perlu.

## Lisensi
MIT License.

---

Terinspirasi oleh struktur README dari `Best-README-Template`.


