import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Get services error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data layanan' }, { status: 500 });
  }
}
