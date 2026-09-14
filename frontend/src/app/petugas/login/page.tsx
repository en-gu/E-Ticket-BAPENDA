'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2, AlertCircle, BadgeCheck } from 'lucide-react';

export default function PetugasLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const role = data.data?.role;
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/petugas/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Portal Petugas</h1>
          <p className="text-blue-200 text-sm mt-1">Bapenda Kabupaten Garut</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BadgeCheck className="w-5 h-5 text-blue-500" />
            <p className="text-sm font-semibold text-gray-600">Login Akun Resmi Petugas / Admin</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@bapenda.garut.go.id"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm font-medium transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex gap-2 items-center bg-red-50 border border-red-200 rounded-xl p-3 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              id="btn-login"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm transition-all disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Memverifikasi...' : 'Login'}
            </button>
          </form>


        </div>

        <p className="text-center text-blue-200/60 text-xs mt-5">
          © {new Date().getFullYear()} Bapenda Kab. Garut — Sistem Antrean Digital
        </p>
      </div>
    </div>
  );
}
