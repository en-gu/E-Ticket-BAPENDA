import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET /api/petugas/antrian - daftar tiket hari ini
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('tickets')
      .select('*, services(*), sessions(*)')
      .eq('visit_date', date)
      .order('created_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Get antrian error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data antrean' }, { status: 500 });
  }
}
