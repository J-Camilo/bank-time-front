import { Link, useLocation } from 'react-router-dom';
import { Landmark } from 'lucide-react';

interface NavItemProps {
  to: string;
  label: string;
  sub?: boolean;
}

const NavItem = ({ to, label, sub }: NavItemProps) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
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

const Nav = () => {
  const { pathname } = useLocation();
  const inSolicitudes = pathname.startsWith('/solicitudes');

  return (
    <aside className="w-52 bg-white border-r border-gray-100 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Landmark size={22} className="text-navy" />
          <span className="text-navy font-bold text-xl tracking-tight">BOTIme.</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-0.5">
        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/inicio" label="Inicio" />

        {/* Solicitudes group */}
        <div className="py-1">
          <span className={`block py-2 text-sm pl-3 border-l-2 border-transparent transition-colors ${
            inSolicitudes ? 'text-navy font-semibold' : 'text-gray-500'
          }`}>
            Solicitudes
          </span>
          <NavItem to="/solicitudes/mis" label="Mis solicitudes" sub />
          <NavItem to="/solicitudes/pendientes" label="Solicitudes pendientes" sub />
        </div>

        <NavItem to="/intercambios" label="Intercambio" />
        <NavItem to="/historial" label="Historial" />
      </nav>
    </aside>
  );
};

export default Nav;
