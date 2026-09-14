import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// POST /api/auth/login - login petugas/admin
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password diperlukan' },
        { status: 400 }
      );
    }

    // Gunakan maybeSingle() agar tidak error saat baris tidak ditemukan
    const { data: officer, error } = await supabaseAdmin
      .from('officers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      // Error DB nyata (bukan "not found")
      console.error('DB error saat login:', error.code, error.message);
      return NextResponse.json(
        { success: false, message: `Gagal mengakses database: ${error.message}` },
        { status: 500 }
      );
    }

    // Officer tidak ditemukan
    if (!officer) {
      return NextResponse.json(
        { success: false, message: 'Email tidak terdaftar atau akun nonaktif' },
        { status: 401 }
      );
    }

    // Bandingkan password dengan password_hash di DB (plain text untuk demo)
    const passwordMatch = password === officer.password_hash;

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Hapus password_hash dari response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _removed, ...officerData } = officer;

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: officerData,
    });

    // Set session cookie (8 jam)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 8,
      path: '/',
    };

    response.cookies.set('officer_id', officer.id, cookieOptions);
    response.cookies.set('officer_role', officer.role, cookieOptions);
    response.cookies.set('officer_name', officer.full_name, cookieOptions);

    return response;
  } catch (err) {
    console.error('Login error tidak terduga:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/login - logout
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  response.cookies.delete('officer_id');
  response.cookies.delete('officer_role');
  response.cookies.delete('officer_name');
  return response;
}
