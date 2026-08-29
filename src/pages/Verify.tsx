import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OtpVerification from '../components/auth/OtpVerification';
import { ArrowLeft } from 'lucide-react';

export default function Verify() {
  const { completeAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = (location.state as { email?: string } | null)?.email;

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <OtpVerification
        email={email}
        onVerified={(token, user) => {
          completeAuth(token, user);
          navigate('/', { replace: true });
        }}
      />

      <Link
        to="/login"
        className="relative z-10 mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>
    </div>
  );
}
