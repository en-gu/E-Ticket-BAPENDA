import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { booking_code } = await req.json();

    if (!booking_code) {
      return NextResponse.json({ success: false, message: 'Kode Tiket wajib diisi' }, { status: 400 });
    }

    // Cari tiket berdasarkan booking_code beserta data sesinya
    const { data: ticket, error } = await supabaseAdmin
      .from('tickets')
      .select('*, sessions(*)')
      .eq('booking_code', booking_code.toUpperCase())
      .single();

    if (error || !ticket) {
      return NextResponse.json({ success: false, message: 'Tiket tidak ditemukan. Pastikan Kode Tiket benar.' }, { status: 404 });
    }

    // Jika tiket sudah kadaluarsa
    if (ticket.status === 'lewat') {
      return NextResponse.json({ success: false, message: 'Tiket sudah kadaluarsa dan tidak dapat digunakan.', code: 'EXPIRED' }, { status: 400 });
    }

    // Jika tiket sudah digunakan/sedang antre
    if (ticket.status !== 'terjadwal') {
      return NextResponse.json({ success: false, message: 'Tiket ini sudah pernah digunakan sebelumnya.', code: 'USED' }, { status: 400 });
    }

    // Cek tanggal kunjungan
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (ticket.visit_date !== todayStr) {
      if (ticket.visit_date > todayStr) {
        return NextResponse.json({ success: false, message: 'Tiket ini berlaku untuk tanggal kunjungan yang akan datang.', code: 'NOT_YET' }, { status: 400 });
      }
      // Lewat hari kunjungan
      await supabaseAdmin.from('tickets').update({ status: 'lewat' }).eq('id', ticket.id);
      return NextResponse.json({ success: false, message: 'Tiket sudah kadaluarsa (melewati hari kunjungan).', code: 'EXPIRED' }, { status: 400 });
    }

    // Cek batas waktu sesi
    if (ticket.sessions?.end_time) {
      const parts = ticket.sessions.end_time.split(':');
      const sessionEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2] || '0'));
      if (now > sessionEnd) {
        await supabaseAdmin.from('tickets').update({ status: 'lewat' }).eq('id', ticket.id);
        return NextResponse.json({ success: false, message: `Tiket sudah kadaluarsa (batas sesi ${ticket.sessions.name} pukul ${ticket.sessions.end_time} WIB).`, code: 'EXPIRED' }, { status: 400 });
      }
    }

    // Validasi sukses — ubah status jadi dalam_antrean (Digunakan)
    const { error: updateError } = await supabaseAdmin
      .from('tickets')
      .update({ status: 'dalam_antrean' })
      .eq('id', ticket.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `Tiket ${ticket.ticket_number} atas nama ${ticket.full_name} berhasil divalidasi.`,
      data: { ...ticket, status: 'dalam_antrean' }
    });

  } catch (err) {
    console.error('Validate ticket error:', err);
    return NextResponse.json({ success: false, message: 'Gagal memproses validasi tiket.' }, { status: 500 });
  }
}
