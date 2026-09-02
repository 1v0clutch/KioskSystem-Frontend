import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClass?: string;
  onClose: () => void;
}

export default function Modal({
  open,
  title,
  description,
  children,
  footer,
  maxWidthClass = 'max-w-3xl',
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close modal"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`animate-scale-in relative flex max-h-[92vh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/20`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-base font-bold text-slate-900 sm:text-lg">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin sm:px-6">{children}</div>
        {footer && <footer className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">{footer}</footer>}
      </section>
    </div>
  );
}
