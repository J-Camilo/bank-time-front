import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type Type = 'success' | 'error' | 'info';
interface Toast { id: number; msg: string; type: Type; }

const Ctx = createContext<{ show: (msg: string, type?: Type) => void }>({ show: () => {} });

export const useToast = () => useContext(Ctx);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let id = 0;

  const show = useCallback((msg: string, type: Type = 'success') => {
    const t = { id: ++id, msg, type };
    setToasts(p => [...p, t]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3500);
  }, []);

  const icons = { success: <CheckCircle size={16} className="text-green-500" />, error: <XCircle size={16} className="text-red-500" />, info: <AlertCircle size={16} className="text-blue-500" /> };

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg min-w-[280px]"
            >
              {icons[t.type]}
              <span className="text-sm text-gray-700">{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
};
