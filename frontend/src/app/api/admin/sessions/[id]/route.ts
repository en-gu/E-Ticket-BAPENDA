import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface RouteParams { params: Promise<{ id: string }> }

// PATCH /api/admin/sessions/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const allowed = ['name', 'start_time', 'end_time', 'is_active'];
    const payload: Record<string, unknown> = {};
    for (const k of allowed) if (body[k] !== undefined) payload[k] = body[k];

    const { data, error } = await supabaseAdmin.from('sessions').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data, message: 'Sesi berhasil diperbarui' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui sesi' }, { status: 500 });
  }
}

// DELETE /api/admin/sessions/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from('sessions').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Sesi berhasil dihapus' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Gagal menonaktifkan sesi' }, { status: 500 });
  }
}
