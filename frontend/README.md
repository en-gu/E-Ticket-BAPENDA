# E-Ticket BAPENDA 🎫

Sistem Antrean dan Pemesanan Tiket Pelayanan Terpadu untuk Badan Pendapatan Daerah (Bapenda) Kabupaten Garut.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Route Handlers (API).
- **Database**: PostgreSQL (via [Supabase](https://supabase.com)).
- **Deployment**: Vercel.

---

## 🗄️ Dokumentasi Database

Database menggunakan relasi standar dengan 4 tabel utama:

1. **`officers`** (Petugas/Admin)
   Menyimpan data otentikasi dan identitas admin/petugas loket.
   - `id`: UUID (Primary Key).
   - `email`: Unik, digunakan untuk login.
   - `role`: Peran (contoh: 'admin', 'petugas').
   - `password_hash`: Password yang telah dienkripsi.

2. **`services`** (Jenis Layanan)
   Katalog jenis layanan pajak yang tersedia di kantor Bapenda.
   - `code`: Kode unik layanan (contoh: 'PBB', 'BPHTB').
   - `name`: Nama layanan.
   - `is_active`: Status ketersediaan layanan.

3. **`sessions`** (Sesi Waktu)
   Membagi jam operasional pelayanan menjadi beberapa blok sesi.
   - `start_time` & `end_time`: Rentang waktu sesi.

4. **`tickets`** (Tiket Antrean)
   Menyimpan riwayat dan status permohonan antrean masyarakat.
   - Terhubung dengan *Foreign Key* ke `services` (layanan apa yang dituju) dan `sessions` (jam berapa).
   - `booking_code`: Kode unik (*booking*) untuk validasi petugas.
   - `status`: Memiliki *state* seperti 'terjadwal', 'dipanggil', 'dilayani', 'selesai', 'lewat'.

---

## 🚀 Panduan Setup Database (Supabase)

Ikuti langkah-langkah berikut untuk mengonfigurasi database di Supabase dan menghubungkannya dengan proyek ini:

### 1. Buat Proyek di Supabase
1. Kunjungi [supabase.com](https://supabase.com) dan buat akun/login.
2. Klik tombol **"New Project"**.
3. Pilih *Organization*, berikan nama proyek (misal: `eticket-bapenda`), dan buat *Database Password* yang kuat. (Simpan password ini karena akan digunakan nanti).
4. Pilih *Region* yang terdekat (contoh: Singapore) dan klik **"Create new project"**.
5. Tunggu beberapa menit hingga proses *provisioning* database selesai.

### 2. Jalankan Script SQL (Migration)
1. Setelah proyek selesai dibuat, pergi ke menu **"SQL Editor"** di *sidebar* kiri Supabase.
2. Klik **"New Query"**.
3. *Copy* dan *Paste* seluruh kode SQL di bawah ini ke dalam editor:

```sql
-- Mengaktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    ticket_number TEXT NOT NULL,
    nik TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    relation_type TEXT NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    session_id UUID REFERENCES sessions(id) ON DELETE RESTRICT,
    visit_date DATE NOT NULL,
    status TEXT NOT NULL,
    qr_data TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```
4. Klik tombol **"Run"** (atau tekan Cmd/Ctrl + Enter). Pastikan muncul pesan *"Success, no rows returned"*.

### 3. Konfigurasi Environment Variables (`.env`)
1. Di Dashboard Supabase Anda, pergi ke menu **"Project Settings"** (ikon gerigi di paling bawah *sidebar* kiri).
2. Pilih tab **"Database"** atau **"API"**.
3. Buat file bernama `.env.local` (atau `.env`) di direktori *root* (folder `frontend`) proyek Anda, dan tambahkan kunci berikut:

```env
# Ambil dari menu Project Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...

# (Jika menggunakan koneksi Prisma/PG murni, ambil dari Settings -> Database)
DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```
*(Catatan: Ganti `[PASSWORD]` dengan password database yang Anda buat di Langkah 1).*

### 4. Selesai!
Sekarang jalankan server lokal Next.js dengan perintah:
```bash
npm run dev
# atau
npm run start
```
Aplikasi sudah terhubung dengan Supabase dan siap digunakan!
