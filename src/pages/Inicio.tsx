import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import type { RootState } from '../store';
import { publicacionesService } from '../services/publicaciones';
import { categoriasService } from '../services/categorias';
import PublicacionCard, { type Publicacion } from '../components/PublicacionCard/PublicacionCard';
import { SolicitudModal } from '../components/Modals/SolicitudModal';
import { useToast } from '../components/ui/Toast';
import Select from '../components/ui/Select';

export default function Inicio() {
  const [params] = useSearchParams();
  const { show } = useToast();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);
  const q = params.get('q') || '';

  const [pubs, setPubs]             = useState<Publicacion[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [catFilter, setCatFilter]   = useState<number | null>(null);
  const [catName, setCatName]       = useState('');
  const [modal, setModal]           = useState<{ open: boolean; pub: Publicacion | null }>({ open: false, pub: null });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [pubRes, catRes] = await Promise.all([
        publicacionesService.listar({ categoria_id: catFilter ?? undefined, limit: 24 }),
        categoriasService.listar(),
      ]);
      let data = pubRes.data.data as Publicacion[];
      // Excluir las propias publicaciones del usuario
      data = data.filter(p => String(p.usuario_id) !== String(user?.id));
      if (q) data = data.filter(p => p.titulo.toLowerCase().includes(q.toLowerCase()));
      setPubs(data);
      setCategorias(catRes.data);
    } catch { show('Error al cargar publicaciones', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [catFilter, q]);

  const clearFilter = () => { setCatFilter(null); setCatName(''); };

  return (
    <div className="p-6 min-h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button
          onClick={() => setShowFilters(p => !p)}
          className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 text-sm text-gray-600 hover:text-navy transition-colors"
          style={{ boxShadow: 'var(--shadow-ui)' }}
        >
          <Filter size={14} /> Filtros
        </button>
        {q && (
          <span className="text-sm text-gray-600">Resultados para <strong>"{q}"</strong></span>
        )}
        {catName && (
          <div
            className="flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #003B54, #009ADB)', boxShadow: 'var(--shadow-dark)' }}
          >
            {catName}
            <button onClick={clearFilter} className="hover:opacity-70 transition-opacity"><X size={12} /></button>
          </div>
        )}
        {catName && (
          <button onClick={clearFilter} className="text-xs text-gray-400 hover:text-gray-600">Limpiar todo</button>
        )}
        <div className="ml-auto">
          <Select
            value={sortBy}
            onChange={setSortBy}
            placeholder="Ordenar por"
            options={[
              { value: 'recientes', label: 'Más recientes' },
              { value: 'valorados', label: 'Mejor valorados' },
              { value: 'creditos', label: 'Más créditos' },
            ]}
          />
        </div>
      </div>

      {/* Category filter dropdown */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-4">
          {categorias.map(c => (
            <button key={c.id}
              onClick={() => { setCatFilter(c.id); setCatName(c.nombre); setShowFilters(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                catFilter === c.id ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-navy/10 hover:text-navy'
              }`}>
              {c.nombre}
            </button>
          ))}
        </motion.div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6 pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : pubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg font-semibold">Sin publicaciones disponibles</p>
          <p className="text-sm mt-1">Intenta con otros filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6 pt-2">
          {pubs.map((pub, i) => (
            <PublicacionCard
              key={pub.id}
              pub={pub}
              index={i}
              onClick={(p) => setModal({ open: true, pub: p })}
            />
          ))}
        </div>
      )}

      <SolicitudModal
        pub={modal.pub}
        open={modal.open}
        onClose={() => setModal({ open: false, pub: null })}
        onSuccess={() => {
          setModal({ open: false, pub: null });
          navigate('/solicitudes/mis');
        }}
      />
    </div>
  );
}
