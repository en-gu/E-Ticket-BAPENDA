import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET /api/admin/services - semua layanan (termasuk non-aktif)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .order('name');
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Gagal mengambil data layanan' }, { status: 500 });
  }
}

// POST /api/admin/services - tambah layanan baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, description, requirements, is_active } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, message: 'Nama dan kode layanan wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .insert({ name, code: code.toUpperCase(), description: description ?? '', requirements: requirements ?? [], is_active: is_active ?? true })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data, message: 'Layanan berhasil ditambahkan' }, { status: 201 });
  } catch (err: any) {
    const msg = err?.code === '23505' ? 'Kode layanan sudah digunakan' : 'Gagal menambahkan layanan';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
