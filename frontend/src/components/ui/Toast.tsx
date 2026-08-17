import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, ToastType } from '../../context/ToastContext';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  error:   <AlertCircle   className="w-5 h-5 text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  info:    <Info          className="w-5 h-5 text-brand-500 flex-shrink-0" />,
};

const bgColors: Record<ToastType, string> = {
  success: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80',
  error:   'border-red-200 dark:border-red-800 bg-white dark:bg-red-950/80',
  warning: 'border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-950/80',
  info:    'border-brand-200 dark:border-brand-800 bg-white dark:bg-brand-950/80',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-fade-up ${bgColors[toast.type]}`}
          role="alert"
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm text-[var(--color-text)] font-medium leading-snug">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-0.5 rounded transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
