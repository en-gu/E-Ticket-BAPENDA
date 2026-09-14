Dokumentasi workflow
Sistem tiket antrean online — Badan Pendapatan Daerah (Bapenda) Kabupaten Garut
1. Pendahuluan
1.1 Latar belakang
Bapenda Kabupaten Garut menyediakan layanan perpajakan daerah (PBB-P2, BPHTB, retribusi, dan layanan lain) yang selama ini memerlukan wajib pajak mengantre langsung di kantor. Sistem tiket antrean online dikembangkan untuk menjawab kebutuhan ini, dan pada revisi ini dirancang ulang menggunakan arsitektur modular agar setiap fungsi (pendaftaran publik, operasional loket, konfigurasi admin, notifikasi, dan pelaporan) dapat dikembangkan, diuji, dan dipelihara secara independen.
1.2 Tujuan dokumentasi
Dokumen ini menjelaskan arsitektur dan alur kerja sistem secara modular. Setiap modul didokumentasikan dengan status implementasinya saat ini — sebagian sudah berjalan (Modul Publik), sebagian masih berupa rancangan yang diusulkan untuk pengembangan lanjutan (Modul Petugas, Admin, Notifikasi lanjutan, dan Laporan/SKM).
1.3 Ruang lingkup
●	Arsitektur modul dan hubungan antar-modul melalui basis data terpusat
●	Alur dan spesifikasi Modul Publik yang sudah terimplementasi
●	Rancangan alur Modul Petugas dan Modul Admin yang diusulkan
●	Siklus status tiket lintas modul dan diagram use case seluruh aktor
2. Arsitektur sistem
Sistem dibagi menjadi lima modul yang saling terhubung melalui satu basis data terpusat, sebagaimana digambarkan berikut:
 
Gambar 1. Arsitektur modul sistem tiket antrean online Bapenda Garut
Ringkasan tiap modul beserta status pengembangannya:
Modul	Fungsi utama	Aktor	Status
Modul Publik	Pendaftaran tiket online, cek/lacak tiket, terima e-tiket	Wajib pajak	Terimplementasi
Modul Petugas	Check-in kedatangan, panggil nomor, verifikasi berkas, tandai selesai	Petugas loket	Rancangan
Modul Admin	Kelola jenis layanan, kuota & sesi, akun petugas, lokasi/cabang	Admin	Rancangan
Modul Notifikasi	Kirim e-tiket; rencana: reminder H-1 & posisi antrean live	Sistem (otomatis)	Sebagian terimplementasi
Modul Laporan & SKM	Statistik kunjungan, waktu tunggu, survei kepuasan masyarakat	Admin	Rancangan

3. Aktor dan peran
Sistem melibatkan tiga aktor utama dengan peran dan hak akses berbeda:
Aktor	Peran dalam sistem	Akses
Wajib pajak	Melihat statistik antrean, mendaftar tiket antrean online, mengecek/melacak tiket, menerima e-tiket	Halaman publik (tanpa login)
Petugas loket	Memverifikasi e-tiket (scan QR/cek NIK), memanggil nomor antrean, melayani wajib pajak	Dashboard petugas (login)
Admin	Mengelola jenis layanan, kuota, sesi waktu, lokasi kantor, serta memantau laporan & statistik	Panel admin (login, hak akses penuh)
 
4. Modul publik — pendaftaran & pelacakan tiket
Modul ini menangani seluruh interaksi wajib pajak sebelum tiba di kantor: mengakses portal, mengisi formulir pendaftaran, dan menerima e-tiket. Modul ini sudah dibangun dan diuji.
 
