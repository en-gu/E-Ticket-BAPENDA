import { RelationType, TicketStatus } from './types';

/**
 * Generate kode booking unik: format XXX-XXXXXX
 */
export function generateBookingCode(): string {
  const prefix = Math.floor(Math.random() * 900 + 100).toString();
  const suffix = Math.floor(Math.random() * 900000 + 100000).toString();
  return `${prefix}-${suffix}`;
}

/**
 * Generate nomor tiket berformat A-001, A-002, dst.
 */
export function generateTicketNumber(count: number): string {
  return `A-${String(count).padStart(3, '0')}`;
}

/**
 * Format tanggal Indonesia: "Senin, 10 Oktober 2025"
 */
export function formatDateIndonesia(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format tanggal pendek: "10 Oktober 2025"
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format waktu dibuat: "08-Oktober-2025 • 10:26 WIB"
 */
export function formatCreatedAt(dateStr: string): string {
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart} • ${timePart} WIB`;
}

/**
 * Label tipe hubungan
 */
export function getRelationLabel(type: RelationType): string {
  const labels: Record<RelationType, string> = {
    wajib_pajak_sendiri: 'Wajib Pajak Sendiri',
    anggota_keluarga: 'Anggota Keluarga',
    kuasa_notaris_ppat: 'Kuasa / Notaris / PPAT',
    badan_usaha_instansi: 'Badan Usaha / Instansi',
  };
  return labels[type] ?? type;
}

/**
 * Label dan warna status tiket
 */
export function getStatusInfo(status: TicketStatus): { label: string; color: string; bg: string } {
  const map: Record<TicketStatus, { label: string; color: string; bg: string }> = {
    terjadwal: { label: 'Aktif', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    dalam_antrean: { label: 'Digunakan', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
    dipanggil: { label: 'Dipanggil', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    dilayani: { label: 'Sedang Dilayani', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    selesai: { label: 'Selesai', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    lewat: { label: 'Kadaluarsa', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  };
  return map[status] ?? { label: status, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' };
}

/**
 * Validasi NIK 16 digit
 */
export function validateNIK(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}

/**
 * Validasi nomor WhatsApp Indonesia
 */
export function validatePhoneNumber(phone: string): boolean {
  return /^(08|628|\+628)\d{8,12}$/.test(phone.replace(/\s|-/g, ''));
}

/**
 * Normalisasi nomor WhatsApp ke format 08xx
 */
export function normalizePhone(phone: string): string {
  const clean = phone.replace(/\s|-/g, '');
  if (clean.startsWith('+62')) return '0' + clean.slice(3);
  if (clean.startsWith('628')) return '0' + clean.slice(2);
  return clean;
}

/**
 * Generate data URL untuk QR code
 */
export async function generateQRDataURL(text: string): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(text, {
    width: 200,
    margin: 2,
    color: { dark: '#1e3a5f', light: '#ffffff' },
  });
}

/**
 * Hitung hari kerja berikutnya (Senin-Jumat)
 */
export function getNextWorkingDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = new Date(today);

  // Kumpulkan 5 hari kerja berikutnya (termasuk hari ini jika hari kerja)
  while (days.length < 5) {
    const dayOfWeek = current.getDay();
    // Senin (1) s/d Jumat (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      days.push(`${year}-${month}-${day}`);
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Format nomor WhatsApp untuk link wa.me
 */
export function getWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePhone(phone);
  const intl = '62' + normalized.slice(1);
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}
