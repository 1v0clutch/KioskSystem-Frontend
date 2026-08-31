import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Loader2, Save, UserRound } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const backToHome = () => navigate(user.role === 'admin' ? '/admin' : '/kiosk');

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProfileMessage('');
    setSavingProfile(true);

    try {
      const data = await api.put('/auth/profile', { username, email });
      updateUser(data.user);

      if (data.requires_verification) {
        logout();
        navigate('/verify', { state: { email: data.email, purpose: 'email_change' }, replace: true });
        return;
      }

      setProfileMessage(data.message || 'Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordMessage('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const data = await api.put('/auth/password', {
        current_password: currentPassword,
        password,
        password_confirmation: confirm,
      });
      setPasswordMessage(data.message || 'Password changed successfully.');
      setCurrentPassword('');
      setPassword('');
      setConfirm('');
      logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        <button onClick={backToHome} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <UserRound className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Profile Settings</h1>
              <p className="text-sm text-slate-500">{user.role === 'admin' ? 'Admin account' : 'Customer account'}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {profileMessage && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileMessage}</span>
            </div>
          )}

          <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="profile-username" className="block text-sm font-semibold text-slate-700">Username</label>
              <input id="profile-username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="block text-sm font-semibold text-slate-700">Email</label>
              <input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" required />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={savingProfile} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm disabled:opacity-50">
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-500">You will be asked to log in again.</p>
            </div>
          </div>

          {passwordMessage && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordMessage}</span>
            </div>
          )}

          <form onSubmit={savePassword} className="space-y-4">
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="Current password" required />
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="New password" minLength={8} required />
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="Confirm password" required />
            </div>
            <button type="submit" disabled={savingPassword} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm disabled:opacity-50">
              {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
