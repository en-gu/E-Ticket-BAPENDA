# Dokumentasi API Antrean Tiket Bapenda Garut

API ini dibuat menggunakan framework Express.js dan menyediakan fitur dasar untuk mengelola antrean tiket (mengambil tiket, memanggil nomor antrean, melihat status, dan mereset antrean).

## Base URL
\`http://localhost:3000\`

---

## 1. Mendapatkan Status Antrean
Endpoint ini digunakan untuk melihat nomor antrean yang sedang dilayani saat ini dan nomor tiket terakhir yang dicetak.

- **URL:** \`/api/queue/status\`
- **Method:** \`GET\`
- **Headers:** -
- **Body:** -

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status antrean berhasil diambil",
  "data": {
    "current_number": 0,
    "last_issued_number": 0,
    "total_waiting": 0
  }
}
```

---

## 2. Mengambil Tiket Baru
Endpoint ini digunakan oleh pengunjung untuk mengambil nomor tiket baru.

- **URL:** \`/api/queue/ticket\`
- **Method:** \`POST\`
- **Headers:** -
- **Body:** -

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tiket antrean berhasil dibuat",
  "data": {
    "ticket_number": 1,
    "timestamp": "2023-10-27T10:00:00.000Z"
  }
}
```

---

## 3. Memanggil Nomor Antrean Selanjutnya
Endpoint ini digunakan oleh loket / admin untuk memanggil nomor antrean berikutnya.

- **URL:** \`/api/queue/call\`
- **Method:** \`POST\`
- **Headers:** -
- **Body:** -

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Nomor antrean 1 berhasil dipanggil",
  "data": {
    "called_number": 1
  }
}
```

**Response Error (400 Bad Request) - Jika tidak ada antrean:**
```json
{
  "success": false,
  "message": "Tidak ada antrean yang menunggu"
}
```

---

## 4. Mereset Antrean
Endpoint ini digunakan untuk mereset seluruh antrean kembali ke 0 (biasanya dilakukan di awal hari kerja).

- **URL:** \`/api/queue/reset\`
- **Method:** \`POST\`
- **Headers:** -
- **Body:** -

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Antrean berhasil direset"
}
```

---

## Cara Menjalankan Project
1. Pastikan Anda sudah menginstal Node.js.
2. Buka terminal di folder project ini.
3. Jalankan perintah untuk menginstal dependencies:
   ```bash
   npm install
   ```
4. Jalankan server (mode development menggunakan nodemon):
   ```bash
   npm run dev
   ```
   Atau mode standar:
   ```bash
   npm start
   ```
5. Server akan berjalan di \`http://localhost:3000\`.
