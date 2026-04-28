import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { notificacionesService } from '../services/notificaciones';
import { motion, AnimatePresence } from 'framer-motion';

interface Notif { id: number; titulo: string; mensaje: string; leida: boolean; }

const TopBar = () => {
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

  // Close on outside click
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

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 flex-shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-lg">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:border-navy focus:bg-white transition-colors"
          placeholder="Buscar publicación de servicio"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="flex items-center gap-4 ml-6">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Bell size={18} className="text-gray-500" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-sky-mid text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">Sin notificaciones</p>
                  ) : (
                    notifs.map(n => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.leida ? 'bg-blue-50/50' : ''}`}
                      >
                        <p className="text-xs font-semibold text-gray-800 mb-0.5">{n.titulo}</p>
                        <p className="text-xs text-gray-500">{n.mensaje}</p>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User dropdown */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserOpen(p => !p)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-sm font-bold">
              {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-none">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.correo}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white font-bold">
                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user?.nombre} {user?.apellido}</p>
                    <p className="text-xs text-gray-400">{user?.correo}</p>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={() => { navigate('/perfil'); setUserOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings size={14} /> Ir al perfil
                  </button>
                  <button onClick={doLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={14} /> Cerrar sesión
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
