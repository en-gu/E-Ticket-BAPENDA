import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET /api/sessions?date=2025-10-10 - ambil sesi dengan kuota tersedia
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

    // Ambil semua sesi aktif
    const { data: sessions, error: sessError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('is_active', true)
      .order('start_time');

    if (sessError) throw sessError;

    return NextResponse.json({ success: true, data: sessions });
  } catch (err) {
    console.error('Get sessions error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data sesi' }, { status: 500 });
  }
}
