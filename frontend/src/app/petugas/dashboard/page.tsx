'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Ticket } from '@/lib/types';
import { getStatusInfo, formatDateShort } from '@/lib/utils';
import {
  CheckCircle, XCircle, LogOut, RefreshCw,
  Loader2, Users, Clock, Monitor, BadgeCheck, User, Building2,
  TicketCheck, AlertCircle, Search, PhoneCall, ChevronRight, FileText, ChevronLeft, Copy, Check
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ScanResult = {
  type: 'success' | 'error' | 'expired' | 'used' | 'notyet';
  message: string;
  ticket?: Ticket;
};

export default function PetugasDashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Validasi Modal State
  const [showValidate, setShowValidate] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Panggil / Call next
  const [calling, setCalling] = useState(false);
  const [calledTicket, setCalledTicket] = useState<Ticket | null>(null);
  const [callError, setCallError] = useState('');

  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/petugas/antrian?date=${selectedDate}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
        const called = data.data.find((t: Ticket) => t.status === 'dipanggil' || t.status === 'dilayani');
        if (called) setCalledTicket(called);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  useEffect(() => {
    if (showValidate) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showValidate]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/petugas/login');
  };

  const handleUpdateStatus = async (bookingCode: string, status: string) => {
    setUpdatingId(bookingCode);
    try {
      const res = await fetch(`/api/tickets/${bookingCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) await fetchQueue();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCallNext = async () => {
    setCalling(true);
    setCallError('');
    try {
      const res = await fetch('/api/petugas/panggil', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCalledTicket(data.data);
        await fetchQueue();
      } else {
        setCallError(data.message);
      }
    } catch {
      setCallError('Gagal memanggil nomor.');
    } finally {
      setCalling(false);
    }
  };

  const handleValidate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticketCode.trim()) return;
    setValidating(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/petugas/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_code: ticketCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult({ type: 'success', message: data.message, ticket: data.data });
        await fetchQueue();
        setTicketCode('');
      } else {
        const code = data.code;
        setScanResult({
          type: code === 'EXPIRED' ? 'expired' : code === 'USED' ? 'used' : code === 'NOT_YET' ? 'notyet' : 'error',
          message: data.message,
        });
      }
    } catch {
      setScanResult({ type: 'error', message: 'Terjadi kesalahan koneksi. Coba lagi.' });
    } finally {
      setValidating(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: tickets.length,
    aktif: tickets.filter(t => t.status === 'terjadwal').length,
    waiting: tickets.filter(t => t.status === 'dalam_antrean').length,
    called: tickets.filter(t => t.status === 'dipanggil').length,
    serving: tickets.filter(t => t.status === 'dilayani').length,
    done: tickets.filter(t => t.status === 'selesai').length,
    expired: tickets.filter(t => t.status === 'lewat').length,
  };

  const waitingTickets = tickets.filter(t => t.status === 'dalam_antrean');
  const activeTicket = tickets.find(t => t.status === 'dipanggil' || t.status === 'dilayani');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar (Bapenda Theme) */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
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

      {/* Header Petugas */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Dashboard Petugas</h1>
              <p className="text-xs text-gray-500">Bapenda Kab. Garut — {formatDateShort(today)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowValidate(true); setScanResult(null); setTicketCode(''); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
            >
              <TicketCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Validasi Tiket</span>
            </button>
            <button
              onClick={fetchQueue}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Hari Ini" value={stats.total} icon={<Users className="w-5 h-5 text-blue-500" />} bg="bg-blue-50" />
          <StatCard label="Menunggu Dipanggil" value={stats.waiting} icon={<Clock className="w-5 h-5 text-amber-500" />} bg="bg-amber-50" />
          <StatCard label="Sedang Dilayani" value={stats.serving + stats.called} icon={<BadgeCheck className="w-5 h-5 text-purple-500" />} bg="bg-purple-50" />
          <StatCard label="Selesai" value={stats.done} icon={<CheckCircle className="w-5 h-5 text-green-500" />} bg="bg-green-50" />
        </div>

        {/* Main grid: Call Panel + Queue List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Call Panel ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Currently Serving */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sedang Dilayani</p>
              {activeTicket ? (
                <div className="text-center">
                  <div className="text-5xl font-black text-blue-700 mb-1">{activeTicket.ticket_number}</div>
                  <p className="text-sm font-semibold text-gray-700">{activeTicket.full_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activeTicket.services?.name ?? '-'}</p>
                  <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full border ${getStatusInfo(activeTicket.status).bg} ${getStatusInfo(activeTicket.status).color}`}>
                    {getStatusInfo(activeTicket.status).label}
                  </span>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleUpdateStatus(activeTicket.booking_code, 'selesai')}
                      disabled={!!updatingId}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
                    >
                      {updatingId === activeTicket.booking_code ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Selesai
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(activeTicket.booking_code, 'lewat')}
                      disabled={!!updatingId}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Lewat
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl font-black text-gray-200 mb-1">—</div>
                  <p className="text-xs text-gray-400">Belum ada yang dilayani</p>
                </div>
              )}
            </div>

            {/* Panggil Berikutnya */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Antrean Berikutnya</p>
              {waitingTickets[0] ? (
                <div className="mb-3 text-center">
                  <div className="text-3xl font-black text-gray-700">{waitingTickets[0].ticket_number}</div>
                  <p className="text-xs text-gray-500 mt-0.5">{waitingTickets[0].full_name}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center mb-3">Tidak ada antrean</p>
              )}
              <button
                onClick={handleCallNext}
                disabled={calling || waitingTickets.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {calling ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
                {calling ? 'Memanggil...' : 'Panggil Berikutnya'}
              </button>
              {callError && <p className="text-xs text-red-500 text-center mt-2">{callError}</p>}
              <p className="text-xs text-gray-400 text-center mt-2">{waitingTickets.length} antrean tersisa</p>
            </div>
          </div>

          {/* ── Queue List ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-gray-800">Daftar Antrean</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Operasional: Senin – Jumat, 08.00 – 15.00 WIB</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                  />
                  <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                    {tickets.length} tiket
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">Belum ada antrean hari ini</p>
                  <p className="text-xs text-gray-400 mt-1">Gunakan tombol "Validasi Tiket" untuk memproses kehadiran pengunjung</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                  {tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(t => {
                    const si = getStatusInfo(t.status);
                    const isActive = t.status === 'dipanggil' || t.status === 'dilayani';
                    return (
                      <div
                        key={t.id}
                        className={`px-5 py-3.5 flex items-center gap-3 transition-colors
                          ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`text-base font-black min-w-[52px] ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                          {t.ticket_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800 text-sm truncate">{t.full_name}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${si.bg} ${si.color}`}>
                              {si.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {t.services?.name ?? '-'}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {t.nik.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                        {/* Actions by status */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setDetailTicket(t)}
                            title="Lihat Detail"
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {t.status === 'dalam_antrean' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(t.booking_code, 'selesai')}
                                disabled={!!updatingId}
                                title="Tandai Selesai"
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                              >
                                {updatingId === t.booking_code ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(t.booking_code, 'lewat')}
                                disabled={!!updatingId}
                                title="Tandai Tidak Hadir"
                                className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-200"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-blue-400 ml-1" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && tickets.length > itemsPerPage && (
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    Menampilkan <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, tickets.length)}</span> dari <span className="font-semibold text-gray-700">{tickets.length}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-gray-600">
                      {currentPage} / {Math.ceil(tickets.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(tickets.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(tickets.length / itemsPerPage)}
                      className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-blue-500 transition-colors">
            ← Kembali ke Portal Publik
          </Link>
        </div>
      </div>

      {/* ── Validasi Tiket Modal ── */}
      {showValidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowValidate(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500">
              <h3 className="font-bold text-white flex items-center gap-2">
                <TicketCheck className="w-5 h-5" />
                Validasi Tiket Pengunjung
              </h3>
              <button
                onClick={() => setShowValidate(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleValidate} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Masukkan Kode Tiket
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={ticketCode}
                    onChange={e => { setTicketCode(e.target.value.toUpperCase()); setScanResult(null); }}
                    placeholder="Contoh: 123-456789"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-xl font-bold font-mono tracking-widest text-center text-gray-800 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal placeholder:text-base"
                    disabled={validating}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 text-center">
                    Kode tiket ada di e-tiket pengunjung
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={validating || !ticketCode.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {validating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Memvalidasi...</>
                    : <><Search className="w-4 h-4" /> Validasi Tiket</>
                  }
                </button>
              </form>

              {/* Result */}
              {scanResult && (
                <div className={`mt-4 rounded-xl border p-4 flex gap-3 items-start
                  ${scanResult.type === 'success' ? 'bg-green-50 border-green-200' :
                    scanResult.type === 'expired' ? 'bg-red-50 border-red-200' :
                      scanResult.type === 'used' ? 'bg-yellow-50 border-yellow-200' :
                        scanResult.type === 'notyet' ? 'bg-blue-50 border-blue-200' :
                          'bg-red-50 border-red-200'}`}
                >
                  {scanResult.type === 'success'
                    ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    : scanResult.type === 'used'
                      ? <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                      : scanResult.type === 'notyet'
                        ? <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className={`font-bold text-sm
                      ${scanResult.type === 'success' ? 'text-green-800' :
                        scanResult.type === 'used' ? 'text-yellow-800' :
                          scanResult.type === 'notyet' ? 'text-blue-800' :
                            'text-red-800'}`}
                    >
                      {scanResult.type === 'success' ? '✓ Tiket Valid — Masuk Antrean' :
                        scanResult.type === 'expired' ? '✗ Tiket Kadaluarsa' :
                          scanResult.type === 'used' ? '⚠ Tiket Sudah Digunakan' :
                            scanResult.type === 'notyet' ? 'ℹ Bukan Untuk Hari Ini' :
                              '✗ Tiket Tidak Ditemukan'}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{scanResult.message}</p>
                    {scanResult.ticket && (
                      <div className="mt-2 pt-2 border-t border-green-200 text-xs space-y-0.5">
                        <p className="text-green-700"><span className="font-semibold">Nama:</span> {scanResult.ticket.full_name}</p>
                        <p className="text-green-700"><span className="font-semibold">No. Antrean:</span> {scanResult.ticket.ticket_number}</p>
                        <p className="text-green-700"><span className="font-semibold">Layanan:</span> {scanResult.ticket.services?.name ?? '-'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── Detail Tiket Modal ── */}
      {detailTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setDetailTicket(null); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detail Tiket Pengunjung
              </h3>
              <button
                onClick={() => setDetailTicket(null)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Nomor Antrean</p>
                  <p className="font-bold text-gray-900">{detailTicket.ticket_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Kode Booking</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded">{detailTicket.booking_code}</p>
                    <button
                      onClick={() => handleCopy(detailTicket.booking_code)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                      title="Salin Kode Booking"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Nama Lengkap</p>
                  <p className="font-bold text-gray-900">{detailTicket.full_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">NIK</p>
                  <p className="font-bold text-gray-900 font-mono">{detailTicket.nik}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">No. Telepon</p>
                  <p className="font-bold text-gray-900">{detailTicket.phone_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                  <p className="font-bold text-gray-900">{detailTicket.email || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Layanan</p>
                  <p className="font-bold text-gray-900">{detailTicket.services?.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Sesi</p>
                  <p className="font-bold text-gray-900">{detailTicket.sessions?.name} ({detailTicket.sessions?.start_time} - {detailTicket.sessions?.end_time})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Footer */}
      <div className="mt-auto text-center text-xs text-gray-400 py-6 space-y-1">
        <p>© {new Date().getFullYear()} Badan Pendapatan Daerah Kabupaten Garut</p>
        <p>Jl. Otista No.278, Sukagalih, Kec. Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bg }: { label: string; value: number; icon: React.ReactNode; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-4 border border-white/50 shadow-sm`}>
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-xs font-medium text-gray-600">{label}</p></div>
      <p className="text-3xl font-black text-gray-800">{value}</p>
    </div>
  );
}
