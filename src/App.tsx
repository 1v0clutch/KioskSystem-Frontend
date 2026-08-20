import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import CustomerKiosk from './pages/CustomerKiosk';
import AdminDashboard from './pages/AdminDashboard';
import { Package } from 'lucide-react';

function MainContent() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Loading system...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;
  if (user.role === 'admin') return <AdminDashboard user={user} onLogout={logout} />;
  return <CustomerKiosk user={user} onLogout={logout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
