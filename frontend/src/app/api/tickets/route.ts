import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const today = new Date().toISOString().split('T')[0];
    const visitDate = body.visit_date ?? today;

    // Count tickets hari ini untuk nomor urut
    const { count } = await supabaseAdmin
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('visit_date', visitDate);

    const ticketCount = (count ?? 0) + 1;
    const ticketNumber = `A-${String(ticketCount).padStart(3, '0')}`;

    // Generate booking code unik
    let bookingCode = '';
    let isUnique = false;
    while (!isUnique) {
      // 6 digits: 100000 to 999999
      bookingCode = Math.floor(Math.random() * 900000 + 100000).toString();

      const { data: existing } = await supabaseAdmin
        .from('tickets')
        .select('id')
        .eq('booking_code', bookingCode)
        .single();

      if (!existing) isUnique = true;
    }

    // QR data: URL untuk cek tiket
    const qrData = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://bapenda-garut.vercel.app'}/tiket/${bookingCode}`;

    // Insert tiket
    const { data: ticket, error } = await supabaseAdmin
      .from('tickets')
      .insert({
        booking_code: bookingCode,
        ticket_number: ticketNumber,
        nik: body.nik,
        full_name: body.full_name,
        phone_number: body.phone_number,
        email: body.email ?? null,
        relation_type: body.relation_type,
        service_id: body.service_id,
        session_id: body.session_id,
        visit_date: body.visit_date,
        status: 'terjadwal',
        qr_data: qrData,
      })
      .select('*, services(*), sessions(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Tiket berhasil dibuat',
      data: ticket,
    }, { status: 201 });

  } catch (err: any) {
    console.error('Create ticket error:', err);
    const message = err?.message || JSON.stringify(err) || 'Gagal membuat tiket';
    return NextResponse.json({ success: false, message, error_detail: err }, { status: 500 });
  }
}
