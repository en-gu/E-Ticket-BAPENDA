import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface RouteParams { params: Promise<{ id: string }> }

// PATCH /api/admin/services/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const allowed = ['name', 'code', 'description', 'requirements', 'is_active'];
    const payload: Record<string, unknown> = {};
    for (const k of allowed) if (body[k] !== undefined) payload[k] = body[k];
    if (payload.code) payload.code = (payload.code as string).toUpperCase();

    const { data, error } = await supabaseAdmin.from('services').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data, message: 'Layanan berhasil diperbarui' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui layanan' }, { status: 500 });
  }
}

// DELETE /api/admin/services/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    // Soft delete: set is_active = false to preserve data integrity
    const { error } = await supabaseAdmin.from('services').update({ is_active: false }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Layanan berhasil dinonaktifkan' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Gagal menonaktifkan layanan' }, { status: 500 });
  }
}
