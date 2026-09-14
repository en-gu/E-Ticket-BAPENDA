import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// POST /api/petugas/panggil - panggil nomor berikutnya
export async function POST() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Set semua yang sedang 'dipanggil' menjadi 'dilayani' (jika belum ditandai)
    await supabaseAdmin
      .from('tickets')
      .update({ status: 'dilayani' })
      .eq('visit_date', today)
      .eq('status', 'dipanggil');

    // Ambil tiket berikutnya: status 'dalam_antrean', urut by created_at
    const { data: next, error } = await supabaseAdmin
      .from('tickets')
      .select('*, services(*), sessions(*)')
      .eq('visit_date', today)
      .eq('status', 'dalam_antrean')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !next) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada antrean yang menunggu' },
        { status: 400 }
      );
    }

    // Update status menjadi 'dipanggil'
    const { data: called, error: updateErr } = await supabaseAdmin
      .from('tickets')
      .update({ status: 'dipanggil' })
      .eq('id', next.id)
      .select('*, services(*), sessions(*)')
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: `Nomor ${called.ticket_number} berhasil dipanggil`,
      data: called,
    });
  } catch (err) {
    console.error('Call next error:', err);
    return NextResponse.json({ success: false, message: 'Gagal memanggil nomor berikutnya' }, { status: 500 });
  }
}
