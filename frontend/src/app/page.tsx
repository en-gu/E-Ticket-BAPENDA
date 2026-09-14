import type { Metadata } from 'next';
import Link from 'next/link';
import StatsWidget from '@/components/beranda/StatsWidget';
import {
  ClipboardList, Search, UserCheck, QrCode, CalendarCheck,
  Clock, FileText, BadgeCheck, ChevronRight, Phone
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Beranda - Antrean Online Bapenda Kab. Garut',
  description: 'Portal Pelayanan Antrean Tatap Muka Bapenda Kabupaten Garut. Daftarkan kehadiran Anda secara mudah tanpa antre lama di loket.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-600 font-medium">
              Pelayanan Tiket Kantor Bapenda Garut
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600">
            <BadgeCheck className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">
              Sistem Resmi Bapenda Kab. Garut
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Widget */}
        {/* Stats Widget removed */}

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">
                  Portal Antrean Online
                </p>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
                  Selamat Datang!
                </h1>
                <p className="text-gray-600 leading-relaxed max-w-lg">
                  Portal Pelayanan Antrean Tiket Bapenda Kabupaten Garut.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-[220px]">
                <Link
                  href="/daftar"
                  id="btn-daftar-tiket"
                  className="flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>Daftar Tiket Antrean</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/cek"
                  id="btn-cek-tiket"
                  className="flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3.5 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
                >
                  <Search className="w-5 h-5 text-gray-500" />
                  <span>Cek / Lacak Tiket Saya</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="border-t border-gray-100 bg-gray-50 px-6 sm:px-8 py-6">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-base font-bold text-gray-800">Alur Pendaftaran Antrean</h2>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                3 Langkah Mudah
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StepCard
                number="1"
                label="LANGKAH 1"
                title="Isi Data Diri"
                desc="Siapkan NIK, No. KTP, dan informasi data wajib pajak."
                icon={<UserCheck className="w-7 h-7 text-blue-500" />}
                color="blue"
              />
              <StepCard
                number="2"
                label="LANGKAH 2"
                title="Pilih Waktu & Layanan"
                desc="Tentukan loket pelayanan, tanggal kunjungan, dan sesi jam."
                icon={<CalendarCheck className="w-7 h-7 text-blue-500" />}
                color="blue"
              />
              <StepCard
                number="3"
                label="LANGKAH 3"
                title="Dapatkan QR Tiket"
                desc="Simpan tiket di HP atau tunjukkan saat tiba di kantor Bapenda."
                icon={<QrCode className="w-7 h-7 text-blue-500" />}
                color="blue"
              />
            </div>
          </div>
        </div>

        {/* Ketentuan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider">
              Ketentuan Kedatangan Pelayanan
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Keterangan
              icon={<Clock className="w-4 h-4 text-blue-500 shrink-0" />}
              text="Hadir tepat waktu 15 menit sebelum sesi antrean dan membawa dokumen yang dibutuhkan."
            />
            <Keterangan
              icon={<CalendarCheck className="w-4 h-4 text-blue-500 shrink-0" />}
              text="Pelayanan aktif pada hari kerja: Senin s/d Jumat (08.00 – 15.00 WIB)."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-4 space-y-1">
          <p>© {new Date().getFullYear()} Badan Pendapatan Daerah Kabupaten Garut</p>
          <p>Jl. Otista No.278, Sukagalih, Kec. Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151</p>
          <div className="flex items-center justify-center mt-2">
            <Link href="/petugas/login" className="text-gray-400 hover:text-blue-500 transition-colors">
              Portal Petugas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  label, title, desc, icon, color,
}: {
  number: string;
  label: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: 'blue' | 'teal';
}) {
  const ringColor = color === 'blue' ? 'border-blue-100 bg-blue-50' : 'border-teal-100 bg-teal-50';
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-xl border-2 ${ringColor} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className={`text-xs font-bold tracking-widest mb-1 ${color === 'blue' ? 'text-blue-600' : 'text-teal-600'}`}>
        {label}
      </p>
      <h3 className="font-bold text-gray-800 mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Keterangan({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="mt-0.5">{icon}</div>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}