Gambar 2. Alur Modul Publik, dari akses portal hingga status Terjadwal
4.1 Portal antrean online (beranda)
Beranda berfungsi sebagai portal utama sekaligus dashboard ringkas. Tiga kartu statistik di bagian atas menampilkan kondisi antrean secara real-time:
●	Total Antrean Hari Ini — jumlah seluruh tiket yang terbit hari ini, lintas status (Terjadwal, Menunggu, Dipanggil, Sedang Dilayani, Selesai)
●	Dalam Antrean (Menunggu) — jumlah wajib pajak yang sudah tiba di lokasi dan memindai QR code (check-in), menunggu giliran dipanggil. Angka ini baru bertambah setelah wajib pajak benar-benar hadir, bukan sejak tiket dipesan online
●	Sedang Dilayani — jumlah loket yang sedang aktif melayani wajib pajak pada saat itu
Di bawahnya, portal menampilkan ringkasan 3 langkah pendaftaran (Isi Data Diri, Pilih Waktu & Layanan, Dapatkan QR Tiket), ketentuan kedatangan, serta dua tombol aksi utama: "Daftar Tiket Antrean" dan "Cek/Lacak Tiket Saya".
 
Gambar 3. Portal antrean online — beranda dengan widget statistik real-time
 
4.2 Formulir pendaftaran (4 tahap)
Tahap 1 — Data diri
 
Gambar 4. Form Tahap 1 — Identitas pengunjung
Field	Keterangan	Validasi/Sifat
NIK (Nomor Induk Kependudukan)	16 digit sesuai KTP, dipakai mencocokkan data objek pajak (PBB-P2/BPHTB)	Wajib, numerik 16 digit
Nama lengkap pemohon	Sesuai e-KTP	Wajib
Status hubungan dengan objek pajak	Pilihan: Wajib Pajak Sendiri, Anggota Keluarga (KK), Kuasa/Notaris/PPAT, Badan Usaha/Instansi	Wajib, pilih salah satu
Nomor WhatsApp aktif	Untuk notifikasi panggilan antrean	Wajib, format nomor HP
Alamat email pemohon	Untuk pengiriman e-tiket resmi, QR code, dan tautan pembatalan tiket	Wajib, format email
Kecamatan domisili	Dipilih dari daftar kecamatan di Kab. Garut	Wajib, dropdown
Desa/Kelurahan	Diisi terpisah dari kecamatan	Wajib
Alamat lengkap (jalan/RT/RW)	Alamat detail pemohon	Wajib
 
Tahap 2 — Pernyataan
 
Gambar 5. Form Tahap 2 — Pernyataan pemohon
●	Datang tepat waktu sesuai jadwal yang dipilih (minimal 10 menit sebelum sesi untuk verifikasi nomor tiket)
●	Membawa e-KTP dan berkas dokumen asli/fotokopi sesuai jenis layanan yang diajukan
●	Data yang diisi adalah benar dan dapat dipertanggungjawabkan
Halaman ini juga menampilkan penanda kepercayaan "Proses pendaftaran resmi dilindungi enkripsi SSL" dan tautan bantuan "Butuh Bantuan Persyaratan Berkas?" di bagian bawah.
 
Tahap 3 — Detail kedatangan
 
Gambar 6. Form Tahap 3 — Detail rencana kedatangan
Field	Keterangan
Lokasi kantor layanan	Bapenda Kab. Garut (Kantor Pusat – Jl. Patriot No. 1), menampilkan alamat lengkap
Tanggal kunjungan	Dipilih dari kalender; hanya hari kerja (Senin–Jumat, 08.00–15.00 WIB); menampilkan sisa kuota harian
Sesi waktu kedatangan	3 opsi per hari — Sesi 1 (08.30–10.00), Sesi 2 (10.00–12.00), Sesi 3 (13.00–14.30) — masing-masing dengan sisa kuota
Jenis layanan perpajakan	Dropdown, mis. "PASTI PBB-P2 (Pelayanan SPPT, Mutasi Objek & Balik Nama)"
Persyaratan berkas wajib dibawa	Ditampilkan otomatis sesuai jenis layanan terpilih (mis. KTP asli/fotokopi, bukti lunas PBB, dokumen alas hak)
Halaman ini menyediakan kontak Helpdesk Bapenda di footer untuk bantuan terkait jadwal.
 
Tahap 4 — Konfirmasi
 
Gambar 7. Form Tahap 4 — Konfirmasi tiket antrean
Beberapa jenis layanan (mis. Wajib Pajak Langsung) ditandai badge "Loket Prioritas". Setelah data dikonfirmasi dan pernyataan dicentang, sistem menegaskan bahwa kode booking dan tiket QR akan dikirim otomatis ke WhatsApp dan Email sekaligus (dual-channel), bukan email saja.
 
