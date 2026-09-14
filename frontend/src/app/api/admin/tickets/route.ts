import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET /api/admin/tickets - list semua tiket dengan filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const search = searchParams.get('search'); // search by name, NIK, or booking code
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('tickets')
      .select('*, services(*), sessions(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (date) query = query.eq('visit_date', date);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,nik.ilike.%${search}%,booking_code.ilike.%${search}%,ticket_number.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      meta: { total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) }
    });
  } catch (err) {
    console.error('Admin get tickets error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data tiket' }, { status: 500 });
  }
}
