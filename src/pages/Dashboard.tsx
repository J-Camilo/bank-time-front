import { useEffect, useState } from 'react';
import { Plus, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { publicacionesService } from '../services/publicaciones';
import { usuariosService } from '../services/usuarios';
import { PublicacionFormModal } from '../components/Modals/PublicacionFormModal';
import { useToast } from '../components/ui/Toast';
import dayjs from 'dayjs';

export default function Dashboard() {
  const user = useSelector((s: RootState) => s.auth.user);
  const navigate = useNavigate();
  const { show } = useToast();
  const [pubs, setPubs]         = useState<any[]>([]);
  const [creditos, setCreditos] = useState<any>({});
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState(false);
  const [editPub, setEditPub]   = useState<any>(null);
  const PER_PAGE = 6;

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([publicacionesService.miasPublicaciones(true), usuariosService.creditos()]);
      setPubs(p.data); setCreditos(c.data);
    } catch { show('Error al cargar datos', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const movs = creditos.movimientos || [];
  const ganados  = movs.filter((m: any) => m.tipo === 'GANANCIA').reduce((a: number, m: any) => a + m.cantidad, 0);
  const gastados = movs.filter((m: any) => m.tipo === 'CONSUMO').reduce((a: number, m: any) => a + m.cantidad, 0);
  const paginated = pubs.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(pubs.length / PER_PAGE);

  const StatCard = ({ value, label, sub, dark }: { value: number; label: string; sub: string; dark?: boolean }) => (
    <motion.div whileHover={{ y: -3 }}
      className={`rounded-2xl p-5 flex items-start justify-between ${dark ? 'card-3d-dark' : 'card-3d'}`}>
      <div>
        <p className={`text-xs font-medium mb-1 ${dark ? 'text-white/60' : 'text-gray-400'}`}>{label}</p>
        <p className={`text-4xl font-black ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        <p className={`text-xs mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{sub}</p>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dark ? 'bg-white/15' : 'bg-gray-100'}`}>
        <ArrowUpRight size={16} className={dark ? 'text-white' : 'text-gray-500'} />
      </div>
    </motion.div>
  );

  return (
    <div className="p-7 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Hola, {user?.nombre}</h1>
          <p className="text-sm text-gray-400 mt-1">Acá podrás ver tus créditos y tus publicaciones</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/historial')} className="btn-outline text-sm flex items-center gap-2">
            Ver historial de créditos
          </button>
          <button onClick={() => { setEditPub(null); setModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Agregar publicación
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <StatCard value={ganados} label="Créditos ganados" sub={`Últimos créditos ganados en: xxxx`} dark />
        <StatCard value={gastados} label="Créditos gastados" sub="Últimos créditos gastados en: xxxx" />
        <StatCard value={pubs.filter(p => p.estado === 'ABIERTO').length} label="Servicios solicitados" sub="Último servicio solicitado es: xxxx" />
      </div>

      {/* Table */}
      <div className="card-3d overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nombre de la publicación ↕', 'Estado ↕', 'Créditos ↕', 'Horas ↕', 'Fecha de expiración ↕', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">Cargando...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No tienes publicaciones aún. ¡Crea una!</td></tr>
              ) : (
                paginated.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-gray-800 font-medium">{p.titulo}</td>
                    <td className="px-5 py-4">
                      <span className={p.estado === 'ABIERTO' ? 'badge-activo' : 'badge-cerrado'}>
                        {p.estado === 'ABIERTO' ? 'ACTIVO' : 'CERRADO'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{p.creditos_hora}</td>
                    <td className="px-5 py-4 text-gray-600">1</td>
                    <td className="px-5 py-4 text-gray-600">{dayjs(p.fecha_expiracion).format('DD/MM/YYYY')}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => { setEditPub(p); setModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-center gap-4">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="text-sm text-gray-500 hover:text-navy disabled:opacity-30">← </button>
            <span className="text-sm text-gray-500">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, pubs.length)} de {pubs.length} publicaciones</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="text-sm text-gray-500 hover:text-navy disabled:opacity-30">→</button>
          </div>
        )}
      </div>

      <PublicacionFormModal pub={editPub} open={modal} onClose={() => { setModal(false); setEditPub(null); }} onSuccess={load} />
    </div>
  );
}