4.3 e-Tiket (keluaran akhir Modul Publik)
 
Gambar 8. e-Tiket antrean loket
Elemen	Keterangan
Nomor antrean	Kode singkat per layanan/hari, contoh A-018
Kode booking	Kode unik referensi pendaftaran, contoh 001-085506
QR code	Dipindai petugas saat verifikasi kedatangan di loket/mesin antrean
Nama & NIK pengunjung	Diambil dari data Tahap 1
Jenis layanan	Diambil dari data Tahap 3
Tanggal & jam pelayanan	Diambil dari data Tahap 3 (tanggal & sesi)
Lokasi pelayanan	Nama gedung/loket tujuan
Catatan kedatangan	Pengingat hadir 15 menit sebelum jadwal, membawa e-KTP & berkas asli
Aksi tersedia	Kirim ke WhatsApp, Cetak/Simpan PDF, Kembali ke beranda
 
5. Modul petugas — operasional loket
 RANCANGAN / USULAN 
Modul ini belum terimplementasi pada sistem saat ini. Modul ini diusulkan untuk menggantikan proses manual di loket dengan dashboard digital bagi petugas, menangani proses sejak wajib pajak tiba di kantor hingga layanan selesai.
 
Gambar 9. Rancangan alur Modul Petugas
Kebutuhan tampilan yang diusulkan:
Kebutuhan tampilan	Keterangan
Daftar antrean masuk (Menunggu)	Menampilkan nomor antrean berstatus Menunggu (Dalam Antrean), terurut berdasarkan sesi dan waktu kedatangan
Tombol "Panggil Nomor Berikutnya"	Memicu perubahan status dari Menunggu ke Dipanggil dan memperbarui layar display secara otomatis
Detail pemohon terpilih	Menampilkan NIK, nama, jenis layanan, dan berkas yang perlu diverifikasi
Tombol tandai status	Opsi "Selesai" atau "Lewat/Tidak Hadir" untuk menutup transaksi tiket
Riwayat panggilan hari ini	Daftar tiket yang sudah dipanggil/selesai pada shift berjalan, untuk audit petugas
 
6. Modul admin — konfigurasi & manajemen
 RANCANGAN / USULAN 
Modul ini belum terimplementasi. Fungsi-fungsi admin bersifat paralel/menu-based (bukan alur berurutan), sehingga digambarkan sebagai peta fungsi berikut:
 
Gambar 10. Rancangan fungsi Modul Admin
Kebutuhan tampilan yang diusulkan:
Kebutuhan tampilan	Keterangan
Manajemen jenis layanan	Tambah/ubah/nonaktifkan jenis layanan (PBB-P2, BPHTB, dll) beserta persyaratan berkasnya
Manajemen kuota & sesi	Atur jumlah sesi per hari, jam operasional, dan kuota maksimum tiap sesi, per lokasi kantor
Manajemen akun petugas	Tambah/nonaktifkan akun petugas dan penugasan loket
Manajemen lokasi/cabang	Kelola daftar kantor/loket layanan apabila lebih dari satu lokasi
Dashboard laporan	Rekap jumlah pengunjung, rata-rata waktu tunggu, jam sibuk, dan tingkat no-show
 
7. Modul notifikasi
 SEBAGIAN TERIMPLEMENTASI 
Saat ini modul notifikasi hanya mengirim e-tiket melalui WhatsApp/Email setelah pendaftaran berhasil (bagian dari Modul Publik). Pengembangan lanjutan yang diusulkan:
●	Reminder otomatis H-1 sebelum jadwal kedatangan
●	Update posisi antrean real-time ("nomor Anda tinggal 5 lagi") saat wajib pajak sudah check-in
●	Notifikasi saat nomor akan segera dipanggil (mis. 2 nomor sebelumnya)
8. Modul laporan & survei kepuasan (SKM)
 RANCANGAN / USULAN 
