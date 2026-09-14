import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET /api/admin/sessions - semua sesi (termasuk non-aktif)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .order('start_time');
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Gagal mengambil data sesi' }, { status: 500 });
  }
}

// POST /api/admin/sessions - tambah sesi baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, start_time, end_time, is_active } = body;

    if (!name || !start_time || !end_time) {
      return NextResponse.json({ success: false, message: 'Nama, jam mulai, dan jam selesai wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert({ name, start_time, end_time, is_active: is_active ?? true })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data, message: 'Sesi berhasil ditambahkan' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Gagal menambahkan sesi' }, { status: 500 });
  }
}
