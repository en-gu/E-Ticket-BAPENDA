import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// POST /api/petugas/checkin - check-in tiket saat tiba di kantor
export async function POST(req: NextRequest) {
  try {
    const { booking_code } = await req.json();

    if (!booking_code) {
      return NextResponse.json({ success: false, message: 'Kode booking diperlukan' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: ticket, error: findErr } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('booking_code', booking_code)
      .eq('visit_date', today)
      .single();

    if (findErr || !ticket) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan atau bukan untuk hari ini' },
        { status: 404 }
      );
    }

    if (ticket.status !== 'terjadwal') {
      return NextResponse.json(
        { success: false, message: `Tiket sudah berstatus: ${ticket.status}` },
        { status: 400 }
      );
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('tickets')
      .update({ status: 'dalam_antrean' })
      .eq('id', ticket.id)
      .select('*, services(*), sessions(*)')
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: `Check-in berhasil. Nomor antrean Anda: ${updated.ticket_number}`,
      data: updated,
    });
  } catch (err) {
    console.error('Check-in error:', err);
    return NextResponse.json({ success: false, message: 'Gagal melakukan check-in' }, { status: 500 });
  }
}
