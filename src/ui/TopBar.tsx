import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Settings, LogOut, Menu } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { notificacionesService } from '../services/notificaciones';
import { motion, AnimatePresence } from 'framer-motion';

interface Notif { id: number; titulo: string; mensaje: string; leida: boolean; }

interface TopBarProps {
  onMenuClick?: () => void;
}

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  const [search, setSearch]       = useState('');
  const [notifs, setNotifs]       = useState<Notif[]>([]);
  const [unread, setUnread]       = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificacionesService.listar(false)
      .then(r => { setNotifs(r.data); setUnread(r.data.filter((n: Notif) => !n.leida).length); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (n: Notif) => {
    if (!n.leida) {
      await notificacionesService.marcarLeida(n.id).catch(() => {});
      setNotifs(p => p.map(x => x.id === n.id ? { ...x, leida: true } : x));
      setUnread(p => Math.max(0, p - 1));
    }
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) navigate(`/inicio?q=${search}`);
  };

  const doLogout = () => { dispatch(logout()); navigate('/login'); };

  const initials = `${user?.nombre?.charAt(0) ?? ''}${user?.apellido?.charAt(0) ?? ''}`;

  return (
    <header
      className="bg-white rounded-2xl h-14 md:h-16 flex items-center justify-between px-3 md:px-6 lg:px-8"
      style={{ boxShadow: 'var(--shadow-ui)' }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0 mr-2"
        style={{ boxShadow: 'var(--shadow-ui)' }}
      >
        <Menu size={16} className="text-gray-600" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xs md:max-w-md">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          className="w-full pl-10 pr-4 py-2.5 md:py-3 text-sm bg-white rounded-2xl placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-navy/15 transition-all duration-200"
          style={{ boxShadow: 'var(--shadow-ui)' }}
          placeholder="Buscar publicación"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4">
        {/* Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="relative w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gray-50 flex items-center justify-center transition-all duration-200 hover:bg-gray-100"
            style={{ boxShadow: 'var(--shadow-ui)' }}
          >
            <Bell size={16} className={unread > 0 ? 'text-navy' : 'text-gray-500'} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sky-mid text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 w-72 md:w-80 bg-white rounded-2xl overflow-hidden z-50"
                style={{ boxShadow: 'var(--shadow-focus)', top: '3.25rem' }}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">Sin notificaciones</p>
                  ) : notifs.map(n => (
                    <button key={n.id} onClick={() => markRead(n)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.leida ? 'bg-blue-50/40' : ''}`}>
                      <p className="text-xs font-semibold text-gray-800 mb-0.5">{n.titulo}</p>
                      <p className="text-xs text-gray-500">{n.mensaje}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-7 bg-gray-200" />

        {/* User */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserOpen(p => !p)}
            className="flex items-center gap-2 rounded-2xl pl-1 pr-2 md:pr-3 py-1 transition-all duration-200 hover:bg-gray-50"
            style={{ boxShadow: 'var(--shadow-ui)' }}
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-navy flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-[11px] text-gray-400 leading-tight truncate max-w-[140px]">
                {user?.correo}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`hidden sm:block text-gray-400 transition-transform duration-200 flex-shrink-0 ${userOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 w-60 bg-white rounded-2xl overflow-hidden z-50"
                style={{ boxShadow: 'var(--shadow-focus)', top: '3.25rem' }}
              >
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-navy flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {user?.nombre} {user?.apellido}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                      {user?.correo}
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => { navigate('/perfil'); setUserOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <Settings size={14} className="text-gray-400" />
                    Ir al perfil
                  </button>
                  <button
                    onClick={doLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
