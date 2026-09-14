import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Hitung statistik hari ini
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .select('status')
      .eq('visit_date', today);

    if (error) throw error;

    const total_today = data?.length ?? 0;
    const waiting = data?.filter(t => ['dalam_antrean', 'dipanggil'].includes(t.status)).length ?? 0;
    const being_served = data?.filter(t => t.status === 'dilayani').length ?? 0;
    const completed = data?.filter(t => t.status === 'selesai').length ?? 0;

    return NextResponse.json({
      success: true,
      data: { total_today, waiting, being_served, completed },
    });
  } catch (err) {
    console.error('Queue status error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil status antrean' }, { status: 500 });
  }
}
