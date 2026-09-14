'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, RelationType, Service, Session, KECAMATAN_GARUT } from '@/lib/types';
import { validateNIK, validatePhoneNumber, getNextWorkingDays } from '@/lib/utils';
import {
  User, Phone, Mail, MapPin, Building2, Calendar, Clock,
  ChevronRight, ChevronLeft, CheckCircle, Shield, AlertCircle,
  Loader2, FileText
} from 'lucide-react';

const INITIAL_FORM: FormData = {
  nik: '',
  full_name: '',
  relation_type: 'wajib_pajak_sendiri',
  phone_number: '',
  email: '',
  district: '-',
  village: '-',
  address: '-',
  agreed: false,
  visit_date: '',
  session_id: '',
  service_id: '',
};

const STEPS = [
  { id: 1, label: 'Data Diri', sub: 'Langkah Aktif' },
  { id: 2, label: 'Pernyataan', sub: 'Konfirmasi' },
  { id: 3, label: 'Jadwal & Layanan', sub: 'Pilih Waktu' },
  { id: 4, label: 'Tiket Selesai', sub: 'E-Tiket' },
];

const RELATION_OPTIONS: { value: RelationType; label: string; desc: string }[] = [
  { value: 'wajib_pajak_sendiri', label: 'Wajib Pajak Sendiri', desc: 'Pemilik sah yang namanya tertera pada SPPT' },
  { value: 'anggota_keluarga', label: 'Anggota Keluarga', desc: 'Keluarga dalam 1 Kartu Keluarga (KK) / Ahli Waris' },
  { value: 'kuasa_notaris_ppat', label: 'Kuasa / Notaris / PPAT', desc: 'Membawa Surat Kuasa bermaterai dari pemegang hak' },
  { value: 'badan_usaha_instansi', label: 'Badan Usaha / Instansi', desc: 'Perwakilan resmi PT, CV, Yayasan, atau BUMD' },
];