Modul ini mengolah data dari seluruh modul lain menjadi laporan operasional dan survei kepuasan masyarakat, yang umumnya wajib dilaporkan secara berkala oleh instansi pemerintah.
●	Statistik jumlah pengunjung per hari/minggu/bulan, per jenis layanan
●	Rata-rata waktu tunggu dan waktu layanan per loket
●	Jam-jam sibuk (peak hours) dan tingkat no-show
●	Survei kepuasan singkat (rating + komentar) yang diisi wajib pajak setelah status Selesai
 
9. Siklus status tiket (lintas modul)
Status tiket berubah seiring perpindahan antar-modul — dari Modul Publik ke Modul Petugas:
 
Gambar 11. Diagram siklus status tiket antrean
Status	Deskripsi
Terjadwal	Tiket terbit dari Modul Publik; wajib pajak belum tiba di lokasi. Dihitung dalam "Total Antrean Hari Ini" tetapi belum masuk "Dalam Antrean"
Menunggu (Dalam Antrean)	Wajib pajak telah tiba dan memindai QR code di lokasi (check-in); inilah yang ditampilkan sebagai "Dalam Antrean (Menunggu)" pada widget beranda
Dipanggil	Petugas memanggil nomor melalui dashboard; nomor tampil di layar display (Modul Petugas)
Sedang dilayani	Berkas terverifikasi dan sedang diproses di loket; dihitung sebagai "Sedang Dilayani" (jumlah loket aktif) pada widget beranda
Selesai	Layanan tuntas; data transaksi tersimpan untuk Modul Laporan & SKM
Lewat/Batal	Wajib pajak tidak hadir saat dipanggil, melewati batas waktu sesi, atau membatalkan tiket secara mandiri

10. Diagram use case
Mencakup fungsi Modul Publik (terimplementasi) serta usulan fungsi Modul Petugas dan Admin:
 
Gambar 12. Diagram use case seluruh modul
11. Ketentuan dan aturan bisnis (business rules)
●	Pelayanan loket hanya tersedia pada hari kerja, Senin–Jumat, pukul 08.00–15.00 WIB
●	Setiap sesi memiliki kuota terbatas; pendaftaran ditutup otomatis jika kuota sesi/hari terpenuhi
●	Wajib pajak wajib check-in minimal 10–15 menit sebelum sesi untuk verifikasi nomor tiket
●	Persyaratan berkas yang wajib dibawa menyesuaikan jenis layanan perpajakan yang dipilih
●	Bukti/tiket dikirim otomatis melalui WhatsApp dan/atau email, serta dapat dicetak dalam bentuk PDF
●	NIK digunakan untuk mencocokkan data objek pajak (PBB-P2/BPHTB) milik pemohon
12. Data yang perlu disimpan pada basis data
Entitas data lintas modul yang perlu dirancang pada basis data terpusat (untuk tahap ERD selanjutnya):
●	Pemohon: NIK, nama, status hubungan objek pajak, no. WhatsApp, email, kecamatan, alamat lengkap (Modul Publik)
●	Tiket antrean: nomor antrean, kode booking, status, tanggal & sesi, jenis layanan, lokasi kantor, waktu dibuat, waktu check-in, waktu dipanggil, waktu selesai (Modul Publik & Petugas)
●	Jenis layanan & kuota: nama layanan, persyaratan berkas, sesi, kuota total/terpakai (Modul Admin)
●	Petugas & lokasi: akun petugas, penugasan loket, daftar lokasi/cabang (Modul Admin)
●	Log verifikasi & SKM: petugas yang memverifikasi, waktu verifikasi, hasil, rating kepuasan (Modul Petugas & Laporan)
 
13. Roadmap pengembangan yang disarankan
●	Prioritas 1 — Modul Petugas: dampak paling besar karena melengkapi sisi operasional yang belum ada
●	Prioritas 2 — Modul Admin: agar kuota, layanan, dan lokasi dapat dikonfigurasi tanpa mengubah kode
●	Prioritas 3 — Modul Notifikasi lanjutan: reminder H-1 dan posisi antrean live
●	Prioritas 4 — Modul Laporan & SKM: pelaporan berkala dan survei kepuasan
