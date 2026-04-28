import { Link, useLocation } from 'react-router-dom';
import { Landmark, X } from 'lucide-react';

interface NavItemProps {
  to: string;
  label: string;
  sub?: boolean;
  onClose?: () => void;
}

const NavItem = ({ to, label, sub, onClose }: NavItemProps) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      onClick={onClose}
      className={`block py-2 text-sm transition-colors duration-150 ${
        sub ? 'ml-3' : ''
      } ${
        active
          ? 'text-navy font-bold border-l-2 border-navy pl-3 -ml-px'
          : 'text-gray-500 hover:text-navy pl-3 border-l-2 border-transparent'
      }`}
    >
      {label}
    </Link>
  );
};

interface NavProps {
  onClose?: () => void;
}

const Nav = ({ onClose }: NavProps) => {
  const { pathname } = useLocation();
  const inSolicitudes = pathname.startsWith('/solicitudes');

  return (
    <aside
      className="w-52 bg-white rounded-2xl flex flex-col flex-shrink-0 overflow-hidden"
      style={{ height: 'calc(100vh - 2rem)', boxShadow: 'var(--shadow-ui)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-100/60 flex items-center justify-between">
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2">
          <Landmark size={22} className="text-navy" />
          <span className="text-navy font-bold text-xl tracking-tight">BOTIme.</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-0.5">
        <NavItem to="/dashboard" label="Dashboard" onClose={onClose} />
        <NavItem to="/inicio" label="Inicio" onClose={onClose} />

        <div className="py-1">
          <span className={`block py-2 text-sm pl-3 border-l-2 border-transparent transition-colors ${
            inSolicitudes ? 'text-navy font-semibold' : 'text-gray-500'
          }`}>
            Solicitudes
          </span>
          <NavItem to="/solicitudes/mis" label="Mis solicitudes" sub onClose={onClose} />
          <NavItem to="/solicitudes/pendientes" label="Solicitudes pendientes" sub onClose={onClose} />
        </div>

        <NavItem to="/intercambios" label="Intercambio" onClose={onClose} />
        <NavItem to="/historial" label="Historial" onClose={onClose} />
      </nav>
    </aside>
  );
};

export default Nav;