export default function DaftarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionFetchError, setSessionFetchError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [finalAgreed, setFinalAgreed] = useState(false);

  const workingDays = getNextWorkingDays();

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => {
      if (d.success) setServices(d.data);
    });
  }, []);

  const fetchSessions = useCallback(async (date: string) => {
    if (!date) return;
    setLoadingSessions(true);
    setSessionFetchError('');
    setSessions([]);
    try {
      const res = await fetch(`/api/sessions?date=${date}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (d.success) {
        setSessions(d.data ?? []);
      } else {
        setSessionFetchError(d.message ?? 'Gagal memuat sesi');
      }
    } catch (err) {
      console.error('Session fetch error:', err);
      setSessionFetchError('Gagal memuat sesi. Periksa koneksi dan coba lagi.');
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    if (form.visit_date) fetchSessions(form.visit_date);
  }, [form.visit_date, fetchSessions]);

  const set = (key: keyof FormData, val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }));

  const clearError = (key: keyof FormData) =>
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });

  // --- Validation ---
  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.nik) e.nik = 'anda harus memasukan NIK anda';
    else if (!validateNIK(form.nik)) e.nik = 'NIK harus 16 digit angka';
    
    if (form.full_name.trim().length < 3) e.full_name = 'Nama lengkap minimal 3 karakter';
    
    if (!form.relation_type) e.relation_type = 'anda harus memilih status pengunjung';
    
    if (!form.phone_number) e.phone_number = 'Anda harus memasukan No. Telepon anda';
    else if (!validatePhoneNumber(form.phone_number)) e.phone_number = 'Nomor Telepon tidak valid';
    
    return e;
  };

  const validateStep3 = () => {
    const e: typeof errors = {};
    if (!form.visit_date) e.visit_date = 'Pilih tanggal kunjungan';
    if (!form.session_id) e.session_id = 'Pilih sesi waktu';
    if (!form.service_id) e.service_id = 'Pilih jenis layanan';
    return e;
  };

  const handleNext = () => {
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    if (step === 2 && !form.agreed) {
      setErrors({ agreed: 'Centang pernyataan terlebih dahulu' });
      return;
    }
    if (step === 3) {
      const e = validateStep3();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!finalAgreed) {
      setSubmitError('Anda harus menyetujui pernyataan konfirmasi terlebih dahulu.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        nik: form.nik,
        full_name: form.full_name,
        relation_type: form.relation_type,
        phone_number: form.phone_number,
        email: form.email || undefined,
        district: form.district,
        village: form.village,
        address: form.address,
        service_id: form.service_id,
        session_id: form.session_id,
        visit_date: form.visit_date,
      };
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      router.push(`/tiket/${data.data.booking_code}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSession = sessions.find(s => s.id === form.session_id);
  const selectedService = services.find(s => s.id === form.service_id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900">Form Pendaftaran Antrean</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 && 'Silakan lengkapi data diri Anda dengan benar sesuai identitas KTP yang masih berlaku.'}
            {step === 2 && 'Silakan konfirmasi pernyataan pemohon sebelum memilih jadwal kedatangan'}
            {step === 3 && 'Badan Pendapatan Daerah Kabupaten Garut'}
            {step === 4 && 'Pastikan data permohonan dan jadwal pelayanan Anda sudah sesuai.'}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                    ${done ? 'bg-blue-600 border-blue-600 text-white' : active ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' : 'bg-white border-gray-300 text-gray-400'}`}
                >
                  {done ? <CheckCircle className="w-5 h-5" /> : s.id}
                </div>
                <p className={`text-xs font-semibold hidden sm:block ${active ? 'text-blue-600' : done ? 'text-blue-500' : 'text-gray-400'}`}>
                  {s.label}
                </p>
                {active && (
                  <p className="text-xs text-blue-400 hidden sm:block">{s.sub}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          {/* Step 1: Data Diri */}
          {step === 1 && (
            <div className="p-6 space-y-5">
              <SectionHeader icon={<User className="w-5 h-5 text-blue-500" />} title="Identitas Pengunjung" desc="Pastikan NIK terdaftar dan data sesuai kartu tanda penduduk" />

              <FormField label="Nomor Induk Kependudukan (NIK)" required hint={`${form.nik.length}/16 Digit`} error={errors.nik}>
                <div className="relative">
                  <input
                    id="nik"
                    type="text"
                    maxLength={16}
                    value={form.nik}
                    onChange={e => { set('nik', e.target.value.replace(/\D/g, '')); clearError('nik'); }}
                    placeholder="Masukkan 16 digit NIK Anda (Contoh: 3205...)"
                    className={inputClass(errors.nik)}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  ⓘ NIK digunakan untuk mencocokkan data objek pajak daerah (PBB-P2 / BPHTB).
                </p>
              </FormField>

              <FormField label="Nama Lengkap Pemohon" required error={errors.full_name}>
                <input
                  id="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={e => { set('full_name', e.target.value); clearError('full_name'); }}
                  placeholder="Nama lengkap sesuai e-KTP"
                  className={inputClass(errors.full_name)}
                />
              </FormField>

              <FormField label="Status Hubungan Dengan Objek Pajak" required error={errors.relation_type}>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    id="relation_type"
                    value={form.relation_type}
                    onChange={e => { set('relation_type', e.target.value); clearError('relation_type'); }}
                    className={`${inputClass(errors.relation_type)} pl-10 appearance-none bg-white`}
                  >
                    <option value="" disabled hidden>-- Pilih Status Pengunjung --</option>
                    {RELATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nomor Telepon Aktif" required error={errors.phone_number}>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="phone_number"
                    type="tel"
                    value={form.phone_number}
                    onChange={e => { set('phone_number', e.target.value); clearError('phone_number'); }}
                    placeholder="Contoh: 08123456789"
                    className={`${inputClass(errors.phone_number)} pl-10`}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Nomor kontak telepon aktif yang dapat dihubungi</p>
                </FormField>

                <FormField label="Alamat Email Pemohon" error={errors.email}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="contoh: warga@gmail.com"
                      className={`${inputClass(errors.email)} pl-10`}
                    />
                  </div>
                </FormField>
              </div>

              {/* Security box removed */}
            </div>
          )}

          {/* Step 2: Pernyataan */}
          {step === 2 && (
            <div className="p-6 space-y-5">
              <SectionHeader icon={<FileText className="w-5 h-5 text-blue-500" />} title="Pernyataan Pemohon" desc="Pastikan Anda memahami dan menyetujui ketentuan pelayanan berikut" />

              <div className="space-y-3">
                <PernyataanItem
                  icon={<Clock className="w-5 h-5 text-blue-500" />}
                  title="Datang tepat waktu sesuai jadwal yang dipilih"
                  desc="Hadir minimal 15 menit sebelum jam sesi loket dimulai untuk verifikasi nomor tiket."
                />
                <PernyataanItem
                  icon={<FileText className="w-5 h-5 text-blue-500" />}
                  title="Membawa Data yang diperlukan sesuai kebutuhan berkas dokumen asli/fotokopi"
                  desc="Dokumen persyaratan lengkap sesuai jenis layanan yang diajukan (PBB, BPHTB, dll)."
                />
                <PernyataanItem
                  icon={<CheckCircle className="w-5 h-5 text-blue-500" />}
                  title="Data yang diisi adalah benar dan dapat dipertanggungjawabkan"
                  desc="Kesesuaian data pemohon demi kelancaran proses validasi petugas."
                />
              </div>

              <label
                className={`flex gap-3 items-start p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${form.agreed ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                  ${errors.agreed ? 'border-red-400 bg-red-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={e => { set('agreed', e.target.checked); clearError('agreed'); }}
                  className="mt-0.5 w-4 h-4 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Saya telah membaca dan menyetujui pernyataan di atas</p>
                  <p className="text-xs text-gray-500 mt-0.5">Centang kotak ini untuk mengkonfirmasi</p>
                </div>
              </label>
              {errors.agreed && <p className="text-xs text-red-500">{errors.agreed}</p>}
            </div>
          )}

          {/* Step 3: Detail Kedatangan */}
          {step === 3 && (
            <div className="p-6 space-y-5">
              <SectionHeader icon={<Calendar className="w-5 h-5 text-blue-500" />} title="Detail Rencana Kedatangan" desc="Pilih tanggal, sesi waktu, dan jenis layanan perpajakan" />

              {/* Lokasi */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-100">
                    <Building2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Bapenda Kab. Garut</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      Jl. Otista No.278, Sukagalih, Tarogong Kidul, Kabupaten Garut 44151
                    </p>
                  </div>
                </div>
              </div>

              {/* Tanggal */}
              <FormField label="Tanggal Kunjungan" required error={errors.visit_date}>
                <input
                  id="visit_date"
                  type="date"
                  min={workingDays[0]}
                  max={workingDays[workingDays.length - 1]}
                  value={form.visit_date}
                  onChange={e => { set('visit_date', e.target.value); set('session_id', ''); clearError('visit_date'); }}
                  className={inputClass(errors.visit_date)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  ⓘ Pelayanan loket aktif pada hari kerja: Senin s/d Jumat (08.00 – 15.00 WIB)
                </p>
              </FormField>

              {/* Sesi */}
              <FormField label="Pilih Sesi Waktu Kedatangan" required error={errors.session_id}>

                {/* Belum pilih tanggal */}
                {!form.visit_date && !loadingSessions && (
                  <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 shrink-0" />
                    Pilih tanggal kunjungan terlebih dahulu
                  </div>
                )}

                {/* Loading */}
                {loadingSessions && (
                  <div className="flex items-center gap-2 py-4 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Memuat sesi tersedia...</span>
                  </div>
                )}

                {/* Error fetch */}
                {!loadingSessions && sessionFetchError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm">{sessionFetchError}</p>
                    <button
                      type="button"
                      onClick={() => fetchSessions(form.visit_date)}
                      className="ml-auto text-xs font-semibold text-blue-600 hover:underline shrink-0"
                    >
                      Coba lagi
                    </button>
                  </div>
                )}

                {/* Sesi tersedia */}
                {!loadingSessions && !sessionFetchError && form.visit_date && sessions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                    {sessions.filter(s => s.is_active).map(sess => {
                      const selected = form.session_id === sess.id;
                      
                      // Check if session has passed (if date is today)
                      let isPast = false;
                      const today = new Date();
                      const localDateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
                      
                      if (form.visit_date === localDateStr) {
                        const currentMinutes = today.getHours() * 60 + today.getMinutes();
                        const [endH, endM] = sess.end_time.split(':').map(Number);
                        const endMinutes = (endH * 60) + (endM || 0);
                        if (currentMinutes > endMinutes) isPast = true;
                      }

                      return (
                        <button
                          key={sess.id}
                          type="button"
                          disabled={isPast}
                          onClick={() => { if (!isPast) { set('session_id', sess.id); clearError('session_id'); } }}
                          className={`p-3.5 rounded-xl border-2 text-left transition-all relative overflow-hidden
                            ${isPast ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' :
                              selected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-xs font-bold ${isPast ? 'text-gray-400' : 'text-gray-700'}`}>{sess.name}</p>
                            {selected && <CheckCircle className="w-4 h-4 text-blue-500" />}
                          </div>
                          <p className={`text-sm font-bold ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>{sess.start_time} – {sess.end_time}</p>
                          {isPast && <span className="absolute top-0 right-0 bg-red-100 text-red-600 text-[9px] font-bold px-2 py-1 rounded-bl-lg">Berakhir</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sesi kosong (tanggal sudah dipilih tapi tidak ada sesi) */}
                {!loadingSessions && !sessionFetchError && form.visit_date && sessions.length === 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm">Tidak ada sesi tersedia untuk tanggal ini. Pilih tanggal lain.</p>
                  </div>
                )}
              </FormField>

              {/* Jenis Layanan */}
              <FormField label="Jenis Layanan Perpajakan" required error={errors.service_id}>
                <select
                  id="service_id"
                  value={form.service_id}
                  onChange={e => { set('service_id', e.target.value); clearError('service_id'); }}
                  className={`${inputClass(errors.service_id)} appearance-none`}
                >
                  <option value="">-- Pilih Jenis Layanan --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </FormField>

              {/* Persyaratan berkas (Dihilangkan) */}
            </div>
          )}

          {/* Step 4: Konfirmasi */}
          {step === 4 && (
            <div className="p-6 space-y-5">
              <div className="text-center mb-2">
                <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  ✓ Langkah Terakhir
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-2">Konfirmasi Tiket Antrean</h2>
                <p className="text-sm text-gray-500">Pastikan data permohonan dan jadwal pelayanan Anda sudah sesuai.</p>
              </div>

              <ConfirmRow icon={<Building2 className="w-4 h-4 text-gray-400" />} label="Kantor Tujuan" value="Bapenda Kab. Garut" sub="Jl. Otista No.278, Sukagalih, Kec. Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151" />
              <ConfirmRow icon={<User className="w-4 h-4 text-gray-400" />} label="Nama Pemohon" value={form.full_name} sub={`NIK: ${form.nik}`} />
              <ConfirmRow icon={<FileText className="w-4 h-4 text-gray-400" />} label="Jenis Layanan Perpajakan" value={selectedService?.name ?? '-'} />
              <div className="grid grid-cols-2 gap-3">
                <ConfirmRow icon={<Calendar className="w-4 h-4 text-gray-400" />} label="Tanggal Kunjungan" value={new Date(form.visit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <ConfirmRow icon={<Clock className="w-4 h-4 text-gray-400" />} label="Jam & Sesi Pelayanan" value={selectedSession ? `${selectedSession.name} (${selectedSession.start_time} – ${selectedSession.end_time} WIB)` : '-'} />
              </div>

              <label className="flex gap-3 items-start p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all">
                <input 
                  type="checkbox" 
                  checked={finalAgreed} 
                  onChange={(e) => {
                    setFinalAgreed(e.target.checked);
                    if (e.target.checked) setSubmitError('');
                  }} 
                  className="mt-0.5 w-4 h-4 accent-blue-600" 
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Saya menyatakan data yang saya isi benar dan siap hadir tepat waktu.</p>
                  <p className="text-xs text-gray-500 mt-0.5">Centang untuk memverifikasi pendaftaran tiket antrean ini.</p>
                </div>
              </label>

              {submitError && (
                <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-sm">{submitError}</p>
                </div>
              )}

              {/* Notifikasi info box removed */}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-6 pb-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => step === 1 ? router.push('/') : setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
              >
                {step === 3 ? 'Lanjut ke Konfirmasi' : `Lanjut ke Tahap ${step + 1}`}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm disabled:opacity-60 transition-all"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><FileText className="w-4 h-4" /> Simpan &amp; Dapatkan Tiket</>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---
function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 items-start pb-2 border-b border-gray-100">
      <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
      <div>
        <h2 className="font-bold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

function FormField({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function PernyataanItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
      <div className="p-1.5 bg-white rounded-lg border border-gray-100 shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ConfirmRow({ icon, label, value, sub, badge }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; badge?: string;
}) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <p className="text-sm font-bold text-gray-900">{value}</p>
          {badge && (
            <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{badge}</span>
          )}
        </div>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const inputClass = (error?: string) =>
  `w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all outline-none
  ${error ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 bg-white focus:border-blue-500 hover:border-gray-300'}`;
