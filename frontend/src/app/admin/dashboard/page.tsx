'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Service, Session, Ticket, RelationType } from '@/lib/types';
import { getStatusInfo, formatDateShort } from '@/lib/utils';
import {
  Settings, Users, BarChart3, LogOut, Plus, Edit2, Trash2,
  Loader2, CheckCircle, XCircle, RefreshCw, ShieldCheck,
  FileText, Search, X, Save, AlertCircle, ChevronLeft, ChevronRight,
  User, Phone, Mail, Calendar, Clock, Building2, CalendarDays, BadgeCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Tab = 'tiket' | 'layanan' | 'sesi' | 'laporan';

const RELATION_LABELS: Record<string, string> = {
  wajib_pajak_sendiri: 'Wajib Pajak Sendiri',
  anggota_keluarga: 'Anggota Keluarga',
  kuasa_notaris_ppat: 'Kuasa / Notaris / PPAT',
  badan_usaha_instansi: 'Badan Usaha / Instansi',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'terjadwal', label: 'Aktif' },
  { value: 'dalam_antrean', label: 'Digunakan' },
  { value: 'dipanggil', label: 'Dipanggil' },
  { value: 'dilayani', label: 'Dilayani' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'lewat', label: 'Kadaluarsa' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('tiket');
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, waiting: 0, serving: 0, done: 0 });

  // ── Tiket tab state ──
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketMeta, setTicketMeta] = useState({ total: 0, totalPages: 1 });
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editForm, setEditForm] = useState<Partial<Ticket>>({});

  // ── Layanan tab state ──
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({});
  const [servicePage, setServicePage] = useState(1);

  // ── Sesi tab state ──
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionForm, setSessionForm] = useState<Partial<Session>>({});

  // ── Laporan tab state ──
  const [reportLoading, setReportLoading] = useState(false);
  const [reportRange, setReportRange] = useState('custom');
  const [reportFrom, setReportFrom] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportTo, setReportTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<any>(null);
  const [reportPage, setReportPage] = useState(1);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; type: 'session' | 'service'; title: string; message: string } | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [svcRes, sessRes, statsRes] = await Promise.all([
        fetch('/api/admin/services'),
        fetch('/api/admin/sessions'),
        fetch('/api/queue/status'),
      ]);
      const [svcData, sessData, statsData] = await Promise.all([
        svcRes.json(), sessRes.json(), statsRes.json(),
      ]);
      if (svcData.success) setServices(svcData.data);
      if (sessData.success) setSessions(sessData.data);
      if (statsData.success) {
        setStats({
          total: statsData.data.total_today || 0,
          waiting: statsData.data.waiting || 0,
          serving: statsData.data.being_served || 0,
          done: statsData.data.completed || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(async (page = 1, search = '', date = '', status = '') => {
    setTicketLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (date) params.set('date', date);
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/tickets?${params}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
        setTicketMeta(data.meta);
      }
    } finally {
      setTicketLoading(false);
    }
  }, []);

  const fetchReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const params = new URLSearchParams({ range: reportRange });
      if (reportRange === 'custom') {
        if (reportFrom) params.set('from', reportFrom);
        if (reportTo) params.set('to', reportTo);
      }
      const res = await fetch(`/api/admin/laporan?${params}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
        setReportPage(1);
      }
    } finally {
      setReportLoading(false);
    }
  }, [reportRange, reportFrom, reportTo]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (tab === 'tiket') fetchTickets(ticketPage, searchQuery, filterDate, filterStatus);
    if (tab === 'laporan') fetchReport();
  }, [tab, ticketPage, filterDate, filterStatus, fetchTickets, fetchReport]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setTicketPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchTickets(1, val, filterDate, filterStatus);
    }, 400);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/petugas/login');
  };

  // ── Tiket Handlers ──
  const openEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditForm({
      full_name: ticket.full_name,
      nik: ticket.nik,
      phone_number: ticket.phone_number,
      email: ticket.email ?? '',
      relation_type: ticket.relation_type,
      district: ticket.district,
      village: ticket.village,
      address: ticket.address,
      service_id: ticket.service_id,
      session_id: ticket.session_id,
      visit_date: ticket.visit_date,
      status: ticket.status,
    });
    setSaveError('');
    setSaveSuccess(false);
  };

  const handleSaveTicket = async () => {
    if (!editingTicket) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/tickets/${editingTicket.booking_code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSaveSuccess(true);
      setTickets(prev => prev.map(t => t.id === editingTicket.id ? { ...t, ...data.data } : t));
      setTimeout(() => setEditingTicket(null), 1000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  // ── Layanan Handlers ──
  const openServiceModal = (service?: Service) => {
    setSaveError('');
    setSaveSuccess(false);
    if (service) {
      setEditingService(service);
      setServiceForm(service);
    } else {
      setEditingService(null);
      setServiceForm({ is_active: true });
    }
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const method = editingService ? 'PATCH' : 'POST';
      const url = editingService ? `/api/admin/services/${editingService.id}` : '/api/admin/services';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSaveSuccess(true);
      await fetchAll();
      setTimeout(() => setShowServiceModal(false), 1000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan layanan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      id,
      type: 'service',
      title: 'Nonaktifkan Layanan',
      message: 'Apakah Anda yakin ingin menonaktifkan layanan ini? Layanan tidak akan tersedia lagi untuk pendaftaran baru.'
    });
  };

  // ── Sesi Handlers ──
  const openSessionModal = (session?: Session) => {
    setSaveError('');
    setSaveSuccess(false);
    if (session) {
      setEditingSession(session);
      setSessionForm(session);
    } else {
      setEditingSession(null);
      setSessionForm({ is_active: true });
    }
    setShowSessionModal(true);
  };

  const handleSaveSession = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const method = editingSession ? 'PATCH' : 'POST';
      const url = editingSession ? `/api/admin/sessions/${editingSession.id}` : '/api/admin/sessions';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSaveSuccess(true);
      await fetchAll();
      setTimeout(() => setShowSessionModal(false), 1000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan sesi');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      id,
      type: 'session',
      title: 'Hapus Sesi Permanen',
      message: 'Apakah Anda yakin ingin menghapus sesi ini secara permanen? Sesi ini akan hilang dari sistem.'
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      const endpoint = deleteConfirm.type === 'session' ? `/api/admin/sessions/${deleteConfirm.id}` : `/api/admin/services/${deleteConfirm.id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        await fetchAll();
        setDeleteConfirm(null);
      } else {
        throw new Error('Gagal memproses permintaan');
      }
    } catch (err) {
      alert(deleteConfirm.type === 'session' ? 'Gagal menghapus sesi' : 'Gagal menonaktifkan layanan');
    } finally {
      setSaving(false);
    }
  };


  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tiket', label: 'Data Tiket', icon: <FileText className="w-4 h-4" /> },
    { id: 'layanan', label: 'Jenis Layanan', icon: <Settings className="w-4 h-4" /> },
    { id: 'sesi', label: 'Sesi & Kuota', icon: <Users className="w-4 h-4" /> },
    { id: 'laporan', label: 'Laporan', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar (Bapenda Theme) */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
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

      {/* Header Admin */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Panel Admin</h1>
              <p className="text-xs text-gray-500">Bapenda Kab. Garut</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">


        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap
                  ${tab === t.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {loading && tab !== 'tiket' && tab !== 'laporan' ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="p-5">

              {/* ── Tab: Data Tiket ── */}
              {tab === 'tiket' && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => handleSearchChange(e.target.value)}
                        placeholder="Cari nama, NIK, atau kode tiket..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:flex gap-3">
                      <input
                        type="date"
                        value={filterDate}
                        onChange={e => { setFilterDate(e.target.value); setTicketPage(1); }}
                        className="w-full md:w-auto px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm transition-colors"
                      />
                      <select
                        value={filterStatus}
                        onChange={e => { setFilterStatus(e.target.value); setTicketPage(1); }}
                        className="w-full md:w-auto px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm transition-colors bg-white"
                      >
                        {STATUS_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    {(searchQuery || filterDate || filterStatus) && (
                      <button
                        onClick={() => { setSearchQuery(''); setFilterDate(''); setFilterStatus(''); setTicketPage(1); fetchTickets(1, '', '', ''); }}
                        className="w-full md:w-auto px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm flex items-center justify-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Reset
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{ticketMeta.total} tiket ditemukan</p>
                  </div>

                  {ticketLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">Tidak ada tiket ditemukan</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">No. / Kode</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Pemohon</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Layanan</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tanggal & Sesi</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {tickets.map(t => {
                            const si = getStatusInfo(t.status);
                            return (
                              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <p className="font-black text-gray-800">{t.ticket_number}</p>
                                  <p className="text-xs font-mono text-gray-400">{t.booking_code}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-gray-800 truncate max-w-[150px]">{t.full_name}</p>
                                  <p className="text-xs text-gray-400 font-mono">{t.nik}</p>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell">
                                  <p className="text-gray-700 text-xs font-medium truncate max-w-[160px]">{t.services?.name ?? '-'}</p>
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell">
                                  <p className="text-xs text-gray-600 font-medium">{formatDateShort(t.visit_date)}</p>
                                  <p className="text-xs text-gray-400">{t.sessions?.name ?? '-'}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${si.bg} ${si.color}`}>
                                    {si.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => openEdit(t)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="Edit data tiket"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {ticketMeta.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-gray-500">
                        Halaman {ticketPage} dari {ticketMeta.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTicketPage(p => Math.max(1, p - 1))}
                          disabled={ticketPage === 1}
                          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTicketPage(p => Math.min(ticketMeta.totalPages, p + 1))}
                          disabled={ticketPage === ticketMeta.totalPages}
                          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Layanan ── */}
              {tab === 'layanan' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">Jenis Layanan Perpajakan</h2>
                    <button
                      onClick={() => openServiceModal()}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Layanan
                    </button>
                  </div>
                  <div className="space-y-2">
                    {services.slice((servicePage - 1) * 10, servicePage * 10).map(svc => (
                      <div key={svc.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 transition-colors gap-4 ${svc.is_active ? 'bg-white' : 'bg-gray-50 opacity-70'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-2 h-2 shrink-0 rounded-full ${svc.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{svc.name}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{svc.code}</p>
                            {svc.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{svc.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:shrink-0 ml-5 sm:ml-0">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${svc.is_active ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-400'}`}>
                            {svc.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                          <button onClick={() => openServiceModal(svc)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {svc.is_active && (
                            <button onClick={() => handleDeleteService(svc.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {services.length > 10 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                      <p className="text-xs text-gray-500 font-medium">
                        Menampilkan Halaman {servicePage} dari {Math.ceil(services.length / 10)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setServicePage(p => Math.max(1, p - 1))}
                          disabled={servicePage === 1}
                          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setServicePage(p => Math.min(Math.ceil(services.length / 10), p + 1))}
                          disabled={servicePage === Math.ceil(services.length / 10)}
                          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Sesi ── */}
              {tab === 'sesi' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">Sesi Waktu & Kuota</h2>
                    <button
                      onClick={() => openSessionModal()}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Sesi
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {sessions.map(sess => (
                      <div key={sess.id} className={`border border-gray-100 rounded-xl p-4 ${sess.is_active ? 'bg-white' : 'bg-gray-50 opacity-70'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-bold text-gray-800">{sess.name}</p>
                          {sess.is_active
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <XCircle className="w-4 h-4 text-gray-300" />}
                        </div>
                        <p className="text-2xl font-black text-blue-700 mb-1">
                          {sess.start_time} <span className="text-gray-300 font-medium text-lg">–</span> {sess.end_time}
                        </p>
                        <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-50">
                          <div className="flex gap-1">
                            <button onClick={() => openSessionModal(sess)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteSession(sess.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Tab: Laporan ── */}
              {tab === 'laporan' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Laporan Kunjungan
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input type="date" value={reportFrom} onChange={e => setReportFrom(e.target.value)} className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white" />
                        <span className="text-gray-400 font-medium">s/d</span>
                        <input type="date" value={reportTo} onChange={e => setReportTo(e.target.value)} className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white" />
                      </div>
                      <button onClick={fetchReport} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-blue-700 font-semibold shadow-sm transition-colors">Terapkan</button>
                    </div>
                  </div>

                  {reportLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                  ) : reportData ? (
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Total Tiket Terdaftar
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">Berdasarkan filter rentang tanggal yang Anda pilih.</p>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                          <p className="text-4xl font-black text-blue-600">{reportData.meta.total}</p>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tiket</p>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">No. / Kode</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pemohon</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Layanan</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tanggal & Sesi</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {reportData.tickets && reportData.tickets.length > 0 ? (
                                reportData.tickets.slice((reportPage - 1) * 10, reportPage * 10).map((t: any) => {
                                  const si = getStatusInfo(t.status);
                                  return (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4">
                                        <p className="font-black text-gray-800">{t.ticket_number}</p>
                                        <p className="text-xs font-mono text-gray-400 mt-1">{t.booking_code}</p>
                                      </td>
                                      <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800 truncate max-w-[150px]">{t.full_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{t.nik}</p>
                                      </td>
                                      <td className="px-6 py-4 hidden md:table-cell">
                                        <p className="text-gray-700 font-medium truncate max-w-[160px]">{t.services?.name ?? '-'}</p>
                                      </td>
                                      <td className="px-6 py-4 hidden lg:table-cell">
                                        <p className="text-gray-700 font-medium">{formatDateShort(t.visit_date)}</p>
                                        <p className="text-xs text-gray-500 mt-1">{t.sessions?.name ?? '-'}</p>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${si.bg} ${si.color}`}>
                                          {si.label}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={5} className="text-center py-12 text-gray-400">
                                    <FileText className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                                    Tidak ada tiket di rentang tanggal ini.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {reportData.tickets && reportData.tickets.length > 10 && (
                          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
                            <p className="text-xs text-gray-500 font-medium">
                              Menampilkan Halaman {reportPage} dari {Math.ceil(reportData.tickets.length / 10)}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setReportPage(p => Math.max(1, p - 1))}
                                disabled={reportPage === 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setReportPage(p => Math.min(Math.ceil(reportData.tickets.length / 10), p + 1))}
                                disabled={reportPage === Math.ceil(reportData.tickets.length / 10)}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto text-center text-xs text-gray-400 py-6 space-y-1">
          <p>© {new Date().getFullYear()} Badan Pendapatan Daerah Kabupaten Garut</p>
          <p>Jl. Otista No.278, Sukagalih, Kec. Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151</p>
        </div>

      </div>

      {/* ── Modal Edit Tiket ── */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setEditingTicket(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Edit Data Tiket — {editingTicket.ticket_number}
                </h3>
                <p className="text-blue-100 text-xs mt-0.5">Kode: {editingTicket.booking_code}</p>
              </div>
              <button onClick={() => setEditingTicket(null)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Form Data Diri */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-3">Data Diri Pemohon</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EditField label="Nama Lengkap *"><input type="text" value={editForm.full_name ?? ''} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} className={fieldClass} /></EditField>
                  <EditField label="NIK KTP *"><input type="text" maxLength={16} value={editForm.nik ?? ''} onChange={e => setEditForm(f => ({ ...f, nik: e.target.value.replace(/\D/g, '') }))} className={fieldClass} /></EditField>
                  <EditField label="Nomor Telepon *"><input type="tel" value={editForm.phone_number ?? ''} onChange={e => setEditForm(f => ({ ...f, phone_number: e.target.value }))} className={fieldClass} /></EditField>
                  <EditField label="Email"><input type="email" value={editForm.email ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className={fieldClass} /></EditField>
                </div>
              </div>
              {/* Form Layanan */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-3">Jadwal & Layanan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EditField label="Tanggal Kunjungan *"><input type="date" value={editForm.visit_date ?? ''} onChange={e => setEditForm(f => ({ ...f, visit_date: e.target.value }))} className={fieldClass} /></EditField>
                  <EditField label="Sesi Waktu *">
                    <select value={editForm.session_id ?? ''} onChange={e => setEditForm(f => ({ ...f, session_id: e.target.value }))} className={`${fieldClass} bg-white`}>
                      <option value="">-- Pilih Sesi --</option>
                      {sessions.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </EditField>
                  <EditField label="Jenis Layanan *" className="sm:col-span-2">
                    <select value={editForm.service_id ?? ''} onChange={e => setEditForm(f => ({ ...f, service_id: e.target.value }))} className={`${fieldClass} bg-white`}>
                      <option value="">-- Pilih Layanan --</option>
                      {services.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </EditField>
                </div>
              </div>
              {/* Status */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-3">Status Tiket</h4>
                <EditField label="Status">
                  <select value={editForm.status ?? ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Ticket['status'] }))} className={`${fieldClass} bg-white`}>
                    {STATUS_OPTIONS.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </EditField>
              </div>

              {saveError && <p className="text-sm text-red-500">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-green-600 font-semibold">Berhasil disimpan!</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setEditingTicket(null)} className="px-5 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold">Batal</button>
                <button onClick={handleSaveTicket} disabled={saving} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Layanan ── */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowServiceModal(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h3>
              <button onClick={() => setShowServiceModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <EditField label="Nama Layanan *">
                <input type="text" value={serviceForm.name ?? ''} onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))} className={fieldClass} placeholder="Contoh: Pendaftaran PBB Baru" />
              </EditField>
              <EditField label="Kode Layanan *">
                <input type="text" value={serviceForm.code ?? ''} onChange={e => setServiceForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className={fieldClass} placeholder="Contoh: PBB-NEW" />
              </EditField>
              <EditField label="Deskripsi (Opsional)">
                <textarea value={serviceForm.description ?? ''} onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))} className={`${fieldClass} min-h-[80px]`} placeholder="Deskripsi singkat..." />
              </EditField>
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={serviceForm.is_active} onChange={e => setServiceForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Layanan Aktif</span>
              </label>

              {saveError && <p className="text-sm text-red-500">{saveError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowServiceModal(false)} className="px-5 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold">Batal</button>
                <button onClick={handleSaveService} disabled={saving} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Sesi ── */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowSessionModal(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {editingSession ? 'Edit Sesi' : 'Tambah Sesi Baru'}
              </h3>
              <button onClick={() => setShowSessionModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <EditField label="Nama Sesi *">
                <input type="text" value={sessionForm.name ?? ''} onChange={e => setSessionForm(f => ({ ...f, name: e.target.value }))} className={fieldClass} placeholder="Contoh: Sesi 1 Pagi" />
              </EditField>
              <div className="grid grid-cols-2 gap-4">
                <EditField label="Jam Mulai *">
                  <input type="time" value={sessionForm.start_time ?? ''} onChange={e => setSessionForm(f => ({ ...f, start_time: e.target.value }))} className={fieldClass} />
                </EditField>
                <EditField label="Jam Selesai *">
                  <input type="time" value={sessionForm.end_time ?? ''} onChange={e => setSessionForm(f => ({ ...f, end_time: e.target.value }))} className={fieldClass} />
                </EditField>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={sessionForm.is_active} onChange={e => setSessionForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Sesi Aktif</span>
              </label>

              {saveError && <p className="text-sm text-red-500">{saveError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowSessionModal(false)} className="px-5 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold">Batal</button>
                <button onClick={handleSaveSession} disabled={saving} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal Konfirmasi Hapus ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{deleteConfirm.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{deleteConfirm.message}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={saving} className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold bg-gray-100 hover:bg-gray-200 transition-colors">
                Batal
              </button>
              <button onClick={executeDelete} disabled={saving} className="px-6 py-2.5 rounded-xl text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const fieldClass = 'w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm font-medium transition-colors';

function EditField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
