import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastInput {
  type?: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  notify: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-indigo-200 bg-indigo-50 text-indigo-700',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  info: 'text-indigo-600',
};

function ToastIcon({ type }: { type: ToastType }) {
  const className = `w-5 h-5 ${iconStyles[type]}`;

  if (type === 'success') return <CheckCircle2 className={className} />;
  if (type === 'warning') return <AlertCircle className={className} />;
  if (type === 'error') return <XCircle className={className} />;
  return <Info className={className} />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const toast: Toast = {
      id,
      type: input.type ?? 'info',
      title: input.title,
      message: input.message,
    };

    setToasts((current) => [toast, ...current].slice(0, 4));
    window.setTimeout(() => dismiss(id), 3200);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-slide-down rounded-2xl border p-4 shadow-lg shadow-slate-200/60 ${toastStyles[toast.type]}`}
          >
            <div className="flex items-start gap-3">
              <ToastIcon type={toast.type} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-5">{toast.title}</p>
                {toast.message && <p className="mt-0.5 text-xs leading-5 opacity-80">{toast.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-lg p-1 transition-colors hover:bg-white/60"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
