/**
 * CareerPilot – Toast Notification System
 * =========================================
 * Drop-in toast hook + renderer. Import `useToast` in any component.
 *
 * Usage:
 *   const { toasts, addToast } = useToast();
 *   // then somewhere in JSX: <ToastContainer toasts={toasts} />
 *
 *   addToast('Application submitted!', 'success');
 *   addToast('Something went wrong.', 'error');
 *   addToast('Fetching data…', 'info');
 */

import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

// ─── Individual Toast ─────────────────────────────────────────────────────────
const Toast = ({ toast, onRemove }) => {
  const styles = {
    success: {
      wrapper: 'border-emerald-500/30 bg-slate-900/95',
      icon: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
      bar: 'bg-emerald-500',
      text: 'text-emerald-300',
    },
    error: {
      wrapper: 'border-red-500/30 bg-slate-900/95',
      icon: <AlertCircle size={16} className="text-red-400 shrink-0" />,
      bar: 'bg-red-500',
      text: 'text-red-300',
    },
    info: {
      wrapper: 'border-cyan-500/30 bg-slate-900/95',
      icon: <Info size={16} className="text-cyan-400 shrink-0" />,
      bar: 'bg-cyan-500',
      text: 'text-cyan-300',
    },
  };

  const s = styles[toast.type] || styles.info;

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm w-80 max-w-full overflow-hidden animate-slide-in ${s.wrapper}`}
      style={{ animation: 'slideIn 0.25s ease-out' }}
    >
      {s.icon}
      <p className={`flex-1 text-xs font-medium leading-snug ${s.text}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 rounded text-slate-500 hover:text-white transition-colors shrink-0"
      >
        <X size={12} />
      </button>
      {/* Progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${s.bar} opacity-60`}
        style={{ animation: 'shrink 4s linear forwards' }}
      />
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// ─── Container ────────────────────────────────────────────────────────────────
export const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

export default Toast;
