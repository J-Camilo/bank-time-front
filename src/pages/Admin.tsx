import { useState, useEffect, useCallback } from 'react';
import { Users, FileText, BarChart2, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../services/admin';
import { useToast } from '../components/ui/Toast';

type Tab = 'stats' | 'usuarios' | 'publicaciones';

interface Stats {
  total_usuarios: number;
  usuarios_activos: number;
  total_publicaciones: number;
  publicaciones_activas: number;
  total_intercambios: number;
  intercambios_completados: number;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  es_admin: boolean;
  creditos_disponibles: number;
  created_at: string;
}

interface Publicacion {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  creditos_hora: number;
  nombre: string;
  apellido: string;
  categoria_nombre: string | null;
  fecha_expiracion: string;
}

const StatCard = ({ label, value, sub }: { label: string; value: number; sub?: string }) => (
  <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-ui)' }}>
    <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
    <p className="text-3xl font-black text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function Admin() {
  const { show } = useToast();
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [uPage, setUPage] = useState(1);
  const [pPage, setPPage] = useState(1);
  const [uTotal, setUTotal] = useState(0);
  const [pTotal, setPTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const LIMIT = 10;

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminService.getStats();
      setStats(r.data);
    } catch { show('Error al cargar estadísticas', 'error'); }
    finally { setLoading(false); }
  }, [show]);

  const loadUsuarios = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const r = await adminService.listarUsuarios({ page, limit: LIMIT });
      setUsuarios(r.data.data ?? r.data);
      setUTotal(r.data.total ?? r.data.length);
    } catch { show('Error al cargar usuarios', 'error'); }
    finally { setLoading(false); }
  }, [show]);

  const loadPublicaciones = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const r = await adminService.listarPublicaciones({ page, limit: LIMIT });
      setPublicaciones(r.data.data ?? r.data);
      setPTotal(r.data.total ?? r.data.length);
    } catch { show('Error al cargar publicaciones', 'error'); }
    finally { setLoading(false); }
  }, [show]);

  useEffect(() => {
    if (tab === 'stats') loadStats();
    if (tab === 'usuarios') loadUsuarios(uPage);
    if (tab === 'publicaciones') loadPublicaciones(pPage);
  }, [tab, uPage, pPage, loadStats, loadUsuarios, loadPublicaciones]);

  const toggleUsuario = async (u: Usuario) => {
    try {
      await adminService.toggleActivarUsuario(u.id);
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x));
      show(`Usuario ${u.activo ? 'desactivado' : 'activado'}`);
    } catch { show('Error al cambiar estado', 'error'); }
  };

  const eliminarPublicacion = async (id: number) => {
    if (!confirm('¿Eliminar esta publicación?')) return;
    try {
      await adminService.eliminarPublicacion(id);
      setPublicaciones(prev => prev.filter(p => p.id !== id));
      show('Publicación eliminada');
    } catch (err: any) {
      show(err.response?.data?.error || 'Error al eliminar', 'error');
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'stats', label: 'Estadísticas', icon: <BarChart2 size={15} /> },
    { key: 'usuarios', label: 'Usuarios', icon: <Users size={15} /> },
    { key: 'publicaciones', label: 'Publicaciones', icon: <FileText size={15} /> },
  ];

  const uPages = Math.ceil(uTotal / LIMIT);
  const pPages = Math.ceil(pTotal / LIMIT);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Panel de Administración</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gestión de la plataforma BOTIme</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Cargando...</p>}

      {/* Stats */}
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Total usuarios" value={stats.total_usuarios} sub={`${stats.usuarios_activos} activos`} />
          <StatCard label="Publicaciones" value={stats.total_publicaciones} sub={`${stats.publicaciones_activas} activas`} />
          <StatCard label="Intercambios" value={stats.total_intercambios} sub={`${stats.intercambios_completados} completados`} />
        </div>
      )}

      {/* Usuarios */}
      {tab === 'usuarios' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Correo</th>
                  <th className="px-4 py-3 text-center">Créditos</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {u.nombre} {u.apellido}
                      {u.es_admin && <span className="ml-2 text-[10px] bg-navy text-white px-1.5 py-0.5 rounded-full">Admin</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.correo}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{u.creditos_disponibles}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!u.es_admin && (
                        <button
                          onClick={() => toggleUsuario(u)}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
                        >
                          {u.activo ? <ToggleRight size={14} className="text-green-500" /> : <ToggleLeft size={14} className="text-gray-400" />}
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {uPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setUPage(p => Math.max(1, p - 1))} disabled={uPage === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-500">{uPage} / {uPages}</span>
              <button onClick={() => setUPage(p => Math.min(uPages, p + 1))} disabled={uPage === uPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Publicaciones */}
      {tab === 'publicaciones' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Título</th>
                  <th className="px-4 py-3 text-left">Autor</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {publicaciones.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{p.titulo}</td>
                    <td className="px-4 py-3 text-gray-500">{p.nombre} {p.apellido}</td>
                    <td className="px-4 py-3 text-gray-500">{p.categoria_nombre ?? <span className="text-gray-300 italic">Sin categoría</span>}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.estado === 'ABIERTO' ? 'bg-green-100 text-green-700' :
                        p.estado === 'CERRADO' ? 'bg-gray-100 text-gray-500' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => eliminarPublicacion(p.id)}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setPPage(p => Math.max(1, p - 1))} disabled={pPage === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-500">{pPage} / {pPages}</span>
              <button onClick={() => setPPage(p => Math.min(pPages, p + 1))} disabled={pPage === pPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
