import Link from 'next/link';
import { Search, Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Tiket Tidak Ditemukan</h1>
        <p className="text-gray-500 text-sm mb-6">
          Kode booking yang Anda cari tidak ditemukan dalam sistem. 
          Pastikan kode yang Anda masukkan sudah benar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cek"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-all"
          >
            <Search className="w-4 h-4" />
            Cek Tiket Lagi
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-5 py-3 rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
