import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const alertStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  },
  error: {
    bg: 'bg-rose-50 border-rose-200 text-rose-800',
    icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  },
  info: {
    bg: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  },
};

const ToastAlert = ({
  type = 'info',
  message,
  onClose,
  className = '',
}) => {
  if (!message) return null;

  const style = alertStyles[type] || alertStyles.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${className}`}
      role="alert"
    >
      {style.icon}
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ToastAlert;

