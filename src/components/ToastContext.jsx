/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Map());

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  const toast = useCallback((msg, type = 'success', duration = 4000) => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, msg, type }]);
    const timer = window.setTimeout(() => {
      timers.current.delete(id);
      setToasts((current) => current.filter((item) => item.id !== id));
    }, duration);
    timers.current.set(id, timer);
  }, []);

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`
              pointer-events-auto px-6 py-4 rounded-2xl glass border shadow-2xl min-w-[300px] relative
              animate-in slide-in-from-right-full duration-500 flex items-center gap-4 pr-12
              ${t.type === 'success' ? 'border-green-500/20' : t.type === 'error' ? 'border-red-500/20' : 'border-primary/20'}
            `}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0
              ${t.type === 'success' ? 'bg-green-500/10 text-green-500' : t.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}
            `}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '!' : 'i'}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-40">
                {t.type === 'success' ? 'Confirmed' : t.type === 'error' ? 'Alert' : 'Notice'}
              </span>
              <span className="text-sm font-semibold text-foreground/90 leading-tight">{t.msg}</span>
            </div>
            <button 
              onClick={() => dismiss(t.id)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-1"
              aria-label="Close notification"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};


export const useToast = () => useContext(ToastContext);

