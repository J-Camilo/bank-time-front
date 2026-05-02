import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const Select = ({ options, value, onChange, placeholder = 'Seleccionar', className = '' }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 text-sm text-gray-600 w-full justify-between"
        style={{ boxShadow: 'var(--shadow-ui)' }}
      >
        <span className={selected ? 'text-gray-700' : 'text-gray-400'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 bg-white rounded-2xl overflow-hidden z-50 min-w-full"
            style={{ boxShadow: 'var(--shadow-focus)', top: '3rem' }}
          >
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                  value === opt.value ? 'text-navy font-semibold bg-navy/5' : 'text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;
