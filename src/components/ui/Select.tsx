import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
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
  searchable?: boolean;
}

const Select = ({ options, value, onChange, placeholder = 'Seleccionar', className = '', searchable = false }: Props) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref       = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);
  const filtered = searchable && query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && searchable) setTimeout(() => searchRef.current?.focus(), 50);
    if (!open) setQuery('');
  }, [open, searchable]);

  const pick = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

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
            {searchable && (
              <div className="px-3 pt-3 pb-2 border-b border-gray-100">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && setOpen(false)}
                    placeholder="Buscar..."
                    className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/15 placeholder-gray-400"
                  />
                </div>
              </div>
            )}
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Sin resultados</p>
              ) : filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => pick(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                    value === opt.value ? 'text-navy font-semibold bg-navy/5' : 'text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;
