import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

// ── Protected layout ─────────────────────────────────────────
const AppLayout = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4">
      <div className="w-full max-w-[1280px] bg-white rounded-2xl shadow-card overflow-hidden flex"
        style={{ minHeight: 'calc(100vh - 32px)' }}>
        <Nav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto bg-white">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AppLayout />}>
          <Route path="/"                      element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"             element={<Dashboard />} />
          <Route path="/inicio"                element={<Inicio />} />
          <Route path="/solicitudes/mis"       element={<SolicitudesEnviadas />} />
          <Route path="/solicitudes/pendientes" element={<SolicitudesRecibidas />} />
          <Route path="/intercambios"          element={<Intercambios />} />
          <Route path="/historial"             element={<Historial />} />
          <Route path="/perfil"                element={<Perfil />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
