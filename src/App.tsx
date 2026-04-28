import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import Nav     from './ui/Nav';
import TopBar  from './ui/TopBar';
import Login   from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inicio   from './pages/Inicio';
import SolicitudesEnviadas   from './pages/SolicitudesEnviadas';
import SolicitudesRecibidas  from './pages/SolicitudesRecibidas';
import Intercambios from './pages/Intercambios';
import Historial   from './pages/Historial';
import Perfil      from './pages/Perfil';

const AppLayout = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const [navOpen, setNavOpen] = useState(false);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row p-2 gap-2 md:p-4 md:gap-4">
      {/* Mobile overlay */}
      {navOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Sidebar: fixed drawer on mobile, flex item on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-40 p-4 transition-transform duration-300
          md:relative md:inset-auto md:z-auto md:flex-shrink-0 md:p-0 md:translate-x-0
          ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Nav onClose={() => setNavOpen(false)} />
      </div>

      {/* Right column */}
      <div className="flex-1 flex flex-col gap-2 min-w-0 md:gap-4">
        <TopBar onMenuClick={() => setNavOpen(p => !p)} />
        <main
          className="flex-1 bg-white rounded-2xl overflow-y-auto"
          style={{ boxShadow: 'var(--shadow-ui)', minHeight: 0 }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AppLayout />}>
          <Route path="/"                       element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"              element={<Dashboard />} />
          <Route path="/inicio"                 element={<Inicio />} />
          <Route path="/solicitudes/mis"        element={<SolicitudesEnviadas />} />
          <Route path="/solicitudes/pendientes" element={<SolicitudesRecibidas />} />
          <Route path="/intercambios"           element={<Intercambios />} />
          <Route path="/historial"              element={<Historial />} />
          <Route path="/perfil"                 element={<Perfil />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
