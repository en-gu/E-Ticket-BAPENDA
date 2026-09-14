import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface RouteParams {
  params: Promise<{ code: string }>;
}

// GET /api/tickets/[code] - cek tiket by booking code
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;

    const searchParams = _req.nextUrl.searchParams;
    const phone = searchParams.get('phone');

    let query = supabaseAdmin
      .from('tickets')
      .select('*, services(*), sessions(*)')
      .or(`booking_code.eq.${code},nik.eq.${code}`);

    if (phone) {
      query = query.eq('phone_number', phone);
    }

    const { data: ticket, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { success: false, message: 'Terjadi kesalahan pada database' },
        { status: 500 }
      );
    }

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (err) {
    console.error('Get ticket error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data tiket' }, { status: 500 });
  }
}

// PATCH /api/tickets/[code] - update status atau data tiket (oleh petugas/admin)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await req.json();

    const allowedFields: Record<string, boolean> = {
      status: true,
      full_name: true,
      nik: true,
      phone_number: true,
      email: true,
      relation_type: true,
      service_id: true,
      session_id: true,
      visit_date: true,
    };

    const updatePayload: Record<string, unknown> = {};

    for (const key of Object.keys(body)) {
      if (allowedFields[key]) {
        updatePayload[key] = body[key];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, message: 'Tidak ada field yang valid untuk diupdate' }, { status: 400 });
    }

    // Validate status if provided
    if (updatePayload.status) {
      const validStatuses = ['terjadwal', 'dalam_antrean', 'dipanggil', 'dilayani', 'selesai', 'lewat'];
      if (!validStatuses.includes(updatePayload.status as string)) {
        return NextResponse.json({ success: false, message: 'Status tidak valid' }, { status: 400 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .update(updatePayload)
      .eq('booking_code', code)
      .select('*, services(*), sessions(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, message: 'Data tiket berhasil diperbarui' });
  } catch (err) {
    console.error('Update ticket error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengupdate data tiket' }, { status: 500 });
  }
}
