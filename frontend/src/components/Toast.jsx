import { useEffect } from 'react';
import { IconCheck, IconClose } from './icons.jsx';

/** Floating confirmation toast that auto-dismisses. */
const Toast = ({ message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-teal-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
        <IconCheck className="h-4 w-4" />
      </span>
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <button type="button" onClick={onClose} className="ml-1 text-slate-400 hover:text-slate-600" aria-label="Dismiss">
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
