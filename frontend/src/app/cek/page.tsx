'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ticket } from '@/lib/types';
import { getStatusInfo, formatDateShort } from '@/lib/utils';
import { Search, ArrowLeft, Loader2, AlertCircle, QrCode, CalendarDays, Clock, MapPin, BadgeCheck, RefreshCw } from 'lucide-react';

export default function CekTiketPage() {
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [formErrors, setFormErrors] = useState({ nik: '', phone: '' });
  
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const errors = { nik: '', phone: '' };
    let hasError = false;
    
    if (!nik.trim()) {
      errors.nik = 'anda harus memasukan NIK anda';
      hasError = true;
    }
    if (!phone.trim()) {
      errors.phone = 'Anda harus memasukan nomor telpon anda';
      hasError = true;
    }
    
    setFormErrors(errors);
    if (hasError) return;

    setLoading(true);
    setError('');
    setTicket(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(nik.trim().toUpperCase())}?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (data.success) {
        setTicket(data.data);
      } else {
        setError('Tiket tidak ditemukan. Periksa kembali NIK atau Nomor Telpon Anda.');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNik('');
    setPhone('');
    setCaptcha(false);
    setFormErrors({ nik: '', phone: '' });
    setTicket(null);
    setError('');
    setSearched(false);
  };

  const statusInfo = ticket ? getStatusInfo(ticket.status) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Search className="w-7 h-7 text-blue-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Cek / Lacak Tiket Saya</h1>
          <p className="text-gray-500 text-sm mt-2">
            Masukkan NIK dan Nomor Telpon untuk melihat status antrean terkini.
          </p>
        </div>

        {/* Search Form Card */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="space-y-4">
            {/* Input NIK */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NIK Pengunjung
              </label>
              <input
                type="text"
                value={nik}
                onChange={e => { setNik(e.target.value); setFormErrors(prev => ({...prev, nik: ''})) }}
                placeholder="Contoh: 320510..."
                className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none text-sm font-medium transition-colors
                  ${formErrors.nik ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-blue-500'}`}
              />
              {formErrors.nik && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.nik}</p>
              )}
            </div>

            {/* Input Nomor Telepon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nomor Telpon
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => { setPhone(e.target.value); setFormErrors(prev => ({...prev, phone: ''})) }}
                placeholder="Contoh: 081234567890"
                className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none text-sm font-medium transition-colors
                  ${formErrors.phone ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-blue-500'}`}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.phone}</p>
              )}
            </div>



            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Cari Tiket
              </button>
            </div>
          </div>
        </form>

        {/* Error */}
        {searched && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Tiket Tidak Ditemukan</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
              <Link href="/daftar" className="text-sm text-blue-600 font-medium mt-2 inline-block hover:underline">
                → Daftar tiket baru
              </Link>
            </div>
          </div>
        )}

        {/* Ticket Result */}
        {ticket && statusInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            {/* Status Header */}
            <div className={`px-6 py-4 border-b ${statusInfo.bg} ${statusInfo.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-0.5">Status Tiket</p>
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-lg`}>{statusInfo.label}</span>
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70 mb-0.5">Nomor Antrean</p>
                  <p className="text-3xl font-black">{ticket.ticket_number}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Nama Pemohon" value={ticket.full_name} bold />
                <InfoItem label="NIK KTP" value={ticket.nik} mono />
              </div>
              <InfoItem label="Kode Booking" value={ticket.booking_code} mono />
              <InfoItem
                label="Jenis Layanan"
                value={ticket.services?.name ?? '-'}
                valueClass="text-blue-700 font-semibold"
              />
              <div className="grid grid-cols-2 gap-4">
                <InfoItem
                  label="Tanggal Kunjungan"
                  value={formatDateShort(ticket.visit_date)}
                  icon={<CalendarDays className="w-3.5 h-3.5 text-gray-400" />}
                />
                <InfoItem
                  label="Sesi Waktu"
                  value={ticket.sessions ? `${ticket.sessions.start_time} – ${ticket.sessions.end_time} WIB` : '-'}
                  icon={<Clock className="w-3.5 h-3.5 text-gray-400" />}
                />
              </div>
              <InfoItem
                label="Lokasi"
                value="Bapenda Kab. Garut • Jl. Otista No.278, Sukagalih, Kec. Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151"
                icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />}
              />
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/tiket/${ticket.booking_code}`}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-sm text-sm"
              >
                <QrCode className="w-4 h-4" />
                Lihat &amp; Cetak E-Tiket
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value, bold, mono, icon, valueClass }: {
  label: string; value: string; bold?: boolean; mono?: boolean; icon?: React.ReactNode; valueClass?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <p className="text-xs text-gray-400 font-medium">{label}</p>
      </div>
      <p className={`text-sm text-gray-800 ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono tracking-wider' : ''} ${valueClass ?? ''}`}>
        {value}
      </p>
    </div>
  );
}
