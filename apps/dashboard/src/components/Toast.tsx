'use client';

import { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, { wrapper: string; icon: React.ReactNode; bar: string }> = {
  success: {
    wrapper: 'border-green-200 bg-white',
    icon: <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />,
    bar: 'bg-green-500',
  },
  error: {
    wrapper: 'border-red-200 bg-white',
    icon: <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />,
    bar: 'bg-red-500',
  },
  warning: {
    wrapper: 'border-amber-200 bg-white',
    icon: <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />,
    bar: 'bg-amber-500',
  },
  info: {
    wrapper: 'border-blue-200 bg-white',
    icon: <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />,
    bar: 'bg-blue-500',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const duration = toast.duration ?? 4000;
  const styles = TOAST_STYLES[toast.type];

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    // Trigger enter animation
    const enter = requestAnimationFrame(() => setVisible(true));
    // Auto-dismiss
    const timer = setTimeout(dismiss, duration);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(timer);
    };
  }, [dismiss, duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        relative w-80 rounded-2xl border shadow-lg overflow-hidden
        transition-all duration-300 ease-out
        ${styles.wrapper}
        ${visible && !exiting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
      `}
    >
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${styles.bar}`}
        style={{
          animation: `shrink ${duration}ms linear forwards`,
        }}
      />
      <style>{`@keyframes shrink { from { width: 100% } to { width: 0% } }`}</style>

      <div className="flex items-start gap-3 p-4">
        {styles.icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // max 5 stacked
  }, []);

  const ctx: ToastContextValue = {
    toast: add,
    success: (title, message) => add({ type: 'success', title, message }),
    error: (title, message) => add({ type: 'error', title, message }),
    warning: (title, message) => add({ type: 'warning', title, message }),
    info: (title, message) => add({ type: 'info', title, message }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
