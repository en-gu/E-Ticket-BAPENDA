import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rangeType = searchParams.get('range') ?? 'today';
    const customFrom = searchParams.get('from');
    const customTo = searchParams.get('to');

    const now = new Date();
    let fromDate: string;
    let toDate: string;

    if (rangeType === 'week') {
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      fromDate = monday.toISOString().split('T')[0];
      toDate = sunday.toISOString().split('T')[0];
    } else if (rangeType === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Fix timezone offset issues when converting to ISO string
      const offset = firstDay.getTimezoneOffset() * 60000;
      fromDate = new Date(firstDay.getTime() - offset).toISOString().split('T')[0];
      toDate = new Date(lastDay.getTime() - offset).toISOString().split('T')[0];
    } else if (rangeType === 'custom' && customFrom && customTo) {
      fromDate = customFrom;
      toDate = customTo;
    } else {
      fromDate = now.toISOString().split('T')[0];
      toDate = fromDate;
    }

    const { data: tickets, error } = await supabaseAdmin
      .from('tickets')
      .select('*, services(name), sessions(name)')
      .gte('visit_date', fromDate)
      .lte('visit_date', toDate)
      .order('visit_date', { ascending: false });

    if (error) throw error;

    const total = tickets?.length ?? 0;
    const statusCount: Record<string, number> = {};
    const perLayanan: Record<string, number> = {};
    const perSesi: Record<string, number> = {};
    const relationCount: Record<string, number> = {
      'wajib_pajak_sendiri': 0,
      'anggota_keluarga': 0,
      'kuasa_notaris_ppat': 0,
      'badan_usaha_instansi': 0,
    };

    let totalSelesai = 0;
    let totalLewat = 0;

    for (const t of tickets ?? []) {
      statusCount[t.status] = (statusCount[t.status] ?? 0) + 1;

      if (t.status === 'selesai' || t.status === 'dilayani') totalSelesai++;
      if (t.status === 'lewat') totalLewat++;

      const svcName = t.services?.name ?? 'Tidak Diketahui';
      perLayanan[svcName] = (perLayanan[svcName] ?? 0) + 1;

      const sessName = t.sessions?.name ?? 'Tidak Diketahui';
      perSesi[sessName] = (perSesi[sessName] ?? 0) + 1;

      if (t.relation_type) {
        relationCount[t.relation_type] = (relationCount[t.relation_type] ?? 0) + 1;
      }
    }

    // Attendance Rate = (Total - Lewat) / Total
    const attendanceRate = total > 0 ? ((total - totalLewat) / total) * 100 : 0;
    const completionRate = total > 0 ? (totalSelesai / total) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        meta: {
          from: fromDate,
          to: toDate,
          total,
          attendanceRate: attendanceRate.toFixed(1),
          completionRate: completionRate.toFixed(1),
          totalSelesai,
          totalLewat
        },
        byStatus: statusCount,
        byRelation: relationCount,
        byLayanan: Object.entries(perLayanan).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        bySesi: Object.entries(perSesi).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        tickets: tickets,
      }
    });
  } catch (err) {
    console.error('Laporan error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data laporan' }, { status: 500 });
  }
}
