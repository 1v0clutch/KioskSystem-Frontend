import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import AuthLayout from '../components/auth/AuthLayout';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email;
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        password,
        password_confirmation: confirm,
      });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Enter reset code" subtitle="Create a new password">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slide-down">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {done && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm animate-slide-down">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Password reset. Returning to login...</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="reset-code" className="block text-sm font-semibold text-slate-700">Code</label>
          <input id="reset-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="6-digit code" inputMode="numeric" minLength={6} maxLength={6} required autoFocus />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reset-password" className="block text-sm font-semibold text-slate-700">New password</label>
          <input id="reset-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" minLength={8} required />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reset-confirm" className="block text-sm font-semibold text-slate-700">Confirm password</label>
          <input id="reset-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" required />
        </div>

        <button type="submit" disabled={loading || done} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Reset Password
        </button>

        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </form>
    </AuthLayout>
  );
}
