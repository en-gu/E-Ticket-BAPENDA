// TypeScript interfaces untuk seluruh sistem Bapenda Garut

export interface Service {
  id: string;
  name: string;
  code: string;
  description: string;
  requirements: string[];
  is_active: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  quota: number;
  is_active: boolean;
}

export interface SessionWithAvailability extends Session {
  booked_count: number;
  available_quota: number;
}

export type RelationType = 
  | ''
  | 'wajib_pajak_sendiri' 
  | 'anggota_keluarga' 
  | 'kuasa_notaris_ppat' 
  | 'badan_usaha_instansi';

export type TicketStatus = 
  | 'terjadwal' 
  | 'dalam_antrean' 
  | 'dipanggil' 
  | 'dilayani' 
  | 'selesai' 
  | 'lewat';

export interface Ticket {
  id: string;
  booking_code: string;
  ticket_number: string;
  nik: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  district: string;
  village: string;
  address: string;
  relation_type: RelationType;
  service_id: string;
  session_id: string;
  visit_date: string;
  status: TicketStatus;
  qr_data: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  services?: Service;
  sessions?: Session;
}

export interface QueueStatus {
  total_today: number;
  waiting: number;
  being_served: number;
  completed: number;
}

export interface Officer {
  id: string;
  full_name: string;
  role: 'petugas' | 'admin';
  is_active: boolean;
}

// Form step data types
export interface Step1Data {
  nik: string;
  full_name: string;
  relation_type: RelationType;
  phone_number: string;
  email: string;
  district: string;
  village: string;
  address: string;
}

export interface Step2Data {
  agreed: boolean;
}

export interface Step3Data {
  visit_date: string;
  session_id: string;
  service_id: string;
}

export interface FormData extends Step1Data, Step2Data, Step3Data {}

export interface CreateTicketPayload {
  nik: string;
  full_name: string;
  relation_type: RelationType;
  phone_number: string;
  email?: string;
  district: string;
  village: string;
  address: string;
  service_id: string;
  session_id: string;
  visit_date: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Kecamatan di Garut
export const KECAMATAN_GARUT = [
  'Tarogong Kidul', 'Tarogong Kaler', 'Garut Kota', 'Karangpawitan',
  'Wanaraja', 'Sucinaraja', 'Pangatikan', 'Sukawening', 'Karangtengah',
  'Banyuresmi', 'Leles', 'Leuwigoong', 'Cibatu', 'Kersamanah', 'Cibiuk',
  'Kadungora', 'Blubur Limbangan', 'Selaawi', 'Malangbong', 'Balubur Limbangan',
  'Singajaya', 'Cihurip', 'Peundeuy', 'Banjarwangi', 'Cisurupan',
  'Cikajang', 'Pamulihan', 'Bayongbong', 'Cigedug', 'Cilawu',
  'Pasirwangi', 'Samarang', 'Paseh', 'Bungbulang', 'Mekarmukti',
  'Pakenjeng', 'Cikelet', 'Pameungpeuk', 'Cisompet', 'Talegong',
  'Lebaksiuh', 'Caringin', 'Sukaresmi'
].sort();
