'use client';

import { QueueStatus } from '@/lib/types';
import { Users, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

export default function StatsWidget() {
  const [stats, setStats] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/queue/status');
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const items = [
    {
      label: 'Total Antrean Hari Ini',
      value: stats?.total_today ?? 0,
      unit: 'Orang',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Dalam Antrean (Menunggu)',
      value: stats?.waiting ?? 0,
      unit: 'Nomor',
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      valueColor: 'text-amber-600',
    },
    {
      label: 'Sedang Dilayani',
      value: stats?.being_served ?? 0,
      unit: 'Nomor',
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-100',
      valueColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 p-4 rounded-xl border ${item.border} ${item.bg} shadow-sm`}
        >
          <div className={`p-2.5 rounded-lg bg-white shadow-sm`}>{item.icon}</div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium leading-snug">{item.label}</p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
            ) : (
              <p className={`text-2xl font-bold ${item.valueColor ?? 'text-gray-800'}`}>
                {item.value}{' '}
                <span className="text-sm font-normal text-gray-500">{item.unit}</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
