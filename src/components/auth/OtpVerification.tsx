import { useEffect, useRef, useState } from 'react';
import { api } from '../../api/client';
import { Loader2, AlertCircle, MailCheck, RefreshCw } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onVerified: (token: string, user: { id: number; username: string; email: string; role: string }) => void;
}

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain || name.length <= 2) return email;
  return `${name[0]}${'*'.repeat(Math.min(name.length - 1, 5))}${name.slice(-1)}@${domain}`;
}

export default function OtpVerification({ email, onVerified }: OtpVerificationProps) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setDigits(Array(CODE_LENGTH).fill(''));
    setError('');
    setSuccess(false);
    setCooldown(RESEND_SECONDS);
    const timer = setTimeout(() => inputsRef.current[0]?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const submitCode = async (code: string) => {
    setError('');
    setVerifying(true);
    try {
      const data = await api.post('/auth/verify-registration', { email, code });
      setSuccess(true);
      setTimeout(() => onVerified(data.token, data.user), 700);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    if (!char && value !== '') return;

    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError('');

    if (char && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    const code = next.join('');
    if (code.length === CODE_LENGTH && !next.includes('')) {
      submitCode(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = '';
        setDigits(next);
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('').map((_, i) => pasted[i] ?? '');
    setDigits(next);
    const firstEmpty = next.findIndex((d) => d === '');
    const focusIndex = firstEmpty === -1 ? CODE_LENGTH - 1 : firstEmpty;
    inputsRef.current[focusIndex]?.focus();
    if (pasted.length === CODE_LENGTH && !next.includes('')) {
      submitCode(pasted);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/auth/resend-otp', { email });
      setCooldown(RESEND_SECONDS);
      setDigits(Array(CODE_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-strong rounded-3xl shadow-2xl shadow-black/10 border border-white/20 p-8 animate-scale-in relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-7 h-7 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Verify your email</h2>
          <p className="text-sm text-slate-500 mt-2">
            We sent a 6-digit code to
            <br />
            <span className="font-semibold text-slate-700">{maskEmail(email)}</span>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 animate-slide-down">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={verifying || success}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border outline-none transition-all disabled:opacity-60 ${
                digit
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200'
              }`}
            />
          ))}
        </div>

        {verifying && (
          <p className="text-center text-sm text-indigo-600 font-medium mb-4 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying...
          </p>
        )}

        {success && (
          <p className="text-center text-sm text-emerald-600 font-medium mb-4">Verified! Signing you in...</p>
        )}

        <p className="text-center text-sm text-slate-500">
          Didn't receive the code?{' '}
          {cooldown > 0 ? (
            <span className="text-slate-400 font-medium">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors disabled:opacity-50"
            >
              {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Resend code
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
