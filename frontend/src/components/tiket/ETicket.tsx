'use client';

import { Ticket } from '@/lib/types';
import { formatDateShort, formatCreatedAt, getStatusInfo } from '@/lib/utils';
import { MapPin, Calendar, Clock, User, CreditCard, Building2, Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ETicketProps {
  ticket: Ticket;
}

export default function ETicket({ ticket }: ETicketProps) {
  const statusInfo = getStatusInfo(ticket.status);
  const service = ticket.services;
  const session = ticket.sessions;

  const statusStyle = {
    terjadwal: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle className="w-4 h-4" /> },
    dalam_antrean: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <CheckCircle className="w-4 h-4" /> },
    lewat: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <XCircle className="w-4 h-4" /> },
    dipanggil: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: <AlertTriangle className="w-4 h-4" /> },
    dilayani: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: <CheckCircle className="w-4 h-4" /> },
    selesai: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: <CheckCircle className="w-4 h-4" /> },
  }[ticket.status] ?? { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: null };

  return (
    <div
      id="eticket-area"
      className="ticket-print-area bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-6 py-6 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Bapenda Kabupaten Garut</p>
              <h1 className="text-2xl font-extrabold leading-tight">e-Tiket Antrean Loket</h1>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
              {statusStyle.icon}
              {statusInfo.label}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Number Section */}
      <div className="px-6 pt-6 pb-5 border-b border-dashed border-gray-200">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Nomor Antrean Anda
            </p>
            <div className="text-7xl font-black text-blue-700 leading-none tracking-tight">
              {ticket.ticket_number}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kode Tiket</p>
            <div className="bg-gray-900 text-white font-mono font-bold text-lg tracking-[0.2em] px-4 py-2 rounded-xl">
              {ticket.booking_code}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Tunjukkan kode ini ke petugas</p>
          </div>
        </div>
      </div>

      {/* Detail Info */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Nama Pengunjung" value={ticket.full_name} bold />
          <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="NIK KTP" value={ticket.nik} mono />
          <InfoRow
            icon={<Building2 className="w-3.5 h-3.5" />}
            label="Jenis Layanan"
            value={service?.name ?? '-'}
            valueClass="text-blue-700 font-semibold"
          />
          <InfoRow
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Sesi Pelayanan"
            value={session ? `${session.name} • ${session.start_time} – ${session.end_time}` : '-'}
          />
          <InfoRow
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Tanggal Kunjungan"
            value={formatDateShort(ticket.visit_date)}
            bold
          />
          <InfoRow
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Waktu Daftar"
            value={formatCreatedAt(ticket.created_at)}
          />
        </div>

        <div className="mt-4">
          <InfoRow
            icon={<MapPin className="w-3.5 h-3.5" />}
            label="Lokasi Pelayanan"
            value="Jl. Otista No.278, Sukagalih, Kec. Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151"
          />
        </div>
      </div>

      {/* Notice */}
      <div className="mx-6 mb-6 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 flex gap-3 items-start">
        <Shield className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          Harap hadir <strong>15 menit sebelum</strong> waktu kunjungan dan tunjukkan <strong>Kode Tiket</strong> kepada petugas untuk konfirmasi kehadiran.
        </p>
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
  valueClass?: string;
}

function InfoRow({ icon, label, value, bold, mono, valueClass }: InfoRowProps) {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5 shrink-0 text-gray-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm text-gray-800 leading-snug ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono tracking-wider text-xs' : ''} ${valueClass ?? ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
